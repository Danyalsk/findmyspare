import { Elysia, t } from "elysia";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  garages,
  vehicles,
  vehicleAccess,
  jobCards,
  jobItems,
  invoices,
  fittedParts,
  inquiries,
  bids,
  orders,
  notifications,
} from "../db/schema";
import { authGuard } from "../middleware/auth";
import {
  normalizeRegNo,
  lookupRegNo,
  token,
  verifyCode,
  computeInvoice,
  invoiceHash,
  garageForUser,
  formatRegNo,
  idDisplay,
  vehicleLabel,
} from "../lib/garage";
import { markInvoicePaid } from "../lib/commerce";
import { broadcastInquiryCreated } from "../lib/io";

const itemBody = t.Object({
  kind: t.Union([t.Literal("part"), t.Literal("labour")]),
  name: t.String({ minLength: 2, maxLength: 255 }),
  partNumber: t.Optional(t.String()),
  brand: t.Optional(t.String()),
  hsnSac: t.Optional(t.String()),
  quantity: t.Optional(t.Number({ minimum: 1, maximum: 999 })),
  unitPrice: t.String(),
  gstRate: t.Optional(t.Union([t.Literal(0), t.Literal(5), t.Literal(12), t.Literal(18), t.Literal(28)])),
  source: t.Optional(t.Union([t.Literal("own_stock"), t.Literal("marketplace"), t.Literal("customer")])),
  warrantyMonths: t.Optional(t.Number({ minimum: 0, maximum: 120 })),
});

const INSPECTION: Record<string, string[]> = {
  automotive: ["Engine oil", "Brakes", "Tyres", "Battery", "Lights", "Suspension", "Clutch", "AC / Cooling"],
  pumps: ["Power supply", "Capacitor", "Winding", "Impeller", "Seal / leaks", "Bearings", "Pressure", "Noise"],
  appliances: ["Power supply", "PCB", "Motor", "Gas / coolant", "Wiring", "Sensors", "Noise", "Safety"],
  power: ["Battery", "Fuel / oil", "Alternator", "AVR", "Wiring", "Cooling", "Load test", "Noise"],
  agriculture: ["Engine oil", "Hydraulics", "Tyres", "PTO", "Clutch", "Battery", "Filters", "Lights"],
};
const GENERIC_INSPECTION = ["Visual check", "Power / supply", "Moving parts", "Leaks", "Wiring", "Noise / vibration", "Safety"];
export const inspectionFor = (industry: string | null | undefined) =>
  (INSPECTION[industry ?? "automotive"] ?? GENERIC_INSPECTION).map((label) => ({ label, status: "ok" as const }));

type Garage = NonNullable<Awaited<ReturnType<typeof garageForUser>>>;
type Machine = typeof vehicles.$inferSelect;

/** Open a job card on a machine, asking the owner's consent to write to its passport. */
export async function openJob(
  garage: Garage,
  vehicle: Machine,
  input: { customerName?: string | null; customerPhone?: string | null; odometerKm?: number | null; complaint?: string | null; preGranted?: boolean },
) {
  const [access] = await db
    .insert(vehicleAccess)
    .values({ vehicleId: vehicle.id, garageId: garage.id, token: token(), status: input.preGranted ? "granted" : "pending", decidedAt: input.preGranted ? new Date() : null })
    .onConflictDoNothing()
    .returning();
  if (input.preGranted && !access) {
    await db.update(vehicleAccess).set({ status: "granted", decidedAt: new Date() })
      .where(and(eq(vehicleAccess.vehicleId, vehicle.id), eq(vehicleAccess.garageId, garage.id)));
  }
  if (access && !input.preGranted && vehicle.ownerId) {
    await db.insert(notifications).values({
      userId: vehicle.ownerId,
      type: "vehicle_access",
      title: `${garage.name} wants to add a service to ${idDisplay(vehicle)}`,
      message: "Allow them to record service, parts and invoices in your passport.",
      metadata: { vehicleId: vehicle.id, accessId: access.id },
    });
  }
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(jobCards).where(eq(jobCards.garageId, garage.id));
  const [job] = await db.insert(jobCards).values({
    garageId: garage.id,
    vehicleId: vehicle.id,
    number: `JC-${String(n + 1).padStart(4, "0")}`,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    odometerKm: input.odometerKm ?? null,
    complaint: input.complaint ?? null,
    inspection: inspectionFor(vehicle.industrySlug),
  }).returning();
  if (input.odometerKm && (!vehicle.odometerKm || input.odometerKm > vehicle.odometerKm)) {
    await db.update(vehicles).set({ odometerKm: input.odometerKm, updatedAt: new Date() }).where(eq(vehicles.id, vehicle.id));
  }
  return job!;
}

