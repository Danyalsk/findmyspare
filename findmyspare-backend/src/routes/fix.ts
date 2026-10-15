import { Elysia, t } from "elysia";
import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  users,
  garages,
  vehicles,
  jobCards,
  notifications,
  serviceRequests,
  industries,
  machineTypes,
  partCategories,
  BUSINESS_ROLES,
} from "../db/schema";
import { authGuard, requireAdmin } from "../middleware/auth";
import { garageForUser, idDisplay } from "../lib/garage";
import { openJob } from "./garage";

/* "Fix": anyone books a technician for any machine; any workshop or
   technician whose industries match picks it up and gets a job card. */

// ─── Public taxonomy (the shape of the whole marketplace) ───
export const taxonomyRoutes = new Elysia({ prefix: "/catalog" }).get(
  "/taxonomy",
  async () => {
    const [inds, types, cats, counts] = await Promise.all([
      db.select().from(industries).where(eq(industries.active, true)).orderBy(asc(industries.sortOrder)),
      db.select().from(machineTypes).orderBy(asc(machineTypes.sortOrder)),
      db.select().from(partCategories).orderBy(asc(partCategories.sortOrder)),
      db.execute<{ industry_slug: string; parts: number; sellers: number }>(sql`
        SELECT industry_slug, count(*)::int AS parts, count(DISTINCT supplier_id)::int AS sellers
        FROM products WHERE status = 'active' GROUP BY industry_slug`),
    ]);
    const bySlug = new Map([...counts].map((c) => [c.industry_slug, c]));
    return {
      industries: inds.map((i) => ({
        ...i,
        parts: bySlug.get(i.slug)?.parts ?? 0,
        sellers: bySlug.get(i.slug)?.sellers ?? 0,
        machineTypes: types.filter((m) => m.industryId === i.id),
        categories: cats.filter((c) => c.industryId === i.id),
      })),
      roles: BUSINESS_ROLES,
    };
  },
  { detail: { summary: "Industries → machine types → part categories", tags: ["Public"] } },
);

const requestBody = t.Object({
  industrySlug: t.String({ maxLength: 40 }),
  machineType: t.Optional(t.String({ maxLength: 80 })),
  brand: t.Optional(t.String({ maxLength: 100 })),
  model: t.Optional(t.String({ maxLength: 100 })),
  vehicleId: t.Optional(t.String()),
  problem: t.String({ minLength: 5, maxLength: 2000 }),
  city: t.Optional(t.String({ maxLength: 100 })),
  address: t.Optional(t.String({ maxLength: 255 })),
  phone: t.Optional(t.String({ maxLength: 20 })),
  preferredTime: t.Optional(t.String({ maxLength: 60 })),
});

