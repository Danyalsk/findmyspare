import { Elysia, t } from "elysia";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  vehicles,
  vehicleMakes,
  vehicleModels,
  vehicleVariants,
  vehicleAccess,
  garages,
  jobCards,
  jobItems,
  invoices,
  fittedParts,
  fitments,
} from "../db/schema";
import { authGuard } from "../middleware/auth";
import { normalizeRegNo, lookupRegNo, token, formatRegNo,
  idDisplay, vehicleLabel } from "../lib/garage";
import { rateLimit } from "../lib/rate-limit";

// ─── Public: vehicle catalog for pickers ─────────────
export const vehicleCatalogRoutes = new Elysia({ prefix: "/catalog" }).get(
  "/vehicles",
  async () => {
    const makes = await db.select().from(vehicleMakes).orderBy(asc(vehicleMakes.name));
    const models = await db.select().from(vehicleModels).orderBy(asc(vehicleModels.name));
    const variants = await db.select().from(vehicleVariants).orderBy(asc(vehicleVariants.name));
    return {
      makes: makes.map((m) => ({
        ...m,
        models: models
          .filter((x) => x.makeId === m.id)
          .map((x) => ({ ...x, variants: variants.filter((v) => v.modelId === x.id) })),
      })),
    };
  },
  { detail: { summary: "Vehicle make/model/variant catalog", tags: ["Vehicles"] } }
);

/** Everything the owner (or a consented garage) sees on the passport. */
export async function buildPassport(vehicleId: string) {
  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  if (!v) return null;
  // Consent gate: only garages the owner allowed may write to the passport.
  const granted = (
    await db.select({ garageId: vehicleAccess.garageId }).from(vehicleAccess)
      .where(and(eq(vehicleAccess.vehicleId, v.id), eq(vehicleAccess.status, "granted")))
  ).map((r) => r.garageId);
  const jobs = granted.length
    ? await db
        .select({ job: jobCards, garageName: garages.name, garageCity: garages.city })
        .from(jobCards)
        .innerJoin(garages, eq(garages.id, jobCards.garageId))
        .where(and(eq(jobCards.vehicleId, v.id), inArray(jobCards.garageId, granted)))
        .orderBy(desc(jobCards.createdAt))
    : [];
  const jobIds = jobs.map((j) => j.job.id);
  const items = jobIds.length ? await db.select().from(jobItems).where(inArray(jobItems.jobCardId, jobIds)) : [];
  const invs = granted.length
    ? await db.select().from(invoices).where(and(eq(invoices.vehicleId, v.id), inArray(invoices.garageId, granted))).orderBy(desc(invoices.issuedAt))
    : [];
  const parts = (await db.select().from(fittedParts).where(eq(fittedParts.vehicleId, v.id)).orderBy(desc(fittedParts.fittedAt)))
    .filter((p) => !p.jobCardId || jobIds.includes(p.jobCardId));
  const now = Date.now();
  const odometer = [
    ...jobs.filter((j) => j.job.odometerKm).map((j) => ({ at: j.job.createdAt, km: j.job.odometerKm!, source: j.garageName })),
  ].sort((a, b) => +new Date(a.at) - +new Date(b.at));
  return {
    vehicle: { ...v, regNoDisplay: idDisplay(v!), label: vehicleLabel(v) },
    services: jobs
      .filter((j) => ["invoiced", "paid"].includes(j.job.status))
      .map((j) => ({
        jobCardId: j.job.id,
        number: j.job.number,
        garageName: j.garageName,
        garageCity: j.garageCity,
        date: j.job.completedAt ?? j.job.updatedAt,
        odometerKm: j.job.odometerKm,
        complaint: j.job.complaint,
        status: j.job.status,
        items: items.filter((i) => i.jobCardId === j.job.id && i.approved).map((i) => ({ kind: i.kind, name: i.name, brand: i.brand, quantity: i.quantity })),
        invoice: invs.find((x) => x.jobCardId === j.job.id) ?? null,
      })),
    activeJobs: jobs
      .filter((j) => !["invoiced", "paid", "cancelled"].includes(j.job.status))
      .map((j) => ({ jobCardId: j.job.id, number: j.job.number, status: j.job.status, garageName: j.garageName, estimateToken: j.job.estimateToken, createdAt: j.job.createdAt })),
    parts: parts.map((p) => ({
      ...p,
      warrantyActive: p.warrantyUntil ? +new Date(p.warrantyUntil) > now : false,
      warrantyDaysLeft: p.warrantyUntil ? Math.max(0, Math.ceil((+new Date(p.warrantyUntil) - now) / 864e5)) : 0,
    })),
    invoices: invs.map((i) => ({ id: i.id, number: i.number, total: i.total, status: i.status, issuedAt: i.issuedAt, verifyCode: i.verifyCode, payToken: i.payToken, garageName: i.seller.name })),
    odometer,
    stats: {
      services: jobs.filter((j) => ["invoiced", "paid"].includes(j.job.status)).length,
      partsFitted: parts.length,
      activeWarranties: parts.filter((p) => p.warrantyUntil && +new Date(p.warrantyUntil) > now).length,
      totalSpent: invs.filter((i) => i.status === "paid").reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2),
    },
  };
}

