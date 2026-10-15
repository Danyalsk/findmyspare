import { Elysia, t } from "elysia";
import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  users,
  products,
  orders,
  inquiries,
  notifications,
  tradeLinks,
  priceLists,
  priceListItems,
  purchaseOrders,
  ledgerEntries,
  salesBills,
  searchEvents,
  industries,
  BUSINESS_ROLES,
  type PoLine,
  type BillLine,
} from "../db/schema";
import { authGuard } from "../middleware/auth";
import { recordStockMovement } from "../lib/stock";

/* Business OS for every supply-chain tier: profile + daily tasks, directory,
   trade links, price lists, purchase orders, credit ledger (khata), counter
   billing, demand radar, catalog import. */

const r2 = (n: number) => Math.round(n * 100) / 100;
const m = (n: number) => r2(n).toFixed(2);
const isSeller = (u: { role?: string | null; verificationStatus?: string | null }) => u.role === "supplier" && u.verificationStatus === "approved";

function lineTotals(lines: { quantity: number; unitPrice: string; gstRate: number }[]) {
  let subtotal = 0, tax = 0;
  for (const l of lines) { const v = l.quantity * parseFloat(l.unitPrice); subtotal += v; tax += (v * l.gstRate) / 100; }
  return { subtotal: m(subtotal), tax: m(tax), total: m(subtotal + tax) };
}

/** The price a buyer pays a supplier for a product: price-list override, else list discount, else listing price. */
async function priceFor(supplierId: string, buyerId: string, productIds: string[]) {
  const [link] = await db.select().from(tradeLinks).where(and(eq(tradeLinks.supplierId, supplierId), eq(tradeLinks.buyerId, buyerId))).limit(1);
  const list = link?.priceListId ? (await db.select().from(priceLists).where(eq(priceLists.id, link.priceListId)).limit(1))[0] : null;
  const overrides = list && productIds.length
    ? await db.select().from(priceListItems).where(and(eq(priceListItems.priceListId, list.id), inArray(priceListItems.productId, productIds)))
    : [];
  const disc = list ? parseFloat(list.discountPct) : 0;
  return {
    link,
    list,
    // Tier price applies once the quantity reaches the price-list item's minimum.
    price: (p: { id: string; price: string }, qty = 1) => {
      const o = overrides.find((x) => x.productId === p.id);
      return o && qty >= o.minQty ? parseFloat(o.price) : r2(parseFloat(p.price) * (1 - disc / 100));
    },
    tier: (p: { id: string }) => {
      const o = overrides.find((x) => x.productId === p.id);
      return o ? { price: o.price, minQty: o.minQty } : null;
    },
  };
}

async function nextNumber(prefix: string, table: typeof purchaseOrders | typeof salesBills, col: typeof purchaseOrders.buyerId | typeof salesBills.sellerId, ownerId: string) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(eq(col, ownerId));
  return `${prefix}-${new Date().getFullYear()}-${String(n + 1).padStart(4, "0")}`;
}

