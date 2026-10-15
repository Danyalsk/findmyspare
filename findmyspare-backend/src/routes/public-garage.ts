import { Elysia, t } from "elysia";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { garages, jobCards, jobItems, vehicles, invoices, payments, notifications } from "../db/schema";
import { computeInvoice, invoiceHash, formatRegNo,
  idDisplay, vehicleLabel } from "../lib/garage";
import { completeMockPayment, PAYMENTS_MODE, PAYMENTS_OFF_MESSAGE } from "../lib/commerce";
import { rateLimit, rateLimitKey } from "../lib/rate-limit";
import { buildPassport } from "./vehicles";

// Unauthenticated, token-scoped pages: estimate approval, invoice verification,
// invoice payment and shared passports. Tokens are unguessable (≥120 bits);
// every route is rate-limited per IP.
const guard = (request: Request, set: { status?: number | string }, bucket: string, max = 60) => {
  const r = rateLimit(rateLimitKey(request, bucket), max, 60_000);
  if (!r.ok) { set.status = 429; return false; }
  return true;
};

async function estimateByToken(tok: string) {
  const [row] = await db
    .select({ job: jobCards, garage: garages, vehicle: vehicles })
    .from(jobCards)
    .innerJoin(garages, eq(garages.id, jobCards.garageId))
    .innerJoin(vehicles, eq(vehicles.id, jobCards.vehicleId))
    .where(eq(jobCards.estimateToken, tok))
    .limit(1);
  return row ?? null;
}