export const fixRoutes = new Elysia({ prefix: "/fix" })
  .use(authGuard)

  // ─── Customer side ───
  .post(
    "/requests",
    async ({ body, user, set }) => {
      const [ind] = await db.select({ slug: industries.slug, name: industries.name }).from(industries).where(eq(industries.slug, body.industrySlug)).limit(1);
      if (!ind) { set.status = 400; return { error: "Unknown industry" }; }
      let brand = body.brand ?? null, model = body.model ?? null, machineType = body.machineType ?? null;
      if (body.vehicleId) {
        const [v] = await db.select().from(vehicles).where(eq(vehicles.id, body.vehicleId)).limit(1);
        if (!v || v.ownerId !== user.id) { set.status = 404; return { error: "Machine not found" }; }
        brand ??= v.makeName; model ??= v.modelName; machineType ??= v.machineType;
      }
      const [r] = await db.insert(serviceRequests).values({
        customerId: user.id, industrySlug: ind.slug, machineType, brand, model,
        vehicleId: body.vehicleId ?? null, problem: body.problem, city: body.city ?? null,
        address: body.address ?? null, phone: body.phone ?? null, preferredTime: body.preferredTime ?? null,
      }).returning();
      // Ping workshops that serve this industry in this city.
      const matches = await db.select({ ownerId: garages.ownerId }).from(garages).where(and(
        sql`${garages.industrySlugs} @> ${JSON.stringify([ind.slug])}::jsonb`,
        body.city ? or(isNull(garages.city), ilike(garages.city, body.city)) : undefined,
        sql`${garages.ownerId} <> ${user.id}`,
      )).limit(50);
      if (matches.length) {
        await db.insert(notifications).values(matches.map((g) => ({
          userId: g.ownerId, type: "service_request",
          title: `New ${ind.name.toLowerCase()} job${body.city ? ` in ${body.city}` : ""}`,
          message: [machineType, brand, model].filter(Boolean).join(" · ") + ` — ${body.problem.slice(0, 120)}`,
          metadata: { serviceRequestId: r!.id },
        })));
      }
      set.status = 201;
      return { request: r, notified: matches.length };
    },
    { body: requestBody, detail: { summary: "Book a technician for any machine", tags: ["Fix"] } },
  )

  .get(
    "/requests/mine",
    async ({ user }) => {
      const rows = await db
        .select({ r: serviceRequests, garageName: garages.name, garagePhone: garages.phone, jobStatus: jobCards.status, jobNumber: jobCards.number })
        .from(serviceRequests)
        .leftJoin(garages, eq(garages.id, serviceRequests.garageId))
        .leftJoin(jobCards, eq(jobCards.id, serviceRequests.jobCardId))
        .where(eq(serviceRequests.customerId, user.id))
        .orderBy(desc(serviceRequests.createdAt))
        .limit(50);
      return { requests: rows.map(({ r, ...rest }) => ({ ...r, ...rest })) };
    },
    { detail: { tags: ["Fix"] } },
  )

  .post(
    "/requests/:id/cancel",
    async ({ params, user, set }) => {
      const [r] = await db.update(serviceRequests).set({ status: "cancelled" })
        .where(and(eq(serviceRequests.id, params.id), eq(serviceRequests.customerId, user.id), eq(serviceRequests.status, "open")))
        .returning();
      if (!r) { set.status = 409; return { error: "Only open requests can be cancelled" }; }
      return { request: r };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Fix"] } },
  )

  // ─── Workshop / technician side ───
  .get(
    "/requests/nearby",
    async ({ user, set }) => {
      const garage = await garageForUser(user.id);
      if (!garage) { set.status = 404; return { error: "Set up your workshop first" }; }
      const inds = garage.industrySlugs?.length ? garage.industrySlugs : ["automotive"];
      const rows = await db
        .select({ r: serviceRequests, customerName: users.name })
        .from(serviceRequests)
        .innerJoin(users, eq(users.id, serviceRequests.customerId))
        .where(and(
          eq(serviceRequests.status, "open"),
          sql`${serviceRequests.industrySlug} IN (${sql.join(inds.map((i) => sql`${i}`), sql`, `)})`,
          garage.city ? or(isNull(serviceRequests.city), ilike(serviceRequests.city, garage.city)) : undefined,
          sql`${serviceRequests.customerId} <> ${user.id}`,
        ))
        .orderBy(desc(serviceRequests.createdAt))
        .limit(50);
      // Phone and full address are shared only after accepting.
      return {
        industries: inds,
        city: garage.city,
        requests: rows.map(({ r, customerName }) => ({ ...r, phone: null, address: null, customerName: customerName?.split(" ")[0] ?? "Customer" })),
      };
    },
    { detail: { summary: "Open jobs matching my industries and city", tags: ["Fix"] } },
  )

  .post(
    "/requests/:id/accept",
    async ({ params, user, set }) => {
      const garage = await garageForUser(user.id);
      if (!garage) { set.status = 404; return { error: "Set up your workshop first" }; }
      // Claim atomically so two technicians can't both take it.
      const [r] = await db.update(serviceRequests).set({ status: "accepted", garageId: garage.id })
        .where(and(eq(serviceRequests.id, params.id), eq(serviceRequests.status, "open"), sql`${serviceRequests.customerId} <> ${user.id}`))
        .returning();
      if (!r) { set.status = 409; return { error: "Someone else took this job, or it was cancelled" }; }
      const [customer] = await db.select({ name: users.name, phone: users.phone }).from(users).where(eq(users.id, r.customerId)).limit(1);
      const [indRow] = await db.select({ name: industries.name }).from(industries).where(eq(industries.slug, r.industrySlug)).limit(1);
      const industryName = indRow?.name ?? "Machine";
      let [machine] = r.vehicleId ? await db.select().from(vehicles).where(eq(vehicles.id, r.vehicleId)).limit(1) : [];
      if (!machine) {
        [machine] = await db.insert(vehicles).values({
          ownerId: r.customerId, industrySlug: r.industrySlug, machineType: r.machineType,
          makeName: r.brand ?? industryName, modelName: r.model ?? r.machineType ?? "Machine",
        }).returning();
      }
      // The customer asked for this service, so consent to write the record is implied.
      const job = await openJob(garage, machine!, {
        customerName: customer?.name ?? null, customerPhone: r.phone ?? customer?.phone ?? null,
        complaint: r.problem, preGranted: true,
      });
      const [updated] = await db.update(serviceRequests).set({ jobCardId: job.id, vehicleId: machine!.id }).where(eq(serviceRequests.id, r.id)).returning();
      await db.insert(notifications).values({
        userId: r.customerId, type: "service_request",
        title: `${garage.name} accepted your request`,
        message: `${idDisplay(machine!)} — they'll contact you${garage.phone ? ` from ${garage.phone}` : ""}.`,
        metadata: { serviceRequestId: r.id, jobCardId: job.id },
      });
      return { request: updated, job };
    },
    { params: t.Object({ id: t.String() }), detail: { summary: "Take a job → opens a job card", tags: ["Fix"] } },
  );

// ─── Admin: the whole network on one screen + taxonomy studio ───
const INDUSTRY_ICONS = ["car", "pump", "motor", "appliance", "power", "tractor", "gear", "excavator", "phone", "boat"];
const TILE_PALETTE: [string, string][] = [
  ["#FFF1EB", "#A32D0C"], ["#EAF0FD", "#2457C5"], ["#FFF6E0", "#9A6700"], ["#E6F6FA", "#0B6E85"],
  ["#E7F5EF", "#0B7A53"], ["#F1ECFB", "#5B3CC4"], ["#EEF0F3", "#3E434E"], ["#FFF8D6", "#8A6100"],
];
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export const adminNetworkRoutes = new Elysia({ prefix: "/admin/network" })
  .use(requireAdmin)

  .get(
    "/overview",
    async () => {
      const [roles, perIndustry, trade, fix, gaps] = await Promise.all([
        db.execute<{ role: string; n: number }>(sql`
          SELECT r AS role, count(*)::int AS n FROM users, jsonb_array_elements_text(coalesce(business_roles, '[]'::jsonb)) r GROUP BY r ORDER BY n DESC`),
        db.execute<{ slug: string; name: string; parts: number; sellers: number; businesses: number; searches: number; zero: number; requests: number }>(sql`
          SELECT i.slug, i.name,
            (SELECT count(*)::int FROM products p WHERE p.industry_slug = i.slug AND p.status = 'active') AS parts,
            (SELECT count(DISTINCT supplier_id)::int FROM products p WHERE p.industry_slug = i.slug AND p.status = 'active') AS sellers,
            (SELECT count(*)::int FROM users u WHERE u.industries @> jsonb_build_array(i.slug)) AS businesses,
            (SELECT count(*)::int FROM search_events s WHERE s.industry_slug = i.slug AND s.created_at > now() - interval '30 days') AS searches,
            (SELECT count(*)::int FROM search_events s WHERE s.industry_slug = i.slug AND s.result_count = 0 AND s.created_at > now() - interval '30 days') AS zero,
            (SELECT count(*)::int FROM service_requests r WHERE r.industry_slug = i.slug) AS requests
          FROM industries i ORDER BY i.sort_order`),
        db.execute<{ links: number; pos: number; po_value: string; bills: number; bill_value: string; receivable: string }>(sql`
          SELECT (SELECT count(*)::int FROM trade_links WHERE status = 'active') AS links,
                 (SELECT count(*)::int FROM purchase_orders) AS pos,
                 (SELECT coalesce(sum(total),0)::text FROM purchase_orders WHERE status IN ('accepted','shipped','received')) AS po_value,
                 (SELECT count(*)::int FROM sales_bills) AS bills,
                 (SELECT coalesce(sum(total),0)::text FROM sales_bills) AS bill_value,
                 (SELECT coalesce(sum(amount),0)::text FROM ledger_entries) AS receivable`),
        db.execute<{ status: string; n: number }>(sql`SELECT status::text, count(*)::int AS n FROM service_requests GROUP BY status`),
        db.execute<{ term: string; industry: string | null; n: number }>(sql`
          SELECT lower(coalesce(nullif(query, ''), category)) AS term, industry_slug AS industry, count(*)::int AS n
          FROM search_events WHERE result_count = 0 AND created_at > now() - interval '30 days'
            AND coalesce(nullif(query, ''), category) IS NOT NULL
          GROUP BY 1, 2 ORDER BY n DESC LIMIT 25`),
      ]);
      return { roles: [...roles], industries: [...perIndustry], trade: [...trade][0], fix: [...fix], searchGaps: [...gaps] };
    },
    { detail: { summary: "Network health across roles, industries, trade and service", tags: ["Admin"] } },
  )

  .get(
    "/businesses",
    async ({ query }) => {
      const conds = [sql`jsonb_array_length(coalesce(${users.businessRoles}, '[]'::jsonb)) > 0`];
      if (query.role) conds.push(sql`${users.businessRoles} @> ${JSON.stringify([query.role])}::jsonb`);
      if (query.industry) conds.push(sql`${users.industries} @> ${JSON.stringify([query.industry])}::jsonb`);
      if (query.q) conds.push(sql`(${users.businessName} ILIKE ${"%" + query.q + "%"} OR ${users.name} ILIKE ${"%" + query.q + "%"} OR ${users.city} ILIKE ${"%" + query.q + "%"})`);
      const rows = await db
        .select({
          id: users.id, name: users.name, businessName: users.businessName, city: users.city, role: users.role,
          businessRoles: users.businessRoles, industries: users.industries, verificationStatus: users.verificationStatus, createdAt: users.createdAt,
          listings: sql<number>`(SELECT count(*)::int FROM products p WHERE p.supplier_id = "users"."id" AND p.status <> 'deleted')`,
          buyers: sql<number>`(SELECT count(*)::int FROM trade_links l WHERE l.supplier_id = "users"."id" AND l.status = 'active')`,
          suppliers: sql<number>`(SELECT count(*)::int FROM trade_links l WHERE l.buyer_id = "users"."id" AND l.status = 'active')`,
        })
        .from(users).where(and(...conds)).orderBy(desc(users.createdAt)).limit(200);
      return { businesses: rows };
    },
    { query: t.Object({ role: t.Optional(t.String()), industry: t.Optional(t.String()), q: t.Optional(t.String()) }), detail: { tags: ["Admin"] } },
  )

  // Taxonomy studio sees inactive industries too (the public tree hides them).
  .get(
    "/taxonomy",
    async () => {
      const [inds, types, cats] = await Promise.all([
        db.select().from(industries).orderBy(asc(industries.sortOrder)),
        db.select().from(machineTypes).orderBy(asc(machineTypes.sortOrder)),
        db.select().from(partCategories).orderBy(asc(partCategories.sortOrder)),
      ]);
      return { industries: inds.map((i) => ({ ...i, machineTypes: types.filter((m) => m.industryId === i.id), categories: cats.filter((c) => c.industryId === i.id) })) };
    },
    { detail: { tags: ["Admin"] } },
  )

  // Taxonomy studio: adding an industry is data, not a deploy.
  .post(
    "/industries",
    async ({ body, set }) => {
      const slug = slugify(body.slug ?? body.name);
      if (!slug) { set.status = 400; return { error: "Invalid name" }; }
      // Rotate through the brand's tile palette so new industries don't all look alike.
      const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(industries);
      const [tint, ink] = TILE_PALETTE[n % TILE_PALETTE.length]!;
      const icon = body.icon && INDUSTRY_ICONS.includes(body.icon) ? body.icon : "gear";
      const [i] = await db.insert(industries).values({ ...body, icon, tint, ink, slug }).onConflictDoNothing().returning();
      if (!i) { set.status = 409; return { error: "An industry with that slug exists" }; }
      set.status = 201;
      return { industry: i };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, maxLength: 80 }), slug: t.Optional(t.String({ maxLength: 40 })),
        tagline: t.Optional(t.String({ maxLength: 160 })), icon: t.Optional(t.String({ maxLength: 40 })),
        identifierLabel: t.Optional(t.String({ maxLength: 40 })), sortOrder: t.Optional(t.Number()),
      }),
      detail: { tags: ["Admin"] },
    },
  )

  .patch(
    "/industries/:id",
    async ({ params, body, set }) => {
      if (body.icon && !INDUSTRY_ICONS.includes(body.icon)) { set.status = 400; return { error: "Unknown icon" }; }
      const [i] = await db.update(industries).set(body).where(eq(industries.id, params.id)).returning();
      if (!i) { set.status = 404; return { error: "Not found" }; }
      return { industry: i };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Partial(t.Object({
        name: t.String({ minLength: 2, maxLength: 80 }), tagline: t.String({ maxLength: 160 }), icon: t.String({ maxLength: 40 }),
        identifierLabel: t.String({ maxLength: 40 }), sortOrder: t.Number(), active: t.Boolean(),
      })),
      detail: { tags: ["Admin"] },
    },
  )

  .post(
    "/industries/:id/machine-types",
    async ({ params, body, set }) => {
      const [m] = await db.insert(machineTypes).values({ industryId: params.id, slug: slugify(body.name), name: body.name, brands: body.brands ?? [], attributes: body.attributes ?? [] })
        .onConflictDoNothing().returning();
      if (!m) { set.status = 409; return { error: "Already exists" }; }
      set.status = 201;
      return { machineType: m };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.String({ minLength: 2, maxLength: 80 }),
        brands: t.Optional(t.Array(t.String({ maxLength: 60 }))),
        attributes: t.Optional(t.Array(t.Object({ key: t.String(), label: t.String(), unit: t.Optional(t.String()) }))),
      }),
      detail: { tags: ["Admin"] },
    },
  )

  .post(
    "/industries/:id/categories",
    async ({ params, body, set }) => {
      const [c] = await db.insert(partCategories).values({ industryId: params.id, name: body.name, icon: body.icon ?? "engine" }).onConflictDoNothing().returning();
      if (!c) { set.status = 409; return { error: "Already exists" }; }
      set.status = 201;
      return { category: c };
    },
    { params: t.Object({ id: t.String() }), body: t.Object({ name: t.String({ minLength: 2, maxLength: 80 }), icon: t.Optional(t.String({ maxLength: 40 })) }), detail: { tags: ["Admin"] } },
  )

  .delete(
    "/machine-types/:id",
    async ({ params }) => {
      await db.delete(machineTypes).where(eq(machineTypes.id, params.id));
      return { ok: true };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Admin"] } },
  )

  .delete(
    "/categories/:id",
    async ({ params }) => {
      await db.delete(partCategories).where(eq(partCategories.id, params.id));
      return { ok: true };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Admin"] } },
  );
