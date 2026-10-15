import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { vehicles, garages } from "./vehicles";
import { orders } from "./orders";
import { inquiries } from "./inquiries";

// ─── Job cards (Garage OS) ───────────────────────────
export const jobStatusEnum = pgEnum("job_status", [
  "open",           // vehicle checked in
  "estimate_sent",  // estimate shared with the owner
  "approved",       // owner approved (all or some lines)
  "in_progress",    // work underway / waiting for parts
  "ready",          // work done, ready to invoice
  "invoiced",       // invoice issued, awaiting payment
  "paid",           // invoice paid
  "cancelled",
]);

export type InspectionPoint = { label: string; status: "ok" | "attention" | "urgent"; note?: string };

export const jobCards = pgTable("job_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  garageId: uuid("garage_id").notNull().references(() => garages.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  number: varchar("number", { length: 20 }).notNull(),
  customerName: varchar("customer_name", { length: 160 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  odometerKm: integer("odometer_km"),
  complaint: text("complaint"),
  inspection: jsonb("inspection").$type<InspectionPoint[]>().default([]),
  status: jobStatusEnum("status").notNull().default("open"),
  // Public estimate-approval link (no login).
  estimateToken: varchar("estimate_token", { length: 40 }),
  estimateSentAt: timestamp("estimate_sent_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byGarage: index("job_cards_garage_idx").on(t.garageId),
  byVehicle: index("job_cards_vehicle_idx").on(t.vehicleId),
  byEstimateToken: uniqueIndex("job_cards_estimate_token_uq").on(t.estimateToken),
}));

export const jobItemKindEnum = pgEnum("job_item_kind", ["part", "labour"]);
export const jobItemSourceEnum = pgEnum("job_item_source", ["own_stock", "marketplace", "customer"]);

export const jobItems = pgTable("job_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobCardId: uuid("job_card_id").notNull().references(() => jobCards.id, { onDelete: "cascade" }),
  kind: jobItemKindEnum("kind").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  hsnSac: varchar("hsn_sac", { length: 12 }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  gstRate: integer("gst_rate").notNull().default(18), // percent
  // Owner can decline individual lines on the estimate.
  approved: boolean("approved").notNull().default(true),
  source: jobItemSourceEnum("source").notNull().default("own_stock"),
  inquiryId: uuid("inquiry_id").references(() => inquiries.id, { onDelete: "set null" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  sellerName: varchar("seller_name", { length: 160 }),
  warrantyMonths: integer("warranty_months").notNull().default(0),
  serialNo: varchar("serial_no", { length: 100 }),
  fitted: boolean("fitted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ byJob: index("job_items_job_idx").on(t.jobCardId) }));

// ─── Invoices (verifiable) ───────────────────────────
export const invoiceStatusEnum = pgEnum("invoice_status", ["unpaid", "paid", "void"]);

export type InvoiceLine = {
  kind: "part" | "labour";
  name: string;
  partNumber?: string | null;
  brand?: string | null;
  hsnSac?: string | null;
  quantity: number;
  unitPrice: string;
  gstRate: number;
  taxable: string;
  tax: string;
  total: string;
};

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  garageId: uuid("garage_id").notNull().references(() => garages.id, { onDelete: "cascade" }),
  jobCardId: uuid("job_card_id").notNull().references(() => jobCards.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  number: varchar("number", { length: 30 }).notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  // Snapshots: the invoice must not change if the garage/vehicle record does.
  seller: jsonb("seller").$type<{ name: string; gstin?: string | null; address?: string | null; phone?: string | null }>().notNull(),
  customer: jsonb("customer").$type<{ name?: string | null; phone?: string | null }>().notNull(),
  vehicle: jsonb("vehicle").$type<{ regNo: string; label: string; odometerKm?: number | null }>().notNull(),
  lines: jsonb("lines").$type<InvoiceLine[]>().notNull(),
  taxable: numeric("taxable", { precision: 12, scale: 2 }).notNull(),
  cgst: numeric("cgst", { precision: 12, scale: 2 }).notNull(),
  sgst: numeric("sgst", { precision: 12, scale: 2 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  // sha256 over the canonical invoice content; the public verify page recomputes it.
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  // Short public id printed under the QR (e.g. FMS-7KQ2-9XWD).
  verifyCode: varchar("verify_code", { length: 20 }).notNull(),
  payToken: varchar("pay_token", { length: 40 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("unpaid"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paymentMethod: varchar("payment_method", { length: 30 }),
}, (t) => ({
  byGarage: index("invoices_garage_idx").on(t.garageId),
  byVerify: uniqueIndex("invoices_verify_code_uq").on(t.verifyCode),
  byPayToken: uniqueIndex("invoices_pay_token_uq").on(t.payToken),
  byNumber: uniqueIndex("invoices_garage_number_uq").on(t.garageId, t.number),
}));

// ─── Fitted parts (passport + warranty wallet + provenance) ───
export const fittedParts = pgTable("fitted_parts", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  jobCardId: uuid("job_card_id").references(() => jobCards.id, { onDelete: "set null" }),
  jobItemId: uuid("job_item_id").references(() => jobItems.id, { onDelete: "set null" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  garageName: varchar("garage_name", { length: 160 }),
  name: varchar("name", { length: 255 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  serialNo: varchar("serial_no", { length: 100 }),
  sellerName: varchar("seller_name", { length: 160 }),
  fittedAt: timestamp("fitted_at", { withTimezone: true }).defaultNow().notNull(),
  odometerKm: integer("odometer_km"),
  warrantyUntil: timestamp("warranty_until", { withTimezone: true }),
  fitConfirmed: boolean("fit_confirmed"),
}, (t) => ({ byVehicle: index("fitted_parts_vehicle_idx").on(t.vehicleId) }));

// ─── Confirmed fitment graph ─────────────────────────
export const fitmentSourceEnum = pgEnum("fitment_source", ["seller", "order_confirmed", "job_fitted"]);
export const fitments = pgTable("fitments", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id"),
  partNumber: varchar("part_number", { length: 100 }),
  makeName: varchar("make_name", { length: 80 }).notNull(),
  modelName: varchar("model_name", { length: 80 }).notNull(),
  variantName: varchar("variant_name", { length: 80 }),
  year: integer("year"),
  source: fitmentSourceEnum("source").notNull(),
  confirmedBy: uuid("confirmed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byProduct: index("fitments_product_idx").on(t.productId),
  byModel: index("fitments_model_idx").on(t.makeName, t.modelName),
}));