export const networkRoutes = new Elysia({ prefix: "/biz" })
  .use(authGuard)

  // ─── Profile + today's tasks (no fake numbers: everything is live) ───
  .get(
    "/me",
    async ({ user }) => {
      const [me] = await db.select({
        id: users.id, name: users.name, businessName: users.businessName, city: users.city, role: users.role,
        verificationStatus: users.verificationStatus, businessRoles: users.businessRoles, industries: users.industries,
      }).from(users).where(eq(users.id, user.id)).limit(1);
      const [s] = await db.execute<Record<string, string | number>>(sql`
        SELECT
          (SELECT count(*)::int FROM orders WHERE supplier_id = ${user.id} AND payment_status = 'paid' AND status IN ('placed','confirmed')) AS orders_to_pack,
          (SELECT count(*)::int FROM purchase_orders WHERE seller_id = ${user.id} AND status = 'sent') AS pos_to_accept,
          (SELECT count(*)::int FROM purchase_orders WHERE seller_id = ${user.id} AND status = 'accepted') AS pos_to_ship,
          (SELECT count(*)::int FROM purchase_orders WHERE buyer_id = ${user.id} AND status = 'shipped') AS pos_to_receive,
          (SELECT count(*)::int FROM purchase_orders WHERE buyer_id = ${user.id} AND status IN ('sent','accepted')) AS pos_waiting,
          (SELECT count(*)::int FROM products WHERE supplier_id = ${user.id} AND status IN ('active','out_of_stock') AND stock_quantity <= low_stock_threshold) AS low_stock,
          (SELECT count(*)::int FROM products WHERE supplier_id = ${user.id} AND status <> 'deleted') AS listings,
          (SELECT coalesce(sum(amount),0)::numeric(14,2)::text FROM ledger_entries WHERE owner_id = ${user.id}) AS receivable,
          (SELECT coalesce(sum(amount),0)::numeric(14,2)::text FROM ledger_entries WHERE counterparty_id = ${user.id}) AS payable,
          (SELECT coalesce(sum(total),0)::numeric(14,2)::text FROM sales_bills WHERE seller_id = ${user.id} AND created_at::date = now()::date) AS sales_today,
          (SELECT count(*)::int FROM sales_bills WHERE seller_id = ${user.id} AND created_at::date = now()::date) AS bills_today,
          (SELECT coalesce(sum(total),0)::numeric(14,2)::text FROM sales_bills WHERE seller_id = ${user.id} AND date_trunc('month', created_at) = date_trunc('month', now())) AS sales_month,
          (SELECT count(*)::int FROM trade_links WHERE (supplier_id = ${user.id} OR buyer_id = ${user.id}) AND status = 'pending' AND requested_by <> ${user.id}) AS link_requests,
          (SELECT count(*)::int FROM trade_links WHERE supplier_id = ${user.id} AND status = 'active') AS buyers,
          (SELECT count(*)::int FROM trade_links WHERE buyer_id = ${user.id} AND status = 'active') AS suppliers,
          (SELECT count(*)::int FROM inquiries WHERE is_active AND created_at > now() - interval '14 days') AS open_requests
      `);
      return { me, today: s };
    },
    { detail: { summary: "Business profile + live task counts", tags: ["Business"] } }
  )

  .patch(
    "/profile",
    async ({ body, user }) => {
      const roles = body.businessRoles.filter((r) => (BUSINESS_ROLES as readonly string[]).includes(r));
      const valid = (await db.select({ slug: industries.slug }).from(industries)).map((i) => i.slug);
      const inds = body.industries.filter((s) => valid.includes(s));
      const [u] = await db.update(users).set({ businessRoles: roles, industries: inds, updatedAt: new Date() }).where(eq(users.id, user.id))
        .returning({ businessRoles: users.businessRoles, industries: users.industries });
      return { profile: u };
    },
    { body: t.Object({ businessRoles: t.Array(t.String(), { maxItems: 12 }), industries: t.Array(t.String(), { maxItems: 20 }) }), detail: { tags: ["Business"] } }
  )

  // ─── Directory: find suppliers / buyers to trade with ───
  .get(
    "/directory",
    async ({ query, user }) => {
      const conds = [eq(users.role, "supplier"), eq(users.verificationStatus, "approved"), ne(users.id, user.id), eq(users.isActive, true)];
      if (query.role) conds.push(sql`${users.businessRoles} @> ${JSON.stringify([query.role])}::jsonb`);
      if (query.industry) conds.push(sql`${users.industries} @> ${JSON.stringify([query.industry])}::jsonb`);
      if (query.q) conds.push(or(ilike(users.businessName, `%${query.q}%`), ilike(users.city, `%${query.q}%`))!);
      const rows = await db.select({
        id: users.id, businessName: users.businessName, name: users.name, city: users.city,
        businessRoles: users.businessRoles, industries: users.industries,
        listings: sql<number>`(SELECT count(*)::int FROM products p WHERE p.supplier_id = ${users.id} AND p.status IN ('active','out_of_stock'))`,
        linkAsBuyer: sql<string | null>`(SELECT status::text FROM trade_links l WHERE l.supplier_id = ${users.id} AND l.buyer_id = ${user.id})`,
        linkAsSupplier: sql<string | null>`(SELECT status::text FROM trade_links l WHERE l.supplier_id = ${user.id} AND l.buyer_id = ${users.id})`,
      }).from(users).where(and(...conds)).orderBy(users.businessName).limit(100);
      return { businesses: rows };
    },
    { query: t.Object({ role: t.Optional(t.String()), industry: t.Optional(t.String()), q: t.Optional(t.String()) }), detail: { tags: ["Business"] } }
  )

  // ─── Trade links ───
  .post(
    "/links",
    async ({ body, user, set }) => {
      const otherId = body.supplierId ?? body.buyerId;
      if (!otherId || otherId === user.id) { set.status = 400; return { error: "Pick a business to connect with" }; }
      const supplierId = body.supplierId ?? user.id;
      const buyerId = body.buyerId ?? user.id;
      if (body.buyerId && !isSeller(user)) { set.status = 403; return { error: "Only verified sellers can add buyers" }; }
      const [other] = await db.select({ id: users.id, name: users.businessName }).from(users).where(eq(users.id, otherId)).limit(1);
      if (!other) { set.status = 404; return { error: "Business not found" }; }
      const [link] = await db.insert(tradeLinks).values({ supplierId, buyerId, requestedBy: user.id }).onConflictDoNothing().returning();
      if (!link) { set.status = 409; return { error: "You're already connected (or a request is pending)" }; }
      await db.insert(notifications).values({
        userId: otherId, type: "trade_link", title: "New trade connection request",
        message: `${user.businessName ?? user.name} wants to trade with you on FindMySpare.`, metadata: { linkId: link.id },
      });
      set.status = 201;
      return { link };
    },
    { body: t.Object({ supplierId: t.Optional(t.String()), buyerId: t.Optional(t.String()) }), detail: { tags: ["Business"] } }
  )

  .get(
    "/links",
    async ({ user }) => {
      const rows = await db.execute<{ id: string; status: string; supplier_id: string; buyer_id: string; requested_by: string; credit_limit: string; credit_days: number; price_list_id: string | null; price_list_name: string | null; other_id: string; other_name: string | null; other_city: string | null; other_roles: string[] | null; direction: "supplier" | "buyer"; balance: string }>(sql`
        SELECT l.id, l.status::text, l.supplier_id, l.buyer_id, l.requested_by, l.credit_limit::text, l.credit_days, l.price_list_id,
               pl.name AS price_list_name,
               u.id AS other_id, coalesce(u.business_name, u.name) AS other_name, u.city AS other_city, u.business_roles AS other_roles,
               CASE WHEN l.buyer_id = ${user.id} THEN 'supplier' ELSE 'buyer' END AS direction,
               coalesce((SELECT sum(amount) FROM ledger_entries e WHERE e.owner_id = l.supplier_id AND e.counterparty_id = l.buyer_id), 0)::numeric(14,2)::text AS balance
        FROM trade_links l
        JOIN users u ON u.id = CASE WHEN l.buyer_id = ${user.id} THEN l.supplier_id ELSE l.buyer_id END
        LEFT JOIN price_lists pl ON pl.id = l.price_list_id
        WHERE l.supplier_id = ${user.id} OR l.buyer_id = ${user.id}
        ORDER BY l.created_at DESC`);
      return { links: [...rows] };
    },
    { detail: { tags: ["Business"] } }
  )

  .post(
    "/links/:id/decision",
    async ({ params, body, user, set }) => {
      const [l] = await db.select().from(tradeLinks).where(eq(tradeLinks.id, params.id)).limit(1);
      if (!l || (l.supplierId !== user.id && l.buyerId !== user.id) || l.requestedBy === user.id) { set.status = 404; return { error: "Request not found" }; }
      const [u] = await db.update(tradeLinks).set({ status: body.accept ? "active" : "blocked" }).where(eq(tradeLinks.id, l.id)).returning();
      await db.insert(notifications).values({ userId: l.requestedBy, type: "trade_link", title: body.accept ? "Connection accepted" : "Connection declined", message: `${user.businessName ?? user.name} ${body.accept ? "accepted" : "declined"} your trade request.`, metadata: { linkId: l.id } });
      return { link: u };
    },
    { params: t.Object({ id: t.String() }), body: t.Object({ accept: t.Boolean() }), detail: { tags: ["Business"] } }
  )

  .patch(
    "/links/:id",
    async ({ params, body, user, set }) => {
      const [l] = await db.select().from(tradeLinks).where(and(eq(tradeLinks.id, params.id), eq(tradeLinks.supplierId, user.id))).limit(1);
      if (!l) { set.status = 404; return { error: "Only the supplier can set terms" }; }
      if (body.priceListId) {
        const [pl] = await db.select().from(priceLists).where(and(eq(priceLists.id, body.priceListId), eq(priceLists.ownerId, user.id))).limit(1);
        if (!pl) { set.status = 400; return { error: "Price list not found" }; }
      }
      const [u] = await db.update(tradeLinks).set({
        ...(body.priceListId !== undefined ? { priceListId: body.priceListId || null } : {}),
        ...(body.creditLimit !== undefined ? { creditLimit: m(body.creditLimit) } : {}),
        ...(body.creditDays !== undefined ? { creditDays: body.creditDays } : {}),
      }).where(eq(tradeLinks.id, l.id)).returning();
      return { link: u };
    },
    { params: t.Object({ id: t.String() }), body: t.Object({ priceListId: t.Optional(t.String()), creditLimit: t.Optional(t.Number({ minimum: 0 })), creditDays: t.Optional(t.Number({ minimum: 0, maximum: 180 })) }), detail: { tags: ["Business"] } }
  )

  // ─── Price lists ───
  .get(
    "/price-lists",
    async ({ user }) => {
      const lists = await db.select().from(priceLists).where(eq(priceLists.ownerId, user.id)).orderBy(priceLists.createdAt);
      const items = lists.length ? await db.select({ i: priceListItems, name: products.name, listPrice: products.price }).from(priceListItems)
        .innerJoin(products, eq(products.id, priceListItems.productId)).where(inArray(priceListItems.priceListId, lists.map((l) => l.id))) : [];
      return { priceLists: lists.map((l) => ({ ...l, items: items.filter((x) => x.i.priceListId === l.id).map((x) => ({ ...x.i, name: x.name, listPrice: x.listPrice })) })) };
    },
    { detail: { tags: ["Business"] } }
  )
  .post(
    "/price-lists",
    async ({ body, user, set }) => {
      if (!isSeller(user)) { set.status = 403; return { error: "Verified sellers only" }; }
      const [pl] = await db.insert(priceLists).values({ ownerId: user.id, name: body.name, discountPct: m(body.discountPct ?? 0) }).returning();
      set.status = 201;
      return { priceList: pl };
    },
    { body: t.Object({ name: t.String({ minLength: 2, maxLength: 80 }), discountPct: t.Optional(t.Number({ minimum: 0, maximum: 90 })) }), detail: { tags: ["Business"] } }
  )
  .post(
    "/price-lists/:id/items",
    async ({ params, body, user, set }) => {
      const [pl] = await db.select().from(priceLists).where(and(eq(priceLists.id, params.id), eq(priceLists.ownerId, user.id))).limit(1);
      const [p] = await db.select().from(products).where(and(eq(products.id, body.productId), eq(products.supplierId, user.id))).limit(1);
      if (!pl || !p) { set.status = 404; return { error: "Price list or product not found" }; }
      const [it] = await db.insert(priceListItems).values({ priceListId: pl.id, productId: p.id, price: m(body.price), minQty: body.minQty ?? 1 })
        .onConflictDoUpdate({ target: [priceListItems.priceListId, priceListItems.productId], set: { price: m(body.price), minQty: body.minQty ?? 1 } }).returning();
      return { item: it };
    },
    { params: t.Object({ id: t.String() }), body: t.Object({ productId: t.String(), price: t.Number({ minimum: 0 }), minQty: t.Optional(t.Number({ minimum: 1 })) }), detail: { tags: ["Business"] } }
  )

  // ─── A supplier's catalog, priced for me ───
  .get(
    "/suppliers/:supplierId/catalog",
    async ({ params, query, user, set }) => {
      const pr = await priceFor(params.supplierId, user.id, []);
      if (!pr.link || pr.link.status !== "active") { set.status = 403; return { error: "Connect with this supplier first" }; }
      const conds = [eq(products.supplierId, params.supplierId), inArray(products.status, ["active", "out_of_stock"])];
      if (query.q) conds.push(or(ilike(products.name, `%${query.q}%`), ilike(products.partNumber, `%${query.q}%`), ilike(products.brand, `%${query.q}%`))!);
      const list = await db.select().from(products).where(and(...conds)).orderBy(products.name).limit(200);
      const priced = await priceFor(params.supplierId, user.id, list.map((p) => p.id));
      const [sup] = await db.select({ businessName: users.businessName, city: users.city }).from(users).where(eq(users.id, params.supplierId)).limit(1);
      return {
        supplier: { id: params.supplierId, ...sup },
        terms: { creditDays: pr.link.creditDays, creditLimit: pr.link.creditLimit, priceList: priced.list?.name ?? null },
        products: list.map((p) => ({ id: p.id, name: p.name, brand: p.brand, partNumber: p.partNumber, category: p.category, industrySlug: p.industrySlug, stockQuantity: p.stockQuantity, moq: p.moq, listPrice: p.price, yourPrice: m(priced.price(p)), tier: priced.tier(p) })),
      };
    },
    { params: t.Object({ supplierId: t.String() }), query: t.Object({ q: t.Optional(t.String()) }), detail: { tags: ["Business"] } }
  )

  // ─── Purchase orders ───
  .post(
    "/pos",
    async ({ body, user, set }) => {
      const pr0 = await priceFor(body.sellerId, user.id, []);
      if (!pr0.link || pr0.link.status !== "active") { set.status = 403; return { error: "Connect with this supplier first" }; }
      const ids = body.lines.map((l) => l.productId);
      const list = await db.select().from(products).where(and(eq(products.supplierId, body.sellerId), inArray(products.id, ids)));
      if (list.length !== new Set(ids).size) { set.status = 400; return { error: "Some items are not in this supplier's catalog" }; }
      const pr = await priceFor(body.sellerId, user.id, ids);
      const lines: PoLine[] = [];
      for (const l of body.lines) {
        const p = list.find((x) => x.id === l.productId)!;
        if (l.quantity < p.moq) { set.status = 400; return { error: `Minimum order for ${p.name} is ${p.moq}` }; }
        const unit = pr.price(p, l.quantity);
        lines.push({ productId: p.id, name: p.name, partNumber: p.partNumber, brand: p.brand, quantity: l.quantity, unitPrice: m(unit), gstRate: 18, total: m(unit * l.quantity * 1.18) });
      }
      const tot = lineTotals(lines);
      const terms = body.paymentTerms ?? (pr0.link.creditDays > 0 ? "credit" : "advance");
      if (terms === "credit") {
        const [{ bal }] = await db.select({ bal: sql<string>`coalesce(sum(${ledgerEntries.amount}),0)::text` }).from(ledgerEntries)
          .where(and(eq(ledgerEntries.ownerId, body.sellerId), eq(ledgerEntries.counterpartyId, user.id)));
        const limit = parseFloat(pr0.link.creditLimit);
        if (limit > 0 && parseFloat(bal) + parseFloat(tot.total) > limit) {
          set.status = 400;
          return { error: `This order would exceed your credit limit with this supplier (₹${limit.toLocaleString("en-IN")}). Pay the outstanding ₹${parseFloat(bal).toLocaleString("en-IN")} or choose advance payment.` };
        }
      }
      const [po] = await db.insert(purchaseOrders).values({
        number: await nextNumber("PO", purchaseOrders, purchaseOrders.buyerId, user.id),
        buyerId: user.id, sellerId: body.sellerId, lines, ...tot, paymentTerms: terms, note: body.note ?? null,
      }).returning();
      await db.insert(notifications).values({ userId: body.sellerId, type: "purchase_order", title: `New purchase order ${po.number}`, message: `${user.businessName ?? user.name} ordered ${lines.length} item(s) worth ₹${tot.total}.`, metadata: { poId: po.id } });
      set.status = 201;
      return { po };
    },
    {
      body: t.Object({
        sellerId: t.String(),
        lines: t.Array(t.Object({ productId: t.String(), quantity: t.Number({ minimum: 1, maximum: 100000 }) }), { minItems: 1, maxItems: 200 }),
        note: t.Optional(t.String({ maxLength: 500 })),
        paymentTerms: t.Optional(t.Union([t.Literal("credit"), t.Literal("advance")])),
      }),
      detail: { summary: "Place a purchase order with a connected supplier", tags: ["Business"] },
    }
  )

  .get(
    "/pos",
    async ({ query, user }) => {
      const dir = query.direction === "in" ? eq(purchaseOrders.sellerId, user.id) : eq(purchaseOrders.buyerId, user.id);
      const rows = await db.select({ po: purchaseOrders, buyerName: sql<string>`(SELECT coalesce(business_name, name) FROM users WHERE id = ${purchaseOrders.buyerId})`, sellerName: sql<string>`(SELECT coalesce(business_name, name) FROM users WHERE id = ${purchaseOrders.sellerId})` })
        .from(purchaseOrders).where(dir).orderBy(desc(purchaseOrders.createdAt)).limit(100);
      return { pos: rows.map((r) => ({ ...r.po, buyerName: r.buyerName, sellerName: r.sellerName })) };
    },
    { query: t.Object({ direction: t.Optional(t.String()) }), detail: { tags: ["Business"] } }
  )

  .get(
    "/pos/:id",
    async ({ params, user, set }) => {
      const [po] = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, params.id), or(eq(purchaseOrders.buyerId, user.id), eq(purchaseOrders.sellerId, user.id)))).limit(1);
      if (!po) { set.status = 404; return { error: "PO not found" }; }
      const parties = await db.select({ id: users.id, name: sql<string>`coalesce(${users.businessName}, ${users.name})`, city: users.city, gst: users.gstNumber }).from(users).where(inArray(users.id, [po.buyerId, po.sellerId]));
      return { po, buyer: parties.find((p) => p.id === po.buyerId), seller: parties.find((p) => p.id === po.sellerId), role: po.sellerId === user.id ? "seller" : "buyer" };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Business"] } }
  )

  .post(
    "/pos/:id/action",
    async ({ params, body, user, set }) => {
      const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, params.id)).limit(1);
      if (!po || (po.buyerId !== user.id && po.sellerId !== user.id)) { set.status = 404; return { error: "PO not found" }; }
      const asSeller = po.sellerId === user.id;
      const allowed: Record<string, [boolean, string[]]> = {
        accept: [true, ["sent"]], reject: [true, ["sent"]], ship: [true, ["accepted"]],
        receive: [false, ["shipped"]], cancel: [false, ["sent"]],
      };
      const [needSeller, from] = allowed[body.action]!;
      if (needSeller !== asSeller) { set.status = 403; return { error: `Only the ${needSeller ? "seller" : "buyer"} can ${body.action} this PO` }; }
      if (!from.includes(po.status)) { set.status = 400; return { error: `Can't ${body.action} a PO that is ${po.status}` }; }
      const next = { accept: "accepted", reject: "rejected", ship: "shipped", receive: "received", cancel: "cancelled" }[body.action] as typeof po.status;
      const patch: Partial<typeof purchaseOrders.$inferInsert> = { status: next, updatedAt: new Date() };
      if (body.note) patch[asSeller ? "sellerNote" : "note"] = body.note;
      if (body.action === "ship") {
        patch.trackingNote = body.tracking ?? null;
        // Dispatch: stock leaves the seller, the invoice posts to the seller's khata.
        const [link] = await db.select().from(tradeLinks).where(and(eq(tradeLinks.supplierId, po.sellerId), eq(tradeLinks.buyerId, po.buyerId))).limit(1);
        const days = po.paymentTerms === "credit" ? link?.creditDays ?? 0 : 0;
        patch.dueDate = new Date(Date.now() + days * 864e5);
        for (const l of po.lines) {
          const [p] = await db.select().from(products).where(eq(products.id, l.productId)).limit(1);
          const take = p ? Math.min(l.quantity, p.stockQuantity) : 0;
          if (p && take > 0) await recordStockMovement({ product: p, delta: -take, reason: "sale", note: `PO ${po.number}`, createdBy: user.id });
        }
        await db.insert(ledgerEntries).values({ ownerId: po.sellerId, counterpartyId: po.buyerId, type: "invoice", amount: po.total, refType: "po", refId: po.id, note: `PO ${po.number}` });
      }
      if (body.action === "receive") {
        // Goods in: add to the buyer's own stock. Matching listing by part number (or name+brand);
        // otherwise create a private draft listing they can price and publish.
        for (const l of po.lines) {
          const cond = l.partNumber
            ? and(eq(products.supplierId, po.buyerId), eq(products.partNumber, l.partNumber))
            : and(eq(products.supplierId, po.buyerId), eq(products.name, l.name));
          let [mine] = await db.select().from(products).where(and(cond!, ne(products.status, "deleted"))).limit(1);
          if (!mine) {
            const [src] = await db.select().from(products).where(eq(products.id, l.productId)).limit(1);
            [mine] = await db.insert(products).values({
              supplierId: po.buyerId, name: l.name, brand: l.brand ?? null, partNumber: l.partNumber ?? null,
              category: src?.category ?? null, industrySlug: src?.industrySlug ?? "automotive", machineType: src?.machineType ?? null,
              description: src?.description ?? null, specifications: src?.specifications ?? {}, compatibleVehicles: src?.compatibleVehicles ?? [],
              attributes: src?.attributes ?? {}, partType: src?.partType ?? "aftermarket", mrp: src?.mrp ?? null,
              // Suggested retail: list price, or cost + 25%.
              price: src?.price && parseFloat(src.price) > parseFloat(l.unitPrice) ? src.price : m(parseFloat(l.unitPrice) * 1.25),
              stockQuantity: 0, status: "draft",
            }).returning();
          }
          await recordStockMovement({ product: mine!, delta: l.quantity, reason: "purchase", note: `PO ${po.number}`, createdBy: user.id });
        }
      }
      const [u] = await db.update(purchaseOrders).set(patch).where(eq(purchaseOrders.id, po.id)).returning();
      await db.insert(notifications).values({ userId: asSeller ? po.buyerId : po.sellerId, type: "purchase_order", title: `PO ${po.number} ${next}`, message: `${user.businessName ?? user.name} marked it ${next}.`, metadata: { poId: po.id } });
      return { po: u };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ action: t.Union([t.Literal("accept"), t.Literal("reject"), t.Literal("ship"), t.Literal("receive"), t.Literal("cancel")]), note: t.Optional(t.String({ maxLength: 300 })), tracking: t.Optional(t.String({ maxLength: 200 })) }),
      detail: { tags: ["Business"] },
    }
  )

  // ─── Khata (credit book) ───
  .get(
    "/khata",
    async ({ user }) => {
      const receivable = await db.execute<{ key: string; counterparty_id: string | null; name: string | null; phone: string | null; balance: string; last_at: string; overdue: string }>(sql`
        SELECT coalesce(e.counterparty_id::text, e.counterparty_phone, e.counterparty_name) AS key,
               e.counterparty_id, coalesce(max(u.business_name), max(u.name), max(e.counterparty_name)) AS name,
               coalesce(max(u.phone), max(e.counterparty_phone)) AS phone,
               sum(e.amount)::numeric(14,2)::text AS balance, max(e.created_at) AS last_at,
               coalesce((SELECT sum(p.total) FROM purchase_orders p WHERE p.seller_id = ${user.id} AND p.buyer_id = e.counterparty_id AND p.due_date < now() AND p.status IN ('shipped','received')), 0)::numeric(14,2)::text AS overdue
        FROM ledger_entries e LEFT JOIN users u ON u.id = e.counterparty_id
        WHERE e.owner_id = ${user.id}
        GROUP BY 1, 2 ORDER BY sum(e.amount) DESC`);
      const payable = await db.execute<{ owner_id: string; name: string | null; balance: string }>(sql`
        SELECT e.owner_id, coalesce(max(u.business_name), max(u.name)) AS name, sum(e.amount)::numeric(14,2)::text AS balance
        FROM ledger_entries e JOIN users u ON u.id = e.owner_id
        WHERE e.counterparty_id = ${user.id} GROUP BY 1 HAVING sum(e.amount) <> 0 ORDER BY 3 DESC`);
      return { receivable: [...receivable], payable: [...payable] };
    },
    { detail: { tags: ["Business"] } }
  )
  .get(
    "/khata/entries",
    async ({ query, user }) => {
      const who = query.counterpartyId ? eq(ledgerEntries.counterpartyId, query.counterpartyId)
        : query.phone ? eq(ledgerEntries.counterpartyPhone, query.phone) : eq(ledgerEntries.counterpartyName, query.name ?? "");
      const rows = await db.select().from(ledgerEntries).where(and(eq(ledgerEntries.ownerId, user.id), who)).orderBy(desc(ledgerEntries.createdAt)).limit(200);
      return { entries: rows };
    },
    { query: t.Object({ counterpartyId: t.Optional(t.String()), phone: t.Optional(t.String()), name: t.Optional(t.String()) }), detail: { tags: ["Business"] } }
  )
  .post(
    "/khata/entries",
    async ({ body, user, set }) => {
      if (!body.counterpartyId && !body.phone && !body.name) { set.status = 400; return { error: "Who is this for?" }; }
      const amt = body.type === "invoice" ? body.amount : -body.amount;
      const [e] = await db.insert(ledgerEntries).values({
        ownerId: user.id, counterpartyId: body.counterpartyId ?? null, counterpartyName: body.name ?? null, counterpartyPhone: body.phone ?? null,
        type: body.type, amount: m(amt), refType: "manual", note: body.note ?? null, method: body.method ?? null,
      }).returning();
      set.status = 201;
      return { entry: e };
    },
    {
      body: t.Object({
        counterpartyId: t.Optional(t.String()), name: t.Optional(t.String({ maxLength: 160 })), phone: t.Optional(t.String({ maxLength: 20 })),
        type: t.Union([t.Literal("invoice"), t.Literal("payment"), t.Literal("credit_note")]),
        amount: t.Number({ minimum: 0.01, maximum: 100000000 }), note: t.Optional(t.String({ maxLength: 200 })), method: t.Optional(t.String({ maxLength: 20 })),
      }),
      detail: { summary: "Record a payment received, a credit sale, or a credit note", tags: ["Business"] },
    }
  )

  // ─── Counter billing (POS) ───
  .post(
    "/bills",
    async ({ body, user, set }) => {
      if (!isSeller(user)) { set.status = 403; return { error: "Verified sellers only" }; }
      if (body.paymentMode === "credit" && !body.customerPhone && !body.customerName) { set.status = 400; return { error: "Add the customer's name or phone for a credit sale" }; }
      const ids = body.lines.map((l) => l.productId).filter(Boolean) as string[];
      const mine = ids.length ? await db.select().from(products).where(and(eq(products.supplierId, user.id), inArray(products.id, ids))) : [];
      for (const l of body.lines) {
        if (l.productId) {
          const p = mine.find((x) => x.id === l.productId);
          if (!p) { set.status = 400; return { error: "A product on this bill isn't in your stock" }; }
          if (p.stockQuantity < l.quantity) { set.status = 400; return { error: `Only ${p.stockQuantity} of ${p.name} in stock` }; }
        }
      }
      const lines: BillLine[] = body.lines.map((l) => ({ productId: l.productId ?? null, name: l.name, quantity: l.quantity, unitPrice: m(l.unitPrice), gstRate: l.gstRate, total: m(l.quantity * l.unitPrice * (1 + l.gstRate / 100)) }));
      const tot = lineTotals(lines);
      const [bill] = await db.insert(salesBills).values({
        sellerId: user.id, number: await nextNumber("B", salesBills, salesBills.sellerId, user.id),
        customerName: body.customerName ?? null, customerPhone: body.customerPhone ?? null, lines, ...tot, paymentMode: body.paymentMode,
      }).returning();
      for (const l of body.lines) {
        if (!l.productId) continue;
        const p = mine.find((x) => x.id === l.productId)!;
        await recordStockMovement({ product: p, delta: -l.quantity, reason: "sale", note: `Bill ${bill.number}`, createdBy: user.id });
      }
      if (body.paymentMode === "credit") {
        await db.insert(ledgerEntries).values({ ownerId: user.id, counterpartyName: body.customerName ?? null, counterpartyPhone: body.customerPhone ?? null, type: "invoice", amount: bill.total, refType: "bill", refId: bill.id, note: `Bill ${bill.number}` });
      }
      set.status = 201;
      return { bill };
    },
    {
      body: t.Object({
        customerName: t.Optional(t.String({ maxLength: 160 })), customerPhone: t.Optional(t.String({ maxLength: 20 })),
        paymentMode: t.Union([t.Literal("cash"), t.Literal("upi"), t.Literal("card"), t.Literal("credit")]),
        lines: t.Array(t.Object({ productId: t.Optional(t.String()), name: t.String({ minLength: 1, maxLength: 255 }), quantity: t.Number({ minimum: 1, maximum: 100000 }), unitPrice: t.Number({ minimum: 0 }), gstRate: t.Number({ minimum: 0, maximum: 28 }) }), { minItems: 1, maxItems: 100 }),
      }),
      detail: { summary: "Counter bill (GST), deducts stock; credit bills post to khata", tags: ["Business"] },
    }
  )
  .get(
    "/bills",
    async ({ user }) => ({ bills: await db.select().from(salesBills).where(eq(salesBills.sellerId, user.id)).orderBy(desc(salesBills.createdAt)).limit(100) }),
    { detail: { tags: ["Business"] } }
  )
  .get(
    "/bills/:id",
    async ({ params, user, set }) => {
      const [b] = await db.select().from(salesBills).where(and(eq(salesBills.id, params.id), eq(salesBills.sellerId, user.id))).limit(1);
      if (!b) { set.status = 404; return { error: "Bill not found" }; }
      const [s] = await db.select({ name: sql<string>`coalesce(${users.businessName}, ${users.name})`, gst: users.gstNumber, city: users.city, phone: users.phone }).from(users).where(eq(users.id, user.id)).limit(1);
      return { bill: b, seller: s };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Business"] } }
  )

  // ─── Demand radar ───
  .get(
    "/radar",
    async ({ user }) => {
      const [me] = await db.select({ industries: users.industries, city: users.city }).from(users).where(eq(users.id, user.id)).limit(1);
      const inds = me?.industries?.length ? me.industries : null;
      const searches = await db.execute<{ term: string; searches: number; zero_result: number; my_listings: number }>(sql`
        SELECT lower(coalesce(nullif(s.query, ''), s.category)) AS term, count(*)::int AS searches,
               count(*) FILTER (WHERE s.result_count = 0)::int AS zero_result,
               (SELECT count(*)::int FROM products p WHERE p.supplier_id = ${user.id} AND p.status IN ('active','out_of_stock','draft')
                  AND (p.name ILIKE '%' || lower(coalesce(nullif(s.query, ''), s.category)) || '%' OR p.category ILIKE lower(coalesce(nullif(s.query, ''), s.category)))) AS my_listings
        FROM search_events s
        WHERE s.created_at > now() - interval '30 days' AND coalesce(nullif(s.query, ''), s.category) IS NOT NULL
          ${inds ? sql`AND (s.industry_slug IS NULL OR s.industry_slug IN (${sql.join(inds.map((i) => sql`${i}`), sql`, `)}))` : sql``}
        GROUP BY 1 ORDER BY searches DESC LIMIT 15`);
      const requests = await db.select({ id: inquiries.id, partName: inquiries.partName, make: inquiries.make, model: inquiries.model, city: inquiries.city, createdAt: inquiries.createdAt })
        .from(inquiries).where(eq(inquiries.isActive, true)).orderBy(desc(inquiries.createdAt)).limit(10);
      return { searches: [...searches], requests, city: me?.city ?? null };
    },
    { detail: { summary: "What buyers search for vs what you list", tags: ["Business"] } }
  )

  // ─── Catalog import (CSV parsed client-side) ───
  .post(
    "/import",
    async ({ body, user, set }) => {
      if (!isSeller(user)) { set.status = 403; return { error: "Verified sellers only" }; }
      const valid = (await db.select({ slug: industries.slug }).from(industries)).map((i) => i.slug);
      let created = 0, updated = 0;
      const errors: string[] = [];
      for (const [i, r] of body.rows.entries()) {
        const price = parseFloat(String(r.price));
        if (!r.name || !(price >= 0)) { errors.push(`Row ${i + 2}: name and price are required`); continue; }
        const ind = r.industry && valid.includes(r.industry) ? r.industry : "automotive";
        const values = {
          supplierId: user.id, name: r.name.slice(0, 500), brand: r.brand || null, partNumber: r.partNumber || null, category: r.category || null,
          industrySlug: ind, machineType: r.machineType || null, price: m(price), mrp: r.mrp ? m(parseFloat(String(r.mrp))) : null,
          stockQuantity: Math.max(0, Math.floor(Number(r.stock) || 0)), moq: Math.max(1, Math.floor(Number(r.moq) || 1)), status: "active" as const,
          compatibleVehicles: r.fitsBrand && r.fitsModel ? [{ make: r.fitsBrand, model: r.fitsModel }] : [],
        };
        const [ex] = r.partNumber ? await db.select({ id: products.id }).from(products).where(and(eq(products.supplierId, user.id), eq(products.partNumber, r.partNumber))).limit(1) : [];
        if (ex) { await db.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, ex.id)); updated++; }
        else { await db.insert(products).values(values); created++; }
      }
      return { created, updated, errors };
    },
    {
      body: t.Object({
        rows: t.Array(t.Object({
          name: t.String(), price: t.Union([t.String(), t.Number()]), brand: t.Optional(t.String()), partNumber: t.Optional(t.String()), category: t.Optional(t.String()),
          industry: t.Optional(t.String()), machineType: t.Optional(t.String()), mrp: t.Optional(t.Union([t.String(), t.Number()])),
          stock: t.Optional(t.Union([t.String(), t.Number()])), moq: t.Optional(t.Union([t.String(), t.Number()])),
          fitsBrand: t.Optional(t.String()), fitsModel: t.Optional(t.String()),
        }), { minItems: 1, maxItems: 500 }),
      }),
      detail: { summary: "Bulk create/update listings (upsert by part number)", tags: ["Business"] },
    }
  );

