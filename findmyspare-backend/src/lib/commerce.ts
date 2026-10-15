import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  checkouts,
  orders,
  orderItems,
  products,
  escrowTransactions,
  notifications,
  payments,
  invoices,
  jobCards,
} from "../db/schema";
import { recordStockMovement } from "./stock";

// Delivery fee per seller parcel: free above the threshold (Swiggy-style).
export const FREE_DELIVERY_ABOVE = 999;
export const DELIVERY_FEE = 49;

export const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
export const deliveryFeeFor = (subtotal: number) => (subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE);

export type CartLine = { productId: string; quantity: number };

/** Validate a cart against live stock/prices and group it by seller. */
export async function priceCart(lines: CartLine[]) {
  const ids = [...new Set(lines.map((l) => l.productId))];
  if (!ids.length) throw new Error("Cart is empty");
  const rows = await db.select().from(products).where(and(inArray(products.id, ids), eq(products.status, "active")));
  const byId = new Map(rows.map((p) => [p.id, p]));
  const groups = new Map<string, { supplierId: string; lines: { product: typeof products.$inferSelect; quantity: number; subtotal: number }[]; subtotal: number }>();
  for (const l of lines) {
    const p = byId.get(l.productId);
    if (!p) throw new Error(`A product in your cart is no longer available`);
    if (p.stockQuantity < l.quantity) throw new Error(`Only ${p.stockQuantity} left of "${p.name}"`);
    const g = groups.get(p.supplierId) ?? { supplierId: p.supplierId, lines: [], subtotal: 0 };
    const subtotal = parseFloat(p.price) * l.quantity;
    g.lines.push({ product: p, quantity: l.quantity, subtotal });
    g.subtotal += subtotal;
    groups.set(p.supplierId, g);
  }
  const sellers = [...groups.values()].map((g) => ({ ...g, deliveryFee: deliveryFeeFor(g.subtotal) }));
  const itemsTotal = sellers.reduce((s, g) => s + g.subtotal, 0);
  const deliveryTotal = sellers.reduce((s, g) => s + g.deliveryFee, 0);
  return { sellers, itemsTotal, deliveryTotal, total: itemsTotal + deliveryTotal };
}

/** Create a checkout with one pending order per seller. Stock is reserved on payment. */
export async function createCartCheckout(buyerId: string, lines: CartLine[], shippingAddressId: string | null) {
  const priced = await priceCart(lines);
  const [checkout] = await db
    .insert(checkouts)
    .values({
      buyerId,
      shippingAddressId,
      itemsTotal: money(priced.itemsTotal),
      deliveryFee: money(priced.deliveryTotal),
      total: money(priced.total),
    })
    .returning();
  const autoCloseAt = new Date(Date.now() + 14 * 864e5);
  for (const g of priced.sellers) {
    const [order] = await db
      .insert(orders)
      .values({
        buyerId,
        supplierId: g.supplierId,
        status: "placed",
        paymentStatus: "pending",
        checkoutId: checkout.id,
        source: "cart",
        totalAmount: money(g.subtotal + g.deliveryFee),
        deliveryFee: money(g.deliveryFee),
        shippingAddressId,
        autoCloseAt,
      })
      .returning();
    await db.insert(orderItems).values(
      g.lines.map((l) => ({
        orderId: order.id,
        productId: l.product.id,
        quantity: l.quantity,
        unitPrice: l.product.price,
        subtotal: money(l.subtotal),
      }))
    );
  }
  return { checkout, priced };
}

/** Single-order checkout for an accepted quote. */
export async function createQuoteCheckout(buyerId: string, orderId: string, amount: string) {
  const [checkout] = await db
    .insert(checkouts)
    .values({ buyerId, itemsTotal: amount, deliveryFee: "0", total: amount })
    .returning();
  await db.update(orders).set({ checkoutId: checkout.id }).where(eq(orders.id, orderId));
  return checkout;
}

/** Payment succeeded: mark orders paid, reserve stock, hold escrow, notify sellers. Idempotent. */
export async function markCheckoutPaid(checkoutId: string, buyerId: string) {
  const list = await db
    .select()
    .from(orders)
    .where(and(eq(orders.checkoutId, checkoutId), eq(orders.paymentStatus, "pending")));
  for (const order of list) {
    const items = await db
      .select({ item: orderItems, product: products })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, order.id));
    for (const { item, product } of items) {
      // Stock can move between checkout and payment; never drive it negative.
      const take = Math.min(item.quantity, product.stockQuantity);
      if (take > 0) await recordStockMovement({ product, delta: -take, reason: "order", createdBy: buyerId });
    }
    await db.update(orders).set({ paymentStatus: "paid", updatedAt: new Date() }).where(eq(orders.id, order.id));
    await db.insert(escrowTransactions).values({ orderId: order.id, amount: order.totalAmount, status: "held" }).onConflictDoNothing();
    await db.insert(notifications).values({
      userId: order.supplierId,
      type: "new_order",
      title: "New paid order",
      message: `New order worth ₹${order.totalAmount}. Payment is held in FMS escrow until delivery.`,
      metadata: { orderId: order.id },
    });
  }
  return list.length;
}

/** Invoice payment (garage customer). Idempotent. */
export async function markInvoicePaid(invoiceId: string, method: string) {
  const [inv] = await db
    .update(invoices)
    .set({ status: "paid", paidAt: new Date(), paymentMethod: method })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.status, "unpaid")))
    .returning();
  if (inv) {
    await db.update(jobCards).set({ status: "paid", updatedAt: new Date() }).where(eq(jobCards.id, inv.jobCardId));
  }
  return inv;
}

/** Mock gateway: the only place a real provider (Razorpay/Cashfree) would plug in. */
export async function completeMockPayment(paymentId: string, outcome: "success" | "failure", method: string) {
  const [p] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!p) throw new Error("Payment not found");
  if (p.status !== "created") return p; // idempotent
  const providerRef = `mock_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;
  if (outcome === "failure") {
    const [failed] = await db
      .update(payments)
      .set({ status: "failed", method, providerRef, failureReason: "Declined by mock gateway", completedAt: new Date() })
      .where(eq(payments.id, paymentId))
      .returning();
    return failed;
  }
  const [ok] = await db
    .update(payments)
    .set({ status: "succeeded", method, providerRef, completedAt: new Date() })
    .where(eq(payments.id, paymentId))
    .returning();
  if (p.purpose === "checkout") await markCheckoutPaid(p.refId, p.payerId!);
  else await markInvoicePaid(p.refId, method);
  return ok;
}

export const sumSql = (col: unknown) => sql<string>`coalesce(sum(${col}), 0)::numeric(12,2)`;
