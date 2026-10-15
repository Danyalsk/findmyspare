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
import { products } from "./products";

/* ═══════════════════════════════════════════════════════
   v3: one network for every spare part of every machine.
   Taxonomy is data (adding an industry = rows, not code);
   any business can hold many supply-chain roles; trades
   between businesses flow through purchase orders, price
   lists and a shared credit ledger (khata).
   ═══════════════════════════════════════════════════════ */

// ─── Taxonomy ────────────────────────────────────────
export const industries = pgTable("industries", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  tagline: varchar("tagline", { length: 160 }),
  icon: varchar("icon", { length: 40 }).notNull().default("engine"),
  tint: varchar("tint", { length: 9 }).notNull().default("#FFF1EB"),
  ink: varchar("ink", { length: 9 }).notNull().default("#A32D0C"),
  // How a machine in this industry is identified (Registration no., Serial no., …).
  identifierLabel: varchar("identifier_label", { length: 40 }).notNull().default("Serial no."),
  sortOrder: integer("sort_order").notNull().default(100),
  active: boolean("active").notNull().default(true),
});

export const machineTypes = pgTable("machine_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  industryId: uuid("industry_id").notNull().references(() => industries.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 60 }).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  // Spec fields shown when listing a part / adding a machine, e.g. [{key:"hp",label:"Power (HP)"}].
  attributes: jsonb("attributes").$type<{ key: string; label: string; unit?: string }[]>().default([]),
  brands: jsonb("brands").$type<string[]>().default([]),
  sortOrder: integer("sort_order").notNull().default(100),
}, (t) => ({ byIndustry: uniqueIndex("machine_types_industry_slug_uq").on(t.industryId, t.slug) }));

export const partCategories = pgTable("part_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  industryId: uuid("industry_id").notNull().references(() => industries.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  icon: varchar("icon", { length: 40 }).notNull().default("engine"),
  sortOrder: integer("sort_order").notNull().default(100),
}, (t) => ({ byIndustry: uniqueIndex("part_categories_industry_name_uq").on(t.industryId, t.name) }));

// ─── Supply-chain roles ──────────────────────────────
export const BUSINESS_ROLES = [
  "manufacturer",
  "super_stockist",
  "distributor",
  "wholesaler",
  "retailer",
  "service_center",
  "technician",
  "refurbisher",
  "recycler",
  "logistics",
  "business_buyer",
] as const;
export type BusinessRole = (typeof BUSINESS_ROLES)[number];

// ─── Trade links: who supplies whom ──────────────────
export const tradeLinkStatusEnum = pgEnum("trade_link_status", ["pending", "active", "blocked"]);
export const tradeLinks = pgTable("trade_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: tradeLinkStatusEnum("status").notNull().default("pending"),
  // Who asked (the other side approves).
  requestedBy: uuid("requested_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  priceListId: uuid("price_list_id"),
  creditLimit: numeric("credit_limit", { precision: 14, scale: 2 }).notNull().default("0"),
  creditDays: integer("credit_days").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byPair: uniqueIndex("trade_links_pair_uq").on(t.supplierId, t.buyerId),
  byBuyer: index("trade_links_buyer_idx").on(t.buyerId),
}));

// ─── Price lists (tier pricing) ──────────────────────
export const priceLists = pgTable("price_lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  // Default discount off the listing price for everyone on this list.
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ byOwner: index("price_lists_owner_idx").on(t.ownerId) }));

export const priceListItems = pgTable("price_list_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  priceListId: uuid("price_list_id").notNull().references(() => priceLists.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  minQty: integer("min_qty").notNull().default(1),
}, (t) => ({ byPair: uniqueIndex("price_list_items_pair_uq").on(t.priceListId, t.productId) }));

// ─── Purchase orders between businesses ──────────────
export const poStatusEnum = pgEnum("po_status", ["sent", "accepted", "rejected", "shipped", "received", "cancelled"]);
export type PoLine = { productId: string; name: string; partNumber?: string | null; brand?: string | null; quantity: number; unitPrice: string; gstRate: number; total: string };

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: varchar("number", { length: 30 }).notNull(),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: poStatusEnum("status").notNull().default("sent"),
  lines: jsonb("lines").$type<PoLine[]>().notNull(),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 14, scale: 2 }).notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  // "credit" posts to the khata with a due date; "advance" expects payment before dispatch.
  paymentTerms: varchar("payment_terms", { length: 20 }).notNull().default("credit"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  note: text("note"),
  sellerNote: text("seller_note"),
  trackingNote: varchar("tracking_note", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byBuyer: index("po_buyer_idx").on(t.buyerId),
  bySeller: index("po_seller_idx").on(t.sellerId),
}));

// ─── Ledger / khata (credit book) ────────────────────
// One row per money event between a business and a counterparty. Positive
// `amount` = counterparty owes the owner more (invoice); negative = paid.
export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", ["invoice", "payment", "credit_note", "opening"]);
export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Either a platform business/user, or an offline customer identified by phone.
  counterpartyId: uuid("counterparty_id").references(() => users.id, { onDelete: "set null" }),
  counterpartyName: varchar("counterparty_name", { length: 160 }),
  counterpartyPhone: varchar("counterparty_phone", { length: 20 }),
  type: ledgerEntryTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  refType: varchar("ref_type", { length: 20 }), // bill | po | manual
  refId: uuid("ref_id"),
  note: varchar("note", { length: 200 }),
  method: varchar("method", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byOwner: index("ledger_owner_idx").on(t.ownerId),
  byCounterparty: index("ledger_counterparty_idx").on(t.ownerId, t.counterpartyId, t.counterpartyPhone),
}));

// ─── Counter (POS) bills ─────────────────────────────
export type BillLine = { productId?: string | null; name: string; quantity: number; unitPrice: string; gstRate: number; total: string };
export const salesBills = pgTable("sales_bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  number: varchar("number", { length: 30 }).notNull(),
  customerName: varchar("customer_name", { length: 160 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerId: uuid("customer_id").references(() => users.id, { onDelete: "set null" }),
  lines: jsonb("lines").$type<BillLine[]>().notNull(),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 14, scale: 2 }).notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  paymentMode: varchar("payment_mode", { length: 20 }).notNull(), // cash | upi | card | credit
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ bySeller: index("sales_bills_seller_idx").on(t.sellerId) }));

// ─── Search events (demand radar) ────────────────────
export const searchEvents = pgTable("search_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  query: varchar("query", { length: 200 }),
  industrySlug: varchar("industry_slug", { length: 40 }),
  category: varchar("category", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  city: varchar("city", { length: 100 }),
  resultCount: integer("result_count").notNull().default(0),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ byCreated: index("search_events_created_idx").on(t.createdAt) }));

// ─── Service requests ("Fix": book a technician) ─────
export const serviceRequestStatusEnum = pgEnum("service_request_status", ["open", "accepted", "completed", "cancelled"]);
export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  industrySlug: varchar("industry_slug", { length: 40 }).notNull(),
  machineType: varchar("machine_type", { length: 80 }),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  vehicleId: uuid("vehicle_id"),
  problem: text("problem").notNull(),
  city: varchar("city", { length: 100 }),
  address: varchar("address", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  preferredTime: varchar("preferred_time", { length: 60 }),
  status: serviceRequestStatusEnum("status").notNull().default("open"),
  garageId: uuid("garage_id"),
  jobCardId: uuid("job_card_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byStatus: index("service_requests_status_idx").on(t.status, t.industrySlug),
  byCustomer: index("service_requests_customer_idx").on(t.customerId),
}));