// ─── Public storefront ───
export const storefrontRoutes = new Elysia({ prefix: "/public" }).get(
  "/store/:sellerId",
  async ({ params, set }) => {
    const [s] = await db.select({ id: users.id, businessName: users.businessName, name: users.name, city: users.city, businessRoles: users.businessRoles, industries: users.industries, since: users.createdAt, verified: sql<boolean>`${users.verificationStatus} = 'approved'` })
      .from(users).where(and(eq(users.id, params.sellerId), eq(users.role, "supplier"))).limit(1);
    if (!s) { set.status = 404; return { error: "Store not found" }; }
    const list = await db.select({ id: products.id, name: products.name, brand: products.brand, partType: products.partType, category: products.category, industrySlug: products.industrySlug, price: products.price, mrp: products.mrp, stockQuantity: products.stockQuantity })
      .from(products).where(and(eq(products.supplierId, s.id), inArray(products.status, ["active", "out_of_stock"]))).orderBy(products.name).limit(300);
    const [r] = await db.execute<{ rating: string | null; n: number; delivered: number }>(sql`
      SELECT (SELECT round(avg(rating)::numeric,1)::text FROM reviews WHERE supplier_id = ${s.id}) AS rating,
             (SELECT count(*)::int FROM reviews WHERE supplier_id = ${s.id}) AS n,
             (SELECT count(*)::int FROM orders WHERE supplier_id = ${s.id} AND status IN ('delivered','completed')) AS delivered`);
    return { store: { ...s, rating: r?.rating ?? null, reviews: r?.n ?? 0, delivered: r?.delivered ?? 0 }, products: list };
  },
  { params: t.Object({ sellerId: t.String() }), detail: { tags: ["Public"] } }
);

export { orders, searchEvents };
