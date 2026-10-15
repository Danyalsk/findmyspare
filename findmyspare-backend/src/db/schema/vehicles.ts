import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── Vehicle catalog (normalised fitment backbone) ───
export const vehicleSegmentEnum = pgEnum("vehicle_segment", ["car", "bike", "scooter", "commercial"]);

export const vehicleMakes = pgTable("vehicle_makes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
});

export const vehicleModels = pgTable("vehicle_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  makeId: uuid("make_id").notNull().references(() => vehicleMakes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  segment: vehicleSegmentEnum("segment").notNull().default("car"),
}, (t) => ({ byMake: index("vehicle_models_make_idx").on(t.makeId) }));

export const vehicleVariants = pgTable("vehicle_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  modelId: uuid("model_id").notNull().references(() => vehicleModels.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  fuel: varchar("fuel", { length: 20 }).notNull(), // petrol | diesel | cng | electric
  yearFrom: integer("year_from").notNull(),
  yearTo: integer("year_to"), // null = current
}, (t) => ({ byModel: index("vehicle_variants_model_idx").on(t.modelId) }));

// ─── Vehicles (one row per registration number = the Vehicle Passport) ───
export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Normalised: uppercase, no spaces (e.g. MH12AB3456).
  regNo: varchar("reg_no", { length: 15 }).notNull(),
  vin: varchar("vin", { length: 20 }),
  variantId: uuid("variant_id").references(() => vehicleVariants.id),
  // Denormalised labels so passports read without joins and survive catalog edits.
  makeName: varchar("make_name", { length: 80 }).notNull(),
  modelName: varchar("model_name", { length: 80 }).notNull(),
  variantName: varchar("variant_name", { length: 80 }),
  fuel: varchar("fuel", { length: 20 }),
  year: integer("year"),
  segment: vehicleSegmentEnum("segment").notNull().default("car"),
  color: varchar("color", { length: 40 }),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  nickname: varchar("nickname", { length: 60 }),
  odometerKm: integer("odometer_km"),
  // Read-only public history link (owner-controlled).
  shareToken: varchar("share_token", { length: 40 }),
  shareSections: jsonb("share_sections").$type<{ services: boolean; parts: boolean; odometer: boolean; invoices: boolean }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byReg: uniqueIndex("vehicles_reg_no_uq").on(t.regNo),
  byOwner: index("vehicles_owner_idx").on(t.ownerId),
  byShare: uniqueIndex("vehicles_share_token_uq").on(t.shareToken),
}));

// ─── Garages ─────────────────────────────────────────
export const garages = pgTable("garages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  gstin: varchar("gstin", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  addressLine: varchar("address_line", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  upiId: varchar("upi_id", { length: 100 }),
  invoicePrefix: varchar("invoice_prefix", { length: 10 }).notNull().default("INV"),
  nextInvoiceNo: integer("next_invoice_no").notNull().default(1),
  specialisations: jsonb("specialisations").$type<string[]>().default([]),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ byOwner: uniqueIndex("garages_owner_uq").on(t.ownerId) }));

// Owner consent for a garage to write to a vehicle's passport (DPDP-style).
export const vehicleAccessStatusEnum = pgEnum("vehicle_access_status", ["pending", "granted", "revoked"]);
export const vehicleAccess = pgTable("vehicle_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  garageId: uuid("garage_id").notNull().references(() => garages.id, { onDelete: "cascade" }),
  status: vehicleAccessStatusEnum("status").notNull().default("pending"),
  // Token for one-tap approval from a WhatsApp link without logging in.
  token: varchar("token", { length: 40 }).notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
}, (t) => ({
  byPair: uniqueIndex("vehicle_access_pair_uq").on(t.vehicleId, t.garageId),
  byToken: uniqueIndex("vehicle_access_token_uq").on(t.token),
}));