/** Load a job and assert it belongs to the caller's garage. */
async function loadJob(garageId: string, jobId: string) {
  const [job] = await db.select().from(jobCards).where(and(eq(jobCards.id, jobId), eq(jobCards.garageId, garageId))).limit(1);
  return job ?? null;
}

export const garageRoutes = new Elysia({ prefix: "/garage" })
  .use(authGuard)
  .derive(async ({ user }) => ({ garage: await garageForUser(user.id) }))

  // ─── Set up / view garage profile ───
  .post(
    "/",
    async ({ body, user, garage, set }) => {
      if (garage) {
        const [g] = await db.update(garages).set({ ...body }).where(eq(garages.id, garage.id)).returning();
        return { garage: g };
      }
      const [g] = await db.insert(garages).values({ ownerId: user.id, ...body }).returning();
      set.status = 201;
      return { garage: g };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, maxLength: 160 }),
        gstin: t.Optional(t.String({ maxLength: 20 })),
        phone: t.Optional(t.String({ maxLength: 20 })),
        addressLine: t.Optional(t.String({ maxLength: 255 })),
        city: t.Optional(t.String({ maxLength: 100 })),
        state: t.Optional(t.String({ maxLength: 100 })),
        pincode: t.Optional(t.String({ maxLength: 10 })),
        upiId: t.Optional(t.String({ maxLength: 100 })),
        invoicePrefix: t.Optional(t.String({ maxLength: 10 })),
        specialisations: t.Optional(t.Array(t.String())),
        industrySlugs: t.Optional(t.Array(t.String({ maxLength: 40 }), { maxItems: 10 })),
      }),
      detail: { summary: "Create or update my garage", tags: ["Garage"] },
    }
  )

  .get(
    "/me",
    async ({ garage }) => {
      if (!garage) return { garage: null };
      const [stats] = await db.execute<{ open_jobs: number; ready_jobs: number; unpaid_count: number; unpaid_total: string; today_collected: string; month_revenue: string; vehicles: number }>(sql`
        SELECT
          (SELECT count(*)::int FROM job_cards WHERE garage_id = ${garage.id} AND status IN ('open','estimate_sent','approved','in_progress')) AS open_jobs,
          (SELECT count(*)::int FROM job_cards WHERE garage_id = ${garage.id} AND status = 'ready') AS ready_jobs,
          (SELECT count(*)::int FROM invoices WHERE garage_id = ${garage.id} AND status = 'unpaid') AS unpaid_count,
          (SELECT coalesce(sum(total),0)::numeric(12,2)::text FROM invoices WHERE garage_id = ${garage.id} AND status = 'unpaid') AS unpaid_total,
          (SELECT coalesce(sum(total),0)::numeric(12,2)::text FROM invoices WHERE garage_id = ${garage.id} AND status = 'paid' AND paid_at::date = now()::date) AS today_collected,
          (SELECT coalesce(sum(total),0)::numeric(12,2)::text FROM invoices WHERE garage_id = ${garage.id} AND status <> 'void' AND date_trunc('month', issued_at) = date_trunc('month', now())) AS month_revenue,
          (SELECT count(DISTINCT vehicle_id)::int FROM job_cards WHERE garage_id = ${garage.id}) AS vehicles
      `);
      return { garage, stats };
    },
    { detail: { summary: "My garage + dashboard stats", tags: ["Garage"] } }
  )

  // Everything below requires a garage profile.
  .onBeforeHandle(({ garage, path, set }) => {
    if (!garage && path !== "/garage" && path !== "/garage/me") {
      set.status = 403;
      return { error: "Set up your garage first" };
    }
  })

  // ─── Job cards ───
  .get(
    "/jobs",
    async ({ garage, query }) => {
      const conds = [eq(jobCards.garageId, garage!.id)];
      if (query.status === "active") conds.push(inArray(jobCards.status, ["open", "estimate_sent", "approved", "in_progress", "ready"]));
      else if (query.status === "billed") conds.push(inArray(jobCards.status, ["invoiced", "paid"]));
      const rows = await db
        .select({
          job: jobCards,
          regNo: vehicles.regNo,
          serialNo: vehicles.serialNo,
          nickname: vehicles.nickname,
          industrySlug: vehicles.industrySlug,
          makeName: vehicles.makeName,
          modelName: vehicles.modelName,
          variantName: vehicles.variantName,
          year: vehicles.year,
          estimateTotal: sql<string>`(SELECT coalesce(sum(quantity * unit_price * (1 + gst_rate/100.0)),0)::numeric(12,2)::text FROM job_items WHERE job_card_id = ${jobCards.id} AND approved)`,
          itemCount: sql<number>`(SELECT count(*)::int FROM job_items WHERE job_card_id = ${jobCards.id})`,
        })
        .from(jobCards)
        .innerJoin(vehicles, eq(vehicles.id, jobCards.vehicleId))
        .where(and(...conds))
        .orderBy(desc(jobCards.updatedAt))
        .limit(100);
      return {
        jobs: rows.map((r) => ({ ...r.job, regNo: r.regNo, regNoDisplay: idDisplay(r!), vehicleLabel: vehicleLabel(r), estimateTotal: r.estimateTotal, itemCount: r.itemCount })),
      };
    },
    { query: t.Object({ status: t.Optional(t.String()) }), detail: { tags: ["Garage"] } }
  )

  .post(
    "/jobs",
    async ({ body, garage, set }) => {
      let vehicle: Machine | undefined;
      if (body.regNo) {
        const reg = normalizeRegNo(body.regNo);
        if (!reg) { set.status = 400; return { error: "Enter a valid registration number" }; }
        [vehicle] = await db.select().from(vehicles).where(eq(vehicles.regNo, reg)).limit(1);
        if (!vehicle) {
          const rc = await lookupRegNo(reg);
          [vehicle] = await db.insert(vehicles).values({
            regNo: reg,
            variantId: rc?.variantId ?? null,
            makeName: rc?.makeName ?? "Unknown",
            modelName: rc?.modelName ?? "Vehicle",
            variantName: rc?.variantName ?? null,
            fuel: rc?.fuel ?? null,
            year: rc?.year ?? null,
            segment: rc?.segment ?? "car",
          }).returning();
        }
      } else {
        // Any other machine: find by brand + serial if we've seen it, else create.
        if (!body.makeName || !body.modelName) { set.status = 400; return { error: "Enter a registration number, or the machine's brand and model" }; }
        const serial = body.serialNo?.trim() || null;
        if (serial) {
          [vehicle] = await db.select().from(vehicles)
            .where(and(eq(vehicles.serialNo, serial), sql`lower(${vehicles.makeName}) = lower(${body.makeName})`)).limit(1);
        }
        if (!vehicle) {
          [vehicle] = await db.insert(vehicles).values({
            industrySlug: body.industrySlug ?? "automotive",
            machineType: body.machineType ?? null,
            serialNo: serial,
            makeName: body.makeName,
            modelName: body.modelName,
          }).returning();
        }
      }
      const job = await openJob(garage!, vehicle!, body);
      set.status = 201;
      return { job, vehicle: { ...vehicle, regNoDisplay: idDisplay(vehicle!), label: vehicleLabel(vehicle) } };
    },
    {
      body: t.Object({
        regNo: t.Optional(t.String()),
        industrySlug: t.Optional(t.String({ maxLength: 40 })),
        machineType: t.Optional(t.String({ maxLength: 80 })),
        makeName: t.Optional(t.String({ maxLength: 80 })),
        modelName: t.Optional(t.String({ maxLength: 80 })),
        serialNo: t.Optional(t.String({ maxLength: 60 })),
        customerName: t.Optional(t.String({ maxLength: 160 })),
        customerPhone: t.Optional(t.String({ maxLength: 20 })),
        odometerKm: t.Optional(t.Number({ minimum: 0, maximum: 2_000_000 })),
        complaint: t.Optional(t.String({ maxLength: 2000 })),
      }),
      detail: { summary: "Open a job card for a vehicle or any machine", tags: ["Garage"] },
    }
  )

  .get(
    "/jobs/:id",
    async ({ params, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, job.vehicleId)).limit(1);
      const items = await db.select().from(jobItems).where(eq(jobItems.jobCardId, job.id)).orderBy(jobItems.createdAt);
      const [access] = await db.select().from(vehicleAccess).where(and(eq(vehicleAccess.vehicleId, job.vehicleId), eq(vehicleAccess.garageId, garage!.id))).limit(1);
      const [invoice] = await db.select().from(invoices).where(eq(invoices.jobCardId, job.id)).limit(1);
      const inquiryIds = items.map((i) => i.inquiryId).filter(Boolean) as string[];
      const quotes = inquiryIds.length
        ? await db.select({ inquiryId: bids.inquiryId, n: sql<number>`count(*)::int`, best: sql<string>`min(${bids.price})::text` })
            .from(bids).where(inArray(bids.inquiryId, inquiryIds)).groupBy(bids.inquiryId)
        : [];
      const orderIds = items.map((i) => i.orderId).filter(Boolean) as string[];
      const linkedOrders = orderIds.length
        ? await db.select({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus, checkoutId: orders.checkoutId }).from(orders).where(inArray(orders.id, orderIds))
        : [];
      const totals = computeInvoice(items.filter((i) => i.approved).map((i) => ({ ...i, gstRate: i.gstRate })));
      return {
        job,
        vehicle: { ...vehicle, regNoDisplay: idDisplay(vehicle!), label: vehicleLabel(vehicle!) },
        access: access ? { status: access.status } : null,
        ownerLinked: !!vehicle?.ownerId,
        items: items.map((i) => ({
          ...i,
          quotes: quotes.find((q) => q.inquiryId === i.inquiryId) ?? null,
          order: linkedOrders.find((o) => o.id === i.orderId) ?? null,
        })),
        totals: { taxable: totals.taxable, cgst: totals.cgst, sgst: totals.sgst, total: totals.total },
        invoice: invoice ?? null,
      };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Garage"] } }
  )

  .patch(
    "/jobs/:id",
    async ({ params, body, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      if (["invoiced", "paid"].includes(job.status)) { set.status = 400; return { error: "Invoiced jobs can't be edited" }; }
      const patch: Partial<typeof jobCards.$inferInsert> = { updatedAt: new Date() };
      if (body.inspection) patch.inspection = body.inspection;
      if (body.complaint !== undefined) patch.complaint = body.complaint;
      if (body.odometerKm !== undefined) patch.odometerKm = body.odometerKm;
      if (body.customerName !== undefined) patch.customerName = body.customerName;
      if (body.customerPhone !== undefined) patch.customerPhone = body.customerPhone;
      if (body.status) {
        patch.status = body.status;
        if (body.status === "ready") patch.completedAt = new Date();
      }
      const [j] = await db.update(jobCards).set(patch).where(eq(jobCards.id, job.id)).returning();
      return { job: j };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        inspection: t.Optional(t.Array(t.Object({ label: t.String(), status: t.Union([t.Literal("ok"), t.Literal("attention"), t.Literal("urgent")]), note: t.Optional(t.String()) }))),
        complaint: t.Optional(t.String({ maxLength: 2000 })),
        odometerKm: t.Optional(t.Number({ minimum: 0 })),
        customerName: t.Optional(t.String()),
        customerPhone: t.Optional(t.String()),
        // Owner approval comes from the estimate link, not from here.
        status: t.Optional(t.Union([t.Literal("in_progress"), t.Literal("ready"), t.Literal("cancelled")])),
      }),
      detail: { tags: ["Garage"] },
    }
  )

  // ─── Job lines ───
  .post(
    "/jobs/:id/items",
    async ({ params, body, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      if (["invoiced", "paid"].includes(job.status)) { set.status = 400; return { error: "Invoiced jobs can't be edited" }; }
      if (!(parseFloat(body.unitPrice) >= 0)) { set.status = 400; return { error: "Enter a valid price" }; }
      const [item] = await db.insert(jobItems).values({
        jobCardId: job.id,
        kind: body.kind,
        name: body.name,
        partNumber: body.partNumber ?? null,
        brand: body.brand ?? null,
        hsnSac: body.hsnSac ?? (body.kind === "labour" ? "9987" : "8708"),
        quantity: body.quantity ?? 1,
        unitPrice: parseFloat(body.unitPrice).toFixed(2),
        gstRate: body.gstRate ?? (body.kind === "labour" ? 18 : 28),
        source: body.source ?? "own_stock",
        warrantyMonths: body.warrantyMonths ?? 0,
        approved: true,
      }).returning();
      await db.update(jobCards).set({ updatedAt: new Date() }).where(eq(jobCards.id, job.id));
      set.status = 201;
      return { item };
    },
    { params: t.Object({ id: t.String() }), body: itemBody, detail: { tags: ["Garage"] } }
  )

  .patch(
    "/jobs/:id/items/:itemId",
    async ({ params, body, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      if (["invoiced", "paid"].includes(job.status)) { set.status = 400; return { error: "Invoiced jobs can't be edited" }; }
      const patch: Partial<typeof jobItems.$inferInsert> = {};
      for (const k of ["name", "partNumber", "brand", "hsnSac", "quantity", "gstRate", "warrantyMonths", "fitted", "serialNo"] as const) {
        if (body[k] !== undefined) (patch as Record<string, unknown>)[k] = body[k];
      }
      if (body.unitPrice !== undefined) patch.unitPrice = parseFloat(body.unitPrice).toFixed(2);
      const [item] = await db.update(jobItems).set(patch).where(and(eq(jobItems.id, params.itemId), eq(jobItems.jobCardId, job.id))).returning();
      if (!item) { set.status = 404; return { error: "Line not found" }; }
      return { item };
    },
    {
      params: t.Object({ id: t.String(), itemId: t.String() }),
      body: t.Partial(t.Object({
        name: t.String(), partNumber: t.String(), brand: t.String(), hsnSac: t.String(),
        quantity: t.Number({ minimum: 1 }), unitPrice: t.String(), gstRate: t.Number(),
        warrantyMonths: t.Number({ minimum: 0 }), fitted: t.Boolean(), serialNo: t.String(),
      })),
      detail: { tags: ["Garage"] },
    }
  )

  .delete(
    "/jobs/:id/items/:itemId",
    async ({ params, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job || ["invoiced", "paid"].includes(job.status)) { set.status = 400; return { error: "Can't remove this line" }; }
      await db.delete(jobItems).where(and(eq(jobItems.id, params.itemId), eq(jobItems.jobCardId, job.id)));
      return { ok: true };
    },
    { params: t.Object({ id: t.String(), itemId: t.String() }), detail: { tags: ["Garage"] } }
  )

  // ─── Share estimate with the owner (WhatsApp link in production) ───
  .post(
    "/jobs/:id/send-estimate",
    async ({ params, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(jobItems).where(eq(jobItems.jobCardId, job.id));
      if (!n) { set.status = 400; return { error: "Add at least one part or labour line first" }; }
      // Re-sending resets line approvals so the owner reviews the current estimate.
      await db.update(jobItems).set({ approved: true }).where(eq(jobItems.jobCardId, job.id));
      const [j] = await db.update(jobCards)
        .set({ status: "estimate_sent", estimateToken: job.estimateToken ?? token(), estimateSentAt: new Date(), approvedAt: null, updatedAt: new Date() })
        .where(eq(jobCards.id, job.id)).returning();
      return { job: j, estimatePath: `/e/${j.estimateToken}` };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Garage"] } }
  )

  // ─── Source a part from the marketplace for a job line ───
  .post(
    "/jobs/:id/items/:itemId/request-quotes",
    async ({ params, body, garage, user, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      const [item] = await db.select().from(jobItems).where(and(eq(jobItems.id, params.itemId), eq(jobItems.jobCardId, job.id))).limit(1);
      if (!item || item.kind !== "part") { set.status = 400; return { error: "Pick a part line" }; }
      if (item.inquiryId) return { inquiryId: item.inquiryId };
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, job.vehicleId)).limit(1);
      const [inq] = await db.insert(inquiries).values({
        buyerId: user.id,
        partName: item.name,
        make: vehicle!.makeName,
        model: [vehicle!.modelName, vehicle!.variantName].filter(Boolean).join(" "),
        year: String(vehicle!.year ?? ""),
        description: [body.note, item.partNumber ? `Part no. ${item.partNumber}` : null, `For job ${job.number} · ${garage!.name}, ${garage!.city ?? ""}`].filter(Boolean).join(" · "),
        vehicleId: vehicle!.id,
        jobCardId: job.id,
        city: garage!.city ?? null,
      }).returning();
      await db.update(jobItems).set({ inquiryId: inq.id, source: "marketplace" }).where(eq(jobItems.id, item.id));
      broadcastInquiryCreated({ ...inq, buyerName: garage!.name, bidCount: 0 });
      set.status = 201;
      return { inquiryId: inq.id };
    },
    { params: t.Object({ id: t.String(), itemId: t.String() }), body: t.Object({ note: t.Optional(t.String({ maxLength: 500 })) }), detail: { summary: "Ask verified sellers to quote for this part", tags: ["Garage"] } }
  )

  // ─── Issue a verifiable GST invoice ───
  .post(
    "/jobs/:id/invoice",
    async ({ params, garage, set }) => {
      const job = await loadJob(garage!.id, params.id);
      if (!job) { set.status = 404; return { error: "Job not found" }; }
      if (!["approved", "in_progress", "ready"].includes(job.status)) {
        set.status = 400;
        return { error: job.status === "estimate_sent" ? "Waiting for the owner to approve the estimate" : "Get the estimate approved first" };
      }
      const [existing] = await db.select().from(invoices).where(eq(invoices.jobCardId, job.id)).limit(1);
      if (existing) return { invoice: existing };
      const items = (await db.select().from(jobItems).where(eq(jobItems.jobCardId, job.id))).filter((i) => i.approved);
      if (!items.length) { set.status = 400; return { error: "No approved lines to bill" }; }
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, job.vehicleId)).limit(1);
      const calc = computeInvoice(items);
      // Reserve the next number atomically.
      const [g] = await db.update(garages).set({ nextInvoiceNo: sql`${garages.nextInvoiceNo} + 1` }).where(eq(garages.id, garage!.id)).returning({ next: garages.nextInvoiceNo });
      const number = `${garage!.invoicePrefix}-${new Date().getFullYear()}-${String(g!.next - 1).padStart(4, "0")}`;
      const issuedAt = new Date();
      const content = {
        number,
        issuedAt,
        seller: { name: garage!.name, gstin: garage!.gstin, address: [garage!.addressLine, garage!.city, garage!.state, garage!.pincode].filter(Boolean).join(", "), phone: garage!.phone },
        customer: { name: job.customerName, phone: job.customerPhone },
        vehicle: { regNo: idDisplay(vehicle!), label: vehicleLabel(vehicle!), odometerKm: job.odometerKm },
        lines: calc.lines,
        taxable: calc.taxable, cgst: calc.cgst, sgst: calc.sgst, total: calc.total,
      };
      const [inv] = await db.insert(invoices).values({
        garageId: garage!.id, jobCardId: job.id, vehicleId: vehicle!.id, ...content,
        contentHash: invoiceHash(content), verifyCode: verifyCode(), payToken: token(),
      }).returning();
      // Passport: record every billed part with its warranty.
      for (const it of items.filter((i) => i.kind === "part")) {
        await db.insert(fittedParts).values({
          vehicleId: vehicle!.id, jobCardId: job.id, jobItemId: it.id, orderId: it.orderId, garageName: garage!.name,
          name: it.name, partNumber: it.partNumber, brand: it.brand, serialNo: it.serialNo, sellerName: it.sellerName,
          fittedAt: issuedAt, odometerKm: job.odometerKm,
          warrantyUntil: it.warrantyMonths ? new Date(issuedAt.getTime() + it.warrantyMonths * 30.44 * 864e5) : null,
        });
      }
      await db.update(jobCards).set({ status: "invoiced", completedAt: job.completedAt ?? issuedAt, updatedAt: new Date() }).where(eq(jobCards.id, job.id));
      if (vehicle!.ownerId) {
        await db.insert(notifications).values({
          userId: vehicle!.ownerId, type: "invoice", title: `Invoice ${number} from ${garage!.name}`,
          message: `₹${calc.total} for ${idDisplay(vehicle!)}. Pay online or at the garage.`,
          metadata: { invoiceId: inv.id, payToken: inv.payToken },
        });
      }
      set.status = 201;
      return { invoice: inv };
    },
    { params: t.Object({ id: t.String() }), detail: { summary: "Issue a GST invoice with verification QR", tags: ["Garage"] } }
  )

  .get(
    "/invoices",
    async ({ garage }) => {
      const list = await db.select().from(invoices).where(eq(invoices.garageId, garage!.id)).orderBy(desc(invoices.issuedAt)).limit(200);
      return { invoices: list };
    },
    { detail: { tags: ["Garage"] } }
  )

  .get(
    "/invoices/:id",
    async ({ params, garage, set }) => {
      const [inv] = await db.select().from(invoices).where(and(eq(invoices.id, params.id), eq(invoices.garageId, garage!.id))).limit(1);
      if (!inv) { set.status = 404; return { error: "Invoice not found" }; }
      return { invoice: inv, garage };
    },
    { params: t.Object({ id: t.String() }), detail: { tags: ["Garage"] } }
  )

  // Cash/UPI collected at the counter.
  .post(
    "/invoices/:id/mark-paid",
    async ({ params, body, garage, set }) => {
      const [inv] = await db.select().from(invoices).where(and(eq(invoices.id, params.id), eq(invoices.garageId, garage!.id))).limit(1);
      if (!inv) { set.status = 404; return { error: "Invoice not found" }; }
      const paid = await markInvoicePaid(inv.id, body.method);
      return { invoice: paid ?? inv };
    },
    { params: t.Object({ id: t.String() }), body: t.Object({ method: t.Union([t.Literal("cash"), t.Literal("upi"), t.Literal("card")]) }), detail: { tags: ["Garage"] } }
  )

  // Customers/vehicles this garage has served (CRM-lite).
  .get(
    "/customers",
    async ({ garage }) => {
      const rows = await db.execute<{ vehicle_id: string; reg_no: string | null; serial_no: string | null; nickname: string | null; industry_slug: string; make_name: string; model_name: string; customer_name: string | null; customer_phone: string | null; visits: number; last_visit: string; spent: string }>(sql`
        SELECT v.id AS vehicle_id, v.reg_no, v.serial_no, v.nickname, v.industry_slug, v.make_name, v.model_name,
               (array_agg(j.customer_name ORDER BY j.created_at DESC))[1] AS customer_name,
               (array_agg(j.customer_phone ORDER BY j.created_at DESC))[1] AS customer_phone,
               count(j.id)::int AS visits, max(j.created_at) AS last_visit,
               coalesce((SELECT sum(total) FROM invoices i WHERE i.vehicle_id = v.id AND i.garage_id = ${garage!.id} AND i.status = 'paid'), 0)::numeric(12,2)::text AS spent
        FROM job_cards j JOIN vehicles v ON v.id = j.vehicle_id
        WHERE j.garage_id = ${garage!.id}
        GROUP BY v.id ORDER BY last_visit DESC LIMIT 200`);
      return { customers: [...rows].map((r) => ({ ...r, reg_no_display: idDisplay({ regNo: r.reg_no, serialNo: r.serial_no, nickname: r.nickname }) })) };
    },
    { detail: { tags: ["Garage"] } }
  );