export const vehicleRoutes = new Elysia({ prefix: "/vehicles" })
  .use(authGuard)

  // Mock RC lookup by registration number.
  .get(
    "/lookup",
    async ({ query, user, set }) => {
      if (!rateLimit(`rc:${user.id}`, 30, 60_000).ok) { set.status = 429; return { error: "Too many lookups. Try again in a minute." }; }
      const reg = normalizeRegNo(query.regNo);
      if (!reg) { set.status = 400; return { error: "That doesn't look like a valid registration number" }; }
      const rc = await lookupRegNo(reg);
      if (!rc) { set.status = 404; return { error: "Vehicle not found" }; }
      return { vehicle: { ...rc, regNoDisplay: formatRegNo(reg) } };
    },
    { query: t.Object({ regNo: t.String() }), detail: { summary: "Look up a vehicle by registration (mock RC)", tags: ["Vehicles"] } }
  )

  // My Garage (owner's vehicles).
  .get(
    "/mine",
    async ({ user }) => {
      const list = await db.select().from(vehicles).where(eq(vehicles.ownerId, user.id)).orderBy(desc(vehicles.createdAt));
      const ids = list.map((v) => v.id);
      const pending = ids.length
        ? await db.select({ id: vehicleAccess.id, vehicleId: vehicleAccess.vehicleId, garageName: garages.name, garageCity: garages.city, requestedAt: vehicleAccess.requestedAt })
            .from(vehicleAccess).innerJoin(garages, eq(garages.id, vehicleAccess.garageId))
            .where(and(inArray(vehicleAccess.vehicleId, ids), eq(vehicleAccess.status, "pending")))
        : [];
      const partRows = ids.length
        ? await db.select({ vehicleId: fittedParts.vehicleId, parts: sql<number>`count(*)::int`, warranties: sql<number>`(count(*) filter (where ${fittedParts.warrantyUntil} > now()))::int` })
            .from(fittedParts).where(inArray(fittedParts.vehicleId, ids)).groupBy(fittedParts.vehicleId)
        : [];
      const serviceRows = ids.length
        ? await db.select({ vehicleId: jobCards.vehicleId, services: sql<number>`count(*)::int` })
            .from(jobCards).where(and(inArray(jobCards.vehicleId, ids), inArray(jobCards.status, ["invoiced", "paid"]))).groupBy(jobCards.vehicleId)
        : [];
      const statsFor = (id: string) => ({
        parts: partRows.find((r) => r.vehicleId === id)?.parts ?? 0,
        warranties: partRows.find((r) => r.vehicleId === id)?.warranties ?? 0,
        services: serviceRows.find((r) => r.vehicleId === id)?.services ?? 0,
      });
      return {
        vehicles: list.map((v) => ({
          ...v,
          regNoDisplay: idDisplay(v!),
          label: vehicleLabel(v),
          stats: statsFor(v.id),
          pendingAccess: pending.filter((p) => p.vehicleId === v.id),
        })),
      };
    },
    { detail: { summary: "List my vehicles", tags: ["Vehicles"] } }
  )

  // Add a vehicle (or claim an unowned record a garage created).
  .post(
    "/",
    async ({ body, user, set }) => {
      // Machines without a plate (pump, AC, genset, tractor implement…): identified by brand/model/serial.
      if (!body.regNo) {
        if (!body.makeName || !body.modelName) { set.status = 400; return { error: "Add the brand and model" }; }
        const [v] = await db.insert(vehicles).values({
          ownerId: user.id,
          industrySlug: body.industrySlug ?? "automotive",
          machineType: body.machineType ?? null,
          serialNo: body.serialNo?.trim() || null,
          nickname: body.nickname ?? null,
          makeName: body.makeName,
          modelName: body.modelName,
          variantName: body.variantName ?? null,
          year: body.year ?? null,
        }).returning();
        set.status = 201;
        return { vehicle: v, claimed: false };
      }
      const reg = normalizeRegNo(body.regNo);
      if (!reg) { set.status = 400; return { error: "That doesn't look like a valid registration number" }; }
      const [existing] = await db.select().from(vehicles).where(eq(vehicles.regNo, reg)).limit(1);
      if (existing?.ownerId && existing.ownerId !== user.id) {
        set.status = 409;
        return { error: "This vehicle is already linked to another account. Contact support to transfer it." };
      }
      if (existing) {
        // Claiming: a real build verifies ownership via RC-linked mobile OTP.
        const [v] = await db.update(vehicles).set({ ownerId: user.id, nickname: body.nickname ?? existing.nickname, updatedAt: new Date() }).where(eq(vehicles.id, existing.id)).returning();
        await db.update(vehicleAccess).set({ status: "granted", decidedAt: new Date() }).where(and(eq(vehicleAccess.vehicleId, v.id), eq(vehicleAccess.status, "pending")));
        return { vehicle: v, claimed: true };
      }
      const rc = await lookupRegNo(reg);
      const [v] = await db
        .insert(vehicles)
        .values({
          regNo: reg,
          ownerId: user.id,
          nickname: body.nickname ?? null,
          variantId: body.variantId ?? rc?.variantId ?? null,
          makeName: body.makeName ?? rc?.makeName ?? "Unknown",
          modelName: body.modelName ?? rc?.modelName ?? "Vehicle",
          variantName: body.variantName ?? rc?.variantName ?? null,
          fuel: body.fuel ?? rc?.fuel ?? null,
          year: body.year ?? rc?.year ?? null,
          segment: rc?.segment ?? "car",
        })
        .returning();
      set.status = 201;
      return { vehicle: v, claimed: false };
    },
    {
      body: t.Object({
        regNo: t.Optional(t.String()),
        industrySlug: t.Optional(t.String({ maxLength: 40 })),
        machineType: t.Optional(t.String({ maxLength: 80 })),
        serialNo: t.Optional(t.String({ maxLength: 60 })),
        nickname: t.Optional(t.String({ maxLength: 60 })),
        variantId: t.Optional(t.String()),
        makeName: t.Optional(t.String()),
        modelName: t.Optional(t.String()),
        variantName: t.Optional(t.String()),
        fuel: t.Optional(t.String()),
        year: t.Optional(t.Number()),
      }),
      detail: { summary: "Add or claim a vehicle, or add any machine by brand/model/serial", tags: ["Vehicles"] },
    }
  )

  .get(
    "/:id/passport",
    async ({ params, user, set }) => {
      const [v] = await db.select().from(vehicles).where(eq(vehicles.id, params.id)).limit(1);
      if (!v) { set.status = 404; return { error: "Vehicle not found" }; }
      if (v.ownerId !== user.id) { set.status = 403; return { error: "Only the owner can open this passport" }; }
      const passport = await buildPassport(v.id);
      const access = await db
        .select({ id: vehicleAccess.id, status: vehicleAccess.status, garageName: garages.name, garageCity: garages.city, requestedAt: vehicleAccess.requestedAt })
        .from(vehicleAccess).innerJoin(garages, eq(garages.id, vehicleAccess.garageId))
        .where(eq(vehicleAccess.vehicleId, v.id));
      return { ...passport, access };
    },
    { params: t.Object({ id: t.String() }), detail: { summary: "Vehicle Passport (owner)", tags: ["Vehicles"] } }
  )

  // Owner decides on a garage's request to write to the passport.
  .post(
    "/access/:accessId",
    async ({ params, body, user, set }) => {
      const [row] = await db
        .select({ access: vehicleAccess, ownerId: vehicles.ownerId })
        .from(vehicleAccess).innerJoin(vehicles, eq(vehicles.id, vehicleAccess.vehicleId))
        .where(eq(vehicleAccess.id, params.accessId)).limit(1);
      if (!row || row.ownerId !== user.id) { set.status = 404; return { error: "Request not found" }; }
      const [a] = await db.update(vehicleAccess)
        .set({ status: body.grant ? "granted" : "revoked", decidedAt: new Date() })
        .where(eq(vehicleAccess.id, params.accessId)).returning();
      return { access: a };
    },
    { params: t.Object({ accessId: t.String() }), body: t.Object({ grant: t.Boolean() }), detail: { tags: ["Vehicles"] } }
  )

  // Share a read-only history link (owner picks sections).
  .post(
    "/:id/share",
    async ({ params, body, user, set }) => {
      const [v] = await db.select().from(vehicles).where(and(eq(vehicles.id, params.id), eq(vehicles.ownerId, user.id))).limit(1);
      if (!v) { set.status = 404; return { error: "Vehicle not found" }; }
      const shareToken = v.shareToken ?? token(15);
      const [u] = await db.update(vehicles)
        .set({ shareToken, shareSections: body.sections, updatedAt: new Date() })
        .where(eq(vehicles.id, v.id)).returning();
      return { shareToken: u.shareToken, sections: u.shareSections };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ sections: t.Object({ services: t.Boolean(), parts: t.Boolean(), odometer: t.Boolean(), invoices: t.Boolean() }) }),
      detail: { summary: "Create/update a public history link", tags: ["Vehicles"] },
    }
  )
  .delete(
    "/:id/share",
    async ({ params, user }) => {
      await db.update(vehicles).set({ shareToken: null, shareSections: null }).where(and(eq(vehicles.id, params.id), eq(vehicles.ownerId, user.id)));
      return { ok: true };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Vehicles"] } }
  )

  // "Did it fit?" from the passport (grows the fitment graph).
  .post(
    "/parts/:partId/fit",
    async ({ params, body, user, set }) => {
      const [row] = await db.select({ part: fittedParts, v: vehicles }).from(fittedParts)
        .innerJoin(vehicles, eq(vehicles.id, fittedParts.vehicleId))
        .where(eq(fittedParts.id, params.partId)).limit(1);
      if (!row || row.v.ownerId !== user.id) { set.status = 404; return { error: "Part not found" }; }
      await db.update(fittedParts).set({ fitConfirmed: body.fits }).where(eq(fittedParts.id, row.part.id));
      if (body.fits && row.part.fitConfirmed !== true) {
        await db.insert(fitments).values({
          partNumber: row.part.partNumber, makeName: row.v.makeName, modelName: row.v.modelName,
          variantName: row.v.variantName, year: row.v.year, source: "job_fitted", confirmedBy: user.id,
        });
      }
      return { ok: true };
    },
    { params: t.Object({ partId: t.String() }), body: t.Object({ fits: t.Boolean() }), detail: { tags: ["Vehicles"] } }
  );
