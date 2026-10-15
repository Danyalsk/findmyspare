import { Elysia, t } from "elysia";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  addresses,
  checkouts,
  orders,
  orderItems,
  products,
  payments,
  reviews,
  users,
  fitments,
  vehicles,
  escrowTransactions,
} from "../db/schema";
import { authGuard } from "../middleware/auth";
import {
  priceCart,
  createCartCheckout,
  completeMockPayment,
  money,
  FREE_DELIVERY_ABOVE,
  DELIVERY_FEE,
} from "../lib/commerce";

const cartBody = t.Array(t.Object({ productId: t.String(), quantity: t.Number({ minimum: 1, maximum: 50 }) }), { minItems: 1 });

export const checkoutRoutes = new Elysia()
  .use(authGuard)

  // ─── Price a cart (no writes): per-seller split, delivery fees ───
  .post(
    "/checkout/preview",
    async ({ body, set }) => {
      try {
        const priced = await priceCart(body.items);
        const supplierIds = priced.sellers.map((s) => s.supplierId);
        const names = supplierIds.length
          ? await db.select({ id: users.id, name: users.businessName, fallback: users.name }).from(users).where(inArray(users.id, supplierIds))
          : [];
        const nameOf = new Map(names.map((n) => [n.id, n.name || n.fallback || "Seller"]));
        return {
          sellers: priced.sellers.map((s) => ({
            supplierId: s.supplierId,
            supplierName: nameOf.get(s.supplierId),
            subtotal: money(s.subtotal),
            deliveryFee: money(s.deliveryFee),
            lines: s.lines.map((l) => ({ productId: l.product.id, name: l.product.name, quantity: l.quantity, unitPrice: l.product.price, subtotal: money(l.subtotal) })),
          })),
          itemsTotal: money(priced.itemsTotal),
          deliveryTotal: money(priced.deliveryTotal),
          total: money(priced.total),
          freeDeliveryAbove: FREE_DELIVERY_ABOVE,
          deliveryFee: DELIVERY_FEE,
        };
      } catch (e) {
        set.status = 400;
        return { error: (e as Error).message };
      }
    },
    { body: t.Object({ items: cartBody }), detail: { summary: "Price a cart split by seller", tags: ["Checkout"] } }
  )

  // ─── Create checkout (pending orders, one per seller) ───
  .post(
    "/checkout",
    async ({ body, user, set }) => {
      if (body.shippingAddressId) {
        const [addr] = await db.select({ id: addresses.id }).from(addresses)
          .where(and(eq(addresses.id, body.shippingAddressId), eq(addresses.userId, user.id))).limit(1);
        if (!addr) { set.status = 400; return { error: "Address not found" }; }
      }
      try {
        const { checkout } = await createCartCheckout(user.id, body.items, body.shippingAddressId ?? null);
        set.status = 201;
        return { checkoutId: checkout.id, total: checkout.total };
      } catch (e) {
        set.status = 400;
        return { error: (e as Error).message };
      }
    },
    {
      body: t.Object({ items: cartBody, shippingAddressId: t.Optional(t.String()) }),
      detail: { summary: "Create a checkout from the cart", tags: ["Checkout"] },
    }
  )

  // ─── Checkout detail (for the payment page) ───
  .get(
    "/checkout/:id",
    async ({ params, user, set }) => {
      const [c] = await db.select().from(checkouts).where(and(eq(checkouts.id, params.id), eq(checkouts.buyerId, user.id))).limit(1);
      if (!c) { set.status = 404; return { error: "Checkout not found" }; }
      const list = await db
        .select({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus, totalAmount: orders.totalAmount, deliveryFee: orders.deliveryFee, source: orders.source, supplierName: users.businessName })
        .from(orders)
        .leftJoin(users, eq(users.id, orders.supplierId))
        .where(eq(orders.checkoutId, c.id));
      const items = list.length
        ? await db.select({ orderId: orderItems.orderId, name: products.name, quantity: orderItems.quantity, subtotal: orderItems.subtotal })
            .from(orderItems).innerJoin(products, eq(products.id, orderItems.productId))
            .where(inArray(orderItems.orderId, list.map((o) => o.id)))
        : [];
      return { checkout: c, orders: list.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })) };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Checkout"] } }
  )

  // ─── Start a payment for a checkout ───
  .post(
    "/payments",
    async ({ body, user, set }) => {
      const [c] = await db.select().from(checkouts).where(and(eq(checkouts.id, body.checkoutId), eq(checkouts.buyerId, user.id))).limit(1);
      if (!c) { set.status = 404; return { error: "Checkout not found" }; }
      const pending = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.checkoutId, c.id), eq(orders.paymentStatus, "pending")));
      if (!pending.length) { set.status = 409; return { error: "This checkout is already paid" }; }
      const [p] = await db.insert(payments).values({ purpose: "checkout", refId: c.id, payerId: user.id, amount: c.total }).returning();
      set.status = 201;
      return { payment: p };
    },
    { body: t.Object({ checkoutId: t.String() }), detail: { summary: "Create a (mock) payment for a checkout", tags: ["Payments"] } }
  )

  // ─── Mock gateway callback: the user picked a method and the outcome ───
  .post(
    "/payments/:id/complete",
    async ({ params, body, user, set }) => {
      const [p] = await db.select().from(payments).where(eq(payments.id, params.id)).limit(1);
      if (!p || p.payerId !== user.id) { set.status = 404; return { error: "Payment not found" }; }
      const result = await completeMockPayment(p.id, body.outcome, body.method);
      return { payment: result };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        method: t.Union([t.Literal("upi"), t.Literal("card"), t.Literal("netbanking"), t.Literal("cod")]),
        outcome: t.Union([t.Literal("success"), t.Literal("failure")]),
      }),
      detail: { summary: "Complete a mock payment (prototype gateway)", tags: ["Payments"] },
    }
  )

  // ─── Review + "Did it fit?" for a delivered order ───
  .post(
    "/orders/:id/review",
    async ({ params, body, user, set }) => {
      const [order] = await db.select().from(orders).where(and(eq(orders.id, params.id), eq(orders.buyerId, user.id))).limit(1);
      if (!order) { set.status = 404; return { error: "Order not found" }; }
      if (!["delivered", "completed"].includes(order.status)) { set.status = 400; return { error: "You can review after delivery" }; }
      let vehicle: { make: string; model: string; variant?: string; year?: number } | null = null;
      if (body.vehicleId) {
        const [v] = await db.select().from(vehicles).where(and(eq(vehicles.id, body.vehicleId), eq(vehicles.ownerId, user.id))).limit(1);
        if (v) vehicle = { make: v.makeName, model: v.modelName, variant: v.variantName ?? undefined, year: v.year ?? undefined };
      }
      const items = await db.select({ productId: orderItems.productId, partNumber: products.partNumber })
        .from(orderItems).innerJoin(products, eq(products.id, orderItems.productId)).where(eq(orderItems.orderId, order.id));
      const targets = body.productId ? items.filter((i) => i.productId === body.productId) : items.length ? items : [{ productId: null as unknown as string, partNumber: null }];
      for (const it of targets) {
        await db.insert(reviews).values({
          orderId: order.id,
          productId: it.productId,
          supplierId: order.supplierId,
          buyerId: user.id,
          rating: body.rating,
          comment: body.comment ?? null,
          fitConfirmed: body.fitConfirmed ?? null,
          vehicle,
        }).onConflictDoNothing();
        // Every confirmed fit grows the fitment graph.
        if (body.fitConfirmed && vehicle && it.productId) {
          await db.insert(fitments).values({
            productId: it.productId, partNumber: it.partNumber, makeName: vehicle.make, modelName: vehicle.model,
            variantName: vehicle.variant ?? null, year: vehicle.year ?? null, source: "order_confirmed", confirmedBy: user.id,
          });
        }
      }
      if (order.status === "delivered") {
        await db.update(orders).set({ status: "completed", closedAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, order.id));
        await db.update(escrowTransactions).set({ status: "released", releasedAt: new Date() }).where(eq(escrowTransactions.orderId, order.id));
      }
      set.status = 201;
      return { ok: true };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 5 }),
        comment: t.Optional(t.String({ maxLength: 1000 })),
        fitConfirmed: t.Optional(t.Boolean()),
        vehicleId: t.Optional(t.String()),
        productId: t.Optional(t.String()),
      }),
      detail: { summary: "Rate a delivered order and confirm fitment", tags: ["Orders"] },
    }
  );
