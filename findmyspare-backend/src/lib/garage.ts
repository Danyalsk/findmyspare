import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { vehicles, vehicleVariants, vehicleModels, vehicleMakes, garages } from "../db/schema";
import type { InvoiceLine } from "../db/schema";

/** "mh 12 ab 3456" → "MH12AB3456". Returns null if it isn't a plausible Indian plate. */
export function normalizeRegNo(input: string): string | null {
  const s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // State(2) + RTO(1-2) + series(0-3 letters) + number(1-4), or BH series (22BH1234AA).
  if (/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/.test(s) || /^\d{2}BH\d{4}[A-Z]{1,2}$/.test(s)) return s;
  return null;
}

/** Pretty-print for display: MH12AB3456 → MH 12 AB 3456. */
export function formatRegNo(s: string): string {
  const m = s.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  return m ? [m[1], m[2], m[3], m[4]].filter(Boolean).join(" ") : s;
}

export const token = (bytes = 18) => randomBytes(bytes).toString("base64url");

/** Short human code printed under the invoice QR, e.g. FMS-7KQ2-9XWD (Crockford base32, no I/L/O/U). */
export function verifyCode(): string {
  const A = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const b = randomBytes(8);
  const c = [...b].map((x) => A[x % 32]).join("");
  return `FMS-${c.slice(0, 4)}-${c.slice(4, 8)}`;
}

export type MockRc = {
  regNo: string;
  makeName: string;
  modelName: string;
  variantName: string | null;
  variantId: string | null;
  fuel: string | null;
  year: number | null;
  segment: "car" | "bike" | "scooter" | "commercial";
  source: "fms-record" | "mock-rc";
};

/**
 * Registration lookup. A real build would call a consented RC/VAHAN provider;
 * the prototype returns our own record if we have one, otherwise a deterministic
 * mock derived from the plate so the same number always gives the same vehicle.
 */
export async function lookupRegNo(regNo: string): Promise<MockRc | null> {
  const [own] = await db.select().from(vehicles).where(eq(vehicles.regNo, regNo)).limit(1);
  if (own) {
    return {
      regNo, makeName: own.makeName, modelName: own.modelName, variantName: own.variantName, variantId: own.variantId,
      fuel: own.fuel, year: own.year, segment: own.segment, source: "fms-record",
    };
  }
  const variants = await db
    .select({ id: vehicleVariants.id, name: vehicleVariants.name, fuel: vehicleVariants.fuel, yearFrom: vehicleVariants.yearFrom, yearTo: vehicleVariants.yearTo, model: vehicleModels.name, segment: vehicleModels.segment, make: vehicleMakes.name })
    .from(vehicleVariants)
    .innerJoin(vehicleModels, eq(vehicleModels.id, vehicleVariants.modelId))
    .innerJoin(vehicleMakes, eq(vehicleMakes.id, vehicleModels.makeId))
    .orderBy(vehicleVariants.id);
  if (!variants.length) return null;
  const h = createHash("sha256").update(regNo).digest();
  const v = variants[h.readUInt32BE(0) % variants.length]!;
  const to = v.yearTo ?? new Date().getFullYear();
  const year = v.yearFrom + (h[4]! % Math.max(1, to - v.yearFrom + 1));
  return { regNo, makeName: v.make, modelName: v.model, variantName: v.name, variantId: v.id, fuel: v.fuel, year, segment: v.segment, source: "mock-rc" };
}

// ─── GST maths (prices are exclusive of GST; intra-state → CGST + SGST) ───
const r2 = (n: number) => Math.round(n * 100) / 100;
export type BillableItem = { kind: "part" | "labour"; name: string; partNumber?: string | null; brand?: string | null; hsnSac?: string | null; quantity: number; unitPrice: string; gstRate: number };

export function computeInvoice(items: BillableItem[]) {
  const lines: InvoiceLine[] = items.map((i) => {
    const taxable = r2(i.quantity * parseFloat(i.unitPrice));
    const tax = r2((taxable * i.gstRate) / 100);
    return {
      kind: i.kind, name: i.name, partNumber: i.partNumber ?? null, brand: i.brand ?? null,
      hsnSac: i.hsnSac ?? (i.kind === "labour" ? "9987" : null),
      quantity: i.quantity, unitPrice: r2(parseFloat(i.unitPrice)).toFixed(2), gstRate: i.gstRate,
      taxable: taxable.toFixed(2), tax: tax.toFixed(2), total: r2(taxable + tax).toFixed(2),
    };
  });
  const taxable = r2(lines.reduce((s, l) => s + parseFloat(l.taxable), 0));
  const tax = r2(lines.reduce((s, l) => s + parseFloat(l.tax), 0));
  const cgst = r2(tax / 2);
  const sgst = r2(tax - cgst);
  return { lines, taxable: taxable.toFixed(2), cgst: cgst.toFixed(2), sgst: sgst.toFixed(2), total: r2(taxable + tax).toFixed(2) };
}

/** Deterministic JSON (sorted keys) so the hash is stable across key order. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(v ?? null);
}

export type HashableInvoice = {
  number: string;
  issuedAt: Date | string;
  seller: unknown;
  customer: unknown;
  vehicle: unknown;
  lines: unknown;
  taxable: string;
  cgst: string;
  sgst: string;
  total: string;
};

export function invoiceHash(inv: HashableInvoice): string {
  const body = {
    number: inv.number,
    issuedAt: new Date(inv.issuedAt).toISOString(),
    seller: inv.seller, customer: inv.customer, vehicle: inv.vehicle, lines: inv.lines,
    taxable: inv.taxable, cgst: inv.cgst, sgst: inv.sgst, total: inv.total,
  };
  return createHash("sha256").update(canonical(body)).digest("hex");
}

export async function garageForUser(userId: string) {
  const [g] = await db.select().from(garages).where(eq(garages.ownerId, userId)).limit(1);
  return g ?? null;
}

export const vehicleLabel = (v: { makeName: string; modelName: string; variantName?: string | null; year?: number | null; fuel?: string | null }) =>
  [v.makeName, v.modelName, v.variantName].filter(Boolean).join(" ") + (v.year ? ` · ${v.year}` : "") + (v.fuel ? ` · ${v.fuel[0]!.toUpperCase()}${v.fuel.slice(1)}` : "");
