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
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { orders } from "./orders";
import { products } from "./products";
import { addresses } from "./addresses";

// ─── Checkouts: one payment can cover orders from several sellers ───
export const checkouts = pgTable("checkouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shippingAddressId: uuid("shipping_address_id").references(() => addresses.id),
  itemsTotal: numeric("items_total", { precision: 12, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  platformFee: numeric("platform_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ byBuyer: index("checkouts_buyer_idx").on(t.buyerId) }));

// ─── Payments (provider-agnostic; "mock" in the prototype) ───
export const paymentPurposeEnum = pgEnum("payment_purpose", ["checkout", "invoice"]);
export const paymentStatusEnum = pgEnum("payment_status", ["created", "succeeded", "failed"]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  purpose: paymentPurposeEnum("purpose").notNull(),
  // checkouts.id or invoices.id depending on purpose
  refId: uuid("ref_id").notNull(),
  payerId: uuid("payer_id").references(() => users.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  provider: varchar("provider", { length: 20 }).notNull().default("mock"),
  method: varchar("method", { length: 20 }), // upi | card | netbanking | cod | cash
  status: paymentStatusEnum("status").notNull().default("created"),
  providerRef: varchar("provider_ref", { length: 60 }),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => ({ byRef: index("payments_ref_idx").on(t.refId) }));

// ─── Reviews (only for delivered orders) ─────────────
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  supplierId: uuid("supplier_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  fitConfirmed: boolean("fit_confirmed"),
  vehicle: jsonb("vehicle").$type<{ make: string; model: string; variant?: string; year?: number } | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byOrder: uniqueIndex("reviews_order_product_uq").on(t.orderId, t.productId),
  byProduct: index("reviews_product_idx").on(t.productId),
  bySupplier: index("reviews_supplier_idx").on(t.supplierId),
}));