export const publicGarageRoutes = new Elysia({ prefix: "/public" })

  // ─── Estimate (owner approves lines from a WhatsApp link) ───
  .get(
    "/estimates/:token",
    async ({ params, request, set }) => {
      if (!guard(request, set, "pub-est")) return { error: "Too many requests" };
      const row = await estimateByToken(params.token);
      if (!row) { set.status = 404; return { error: "Estimate not found" }; }
      const items = await db.select().from(jobItems).where(eq(jobItems.jobCardId, row.job.id)).orderBy(jobItems.createdAt);
      const all = computeInvoice(items);
      return {
        garage: { name: row.garage.name, city: row.garage.city, phone: row.garage.phone, verified: row.garage.verified },
        vehicle: { regNoDisplay: idDisplay(row.vehicle), label: vehicleLabel(row.vehicle) },
        job: { number: row.job.number, status: row.job.status, complaint: row.job.complaint, inspection: row.job.inspection, odometerKm: row.job.odometerKm, approvedAt: row.job.approvedAt, customerName: row.job.customerName },
        items: items.map((i, idx) => ({ id: i.id, kind: i.kind, name: i.name, brand: i.brand, quantity: i.quantity, unitPrice: i.unitPrice, gstRate: i.gstRate, approved: i.approved, total: all.lines[idx]!.total, warrantyMonths: i.warrantyMonths })),
        total: all.total,
      };
    },
    { params: t.Object({ token: t.String() }), detail: { tags: ["Public"] } }
  )

  .post(
    "/estimates/:token/approve",
    async ({ params, body, request, set }) => {
      if (!guard(request, set, "pub-est-approve", 20)) return { error: "Too many requests" };
      const row = await estimateByToken(params.token);
      if (!row) { set.status = 404; return { error: "Estimate not found" }; }
      if (row.job.status !== "estimate_sent") { set.status = 409; return { error: "This estimate was already answered" }; }
      const items = await db.select({ id: jobItems.id }).from(jobItems).where(eq(jobItems.jobCardId, row.job.id));
      const keep = new Set(body.approvedItemIds.filter((id) => items.some((i) => i.id === id)));
      if (!keep.size) { set.status = 400; return { error: "Approve at least one item, or call the garage" }; }
      const declined = items.filter((i) => !keep.has(i.id)).map((i) => i.id);
      if (declined.length) await db.update(jobItems).set({ approved: false }).where(inArray(jobItems.id, declined));
      await db.update(jobCards).set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() }).where(eq(jobCards.id, row.job.id));
      await db.insert(notifications).values({
        userId: row.garage.ownerId, type: "estimate_approved",
        title: `Estimate approved · ${idDisplay(row.vehicle)}`,
        message: declined.length ? `${keep.size} approved, ${declined.length} declined.` : "All items approved. You can start work.",
        metadata: { jobCardId: row.job.id },
      });
      return { ok: true, approved: keep.size, declined: declined.length };
    },
    { params: t.Object({ token: t.String() }), body: t.Object({ approvedItemIds: t.Array(t.String(), { maxItems: 200 }) }), detail: { tags: ["Public"] } }
  )

  // ─── Verify an invoice (QR on every invoice points here) ───
  .get(
    "/invoices/verify/:code",
    async ({ params, request, set }) => {
      if (!guard(request, set, "pub-verify")) return { error: "Too many requests" };
      const code = params.code.toUpperCase();
      const [inv] = await db.select().from(invoices).where(eq(invoices.verifyCode, code)).limit(1);
      if (!inv) return { found: false };
      const [g] = await db.select({ verified: garages.verified, gstin: garages.gstin }).from(garages).where(eq(garages.id, inv.garageId)).limit(1);
      const recomputed = invoiceHash({ ...inv, issuedAt: inv.issuedAt });
      return {
        found: true,
        genuine: recomputed === inv.contentHash,
        hash: inv.contentHash,
        invoice: {
          number: inv.number, issuedAt: inv.issuedAt, seller: inv.seller, vehicle: inv.vehicle,
          customer: { name: inv.customer.name ? inv.customer.name.replace(/(?<=^.).*(?=.$)/, (m) => "•".repeat(Math.min(m.length, 6))) : null },
          lines: inv.lines, taxable: inv.taxable, cgst: inv.cgst, sgst: inv.sgst, total: inv.total,
          status: inv.status, paidAt: inv.paidAt, paymentMethod: inv.paymentMethod, verifyCode: inv.verifyCode,
        },
        garageVerified: g?.verified ?? false,
      };
    },
    { params: t.Object({ code: t.String({ maxLength: 20 }) }), detail: { summary: "Verify an invoice is genuine, unaltered and paid", tags: ["Public"] } }
  )

  // ─── Pay an invoice (payment link) ───
  .get(
    "/invoices/pay/:token",
    async ({ params, request, set }) => {
      if (!guard(request, set, "pub-pay")) return { error: "Too many requests" };
      const [inv] = await db.select().from(invoices).where(eq(invoices.payToken, params.token)).limit(1);
      if (!inv) { set.status = 404; return { error: "Invoice not found" }; }
      const [g] = await db.select({ upiId: garages.upiId }).from(garages).where(eq(garages.id, inv.garageId)).limit(1);
      return { invoice: { ...inv, contentHash: undefined, payToken: undefined }, upiId: g?.upiId ?? null };
    },
    { params: t.Object({ token: t.String() }), detail: { tags: ["Public"] } }
  )

  .post(
    "/invoices/pay/:token",
    async ({ params, body, request, set }) => {
      if (PAYMENTS_MODE === "off") { set.status = 503; return { error: PAYMENTS_OFF_MESSAGE }; }
      if (!guard(request, set, "pub-pay-do", 10)) return { error: "Too many requests" };
      const [inv] = await db.select().from(invoices).where(eq(invoices.payToken, params.token)).limit(1);
      if (!inv) { set.status = 404; return { error: "Invoice not found" }; }
      if (inv.status !== "unpaid") { set.status = 409; return { error: "This invoice is already paid" }; }
      const [p] = await db.insert(payments).values({ purpose: "invoice", refId: inv.id, amount: inv.total }).returning();
      const result = await completeMockPayment(p.id, body.outcome, body.method);
      return { payment: result };
    },
    {
      params: t.Object({ token: t.String() }),
      body: t.Object({
        method: t.Union([t.Literal("upi"), t.Literal("card"), t.Literal("netbanking")]),
        outcome: t.Union([t.Literal("success"), t.Literal("failure")]),
      }),
      detail: { summary: "Pay an invoice via the (mock) gateway", tags: ["Public"] },
    }
  )

  // ─── Shared vehicle history (owner-chosen sections) ───
  .get(
    "/passport/:token",
    async ({ params, request, set }) => {
      if (!guard(request, set, "pub-passport")) return { error: "Too many requests" };
      const [v] = await db.select().from(vehicles).where(and(eq(vehicles.shareToken, params.token))).limit(1);
      if (!v || !v.shareSections) { set.status = 404; return { error: "This link is no longer shared" }; }
      const p = await buildPassport(v.id);
      if (!p) { set.status = 404; return { error: "Not found" }; }
      const s = v.shareSections;
      return {
        vehicle: { regNoDisplay: p.vehicle.regNoDisplay.replace(/\d{2,4}$/, (m) => "•".repeat(m.length)), label: p.vehicle.label, segment: p.vehicle.segment },
        sections: s,
        stats: p.stats,
        services: s.services ? p.services.map((x) => ({ ...x, invoice: s.invoices && x.invoice ? { number: x.invoice.number, total: x.invoice.total, verifyCode: x.invoice.verifyCode, status: x.invoice.status } : null })) : [],
        parts: s.parts ? p.parts.map((x) => ({ name: x.name, brand: x.brand, fittedAt: x.fittedAt, odometerKm: x.odometerKm, garageName: x.garageName, warrantyActive: x.warrantyActive, fitConfirmed: x.fitConfirmed })) : [],
        odometer: s.odometer ? p.odometer : [],
      };
    },
    { params: t.Object({ token: t.String() }), detail: { summary: "Read-only shared vehicle history", tags: ["Public"] } }
  );
