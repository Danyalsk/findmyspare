// Vehicle catalog (makes → models → variants). Production-safe: idempotent,
// inserts only missing rows, never touches users or products.
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { vehicleMakes, vehicleModels, vehicleVariants } from "../db/schema";

export type Seg = "car" | "bike" | "scooter" | "commercial";
export const CATALOG: { make: string; models: { name: string; segment: Seg; variants: [string, string, number, number | null][] }[] }[] = [
  { make: "Maruti Suzuki", models: [
    { name: "Swift", segment: "car", variants: [["LXi", "petrol", 2018, 2023], ["VXi", "petrol", 2018, 2023], ["ZXi", "petrol", 2018, 2023], ["VXi", "petrol", 2024, null]] },
    { name: "Baleno", segment: "car", variants: [["Delta", "petrol", 2019, 2022], ["Zeta", "petrol", 2022, null], ["Alpha", "petrol", 2022, null]] },
    { name: "Dzire", segment: "car", variants: [["VXi", "petrol", 2017, 2024], ["ZXi CNG", "cng", 2020, null]] },
    { name: "Ertiga", segment: "car", variants: [["VXi", "petrol", 2018, null], ["ZXi CNG", "cng", 2019, null]] },
    { name: "WagonR", segment: "car", variants: [["LXi", "petrol", 2019, null], ["VXi CNG", "cng", 2019, null]] },
  ] },
  { make: "Hyundai", models: [
    { name: "i20", segment: "car", variants: [["Asta", "petrol", 2020, null], ["Sportz", "petrol", 2020, null], ["Magna", "petrol", 2015, 2020]] },
    { name: "Creta", segment: "car", variants: [["SX", "diesel", 2020, 2024], ["SX(O)", "petrol", 2024, null], ["E", "petrol", 2020, 2024]] },
    { name: "Venue", segment: "car", variants: [["S", "petrol", 2019, null], ["SX", "diesel", 2019, null]] },
  ] },
  { make: "Tata", models: [
    { name: "Nexon", segment: "car", variants: [["XZ+", "petrol", 2020, 2023], ["Creative", "petrol", 2023, null], ["EV Max", "electric", 2022, null]] },
    { name: "Punch", segment: "car", variants: [["Adventure", "petrol", 2021, null], ["Accomplished", "petrol", 2021, null]] },
    { name: "Tiago", segment: "car", variants: [["XZ", "petrol", 2020, null], ["iCNG", "cng", 2022, null]] },
  ] },
  { make: "Mahindra", models: [
    { name: "XUV500", segment: "car", variants: [["W8", "diesel", 2015, 2021], ["W10", "diesel", 2015, 2021]] },
    { name: "Scorpio-N", segment: "car", variants: [["Z8", "diesel", 2022, null]] },
    { name: "Bolero", segment: "car", variants: [["B6", "diesel", 2020, null]] },
  ] },
  { make: "Honda", models: [
    { name: "City", segment: "car", variants: [["V", "petrol", 2020, null], ["ZX", "petrol", 2020, null]] },
    { name: "Activa 6G", segment: "scooter", variants: [["STD", "petrol", 2020, null], ["DLX", "petrol", 2020, null]] },
    { name: "Shine 125", segment: "bike", variants: [["Drum", "petrol", 2019, null], ["Disc", "petrol", 2019, null]] },
  ] },
  { make: "Toyota", models: [
    { name: "Innova Crysta", segment: "car", variants: [["GX", "diesel", 2016, null], ["VX", "diesel", 2016, null]] },
  ] },
  { make: "Hero", models: [
    { name: "Splendor Plus", segment: "bike", variants: [["Self Alloy", "petrol", 2018, null], ["i3S", "petrol", 2018, null]] },
    { name: "HF Deluxe", segment: "bike", variants: [["Kick", "petrol", 2018, null]] },
  ] },
  { make: "Bajaj", models: [
    { name: "Pulsar 150", segment: "bike", variants: [["Single Disc", "petrol", 2019, null], ["Twin Disc", "petrol", 2019, null]] },
  ] },
  { make: "TVS", models: [
    { name: "Jupiter", segment: "scooter", variants: [["ZX", "petrol", 2019, null]] },
    { name: "Apache RTR 160", segment: "bike", variants: [["4V", "petrol", 2019, null]] },
  ] },
  { make: "Royal Enfield", models: [
    { name: "Classic 350", segment: "bike", variants: [["Signals", "petrol", 2021, null], ["Chrome", "petrol", 2021, null]] },
  ] },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");


export async function seedVehicleCatalog() {
  for (const mk of CATALOG) {
    let [make] = await db.select().from(vehicleMakes).where(eq(vehicleMakes.name, mk.make)).limit(1);
    if (!make) [make] = await db.insert(vehicleMakes).values({ name: mk.make, slug: slug(mk.make) }).returning();
    for (const md of mk.models) {
      let [model] = await db.select().from(vehicleModels).where(and(eq(vehicleModels.makeId, make.id), eq(vehicleModels.name, md.name))).limit(1);
      if (!model) [model] = await db.insert(vehicleModels).values({ makeId: make.id, name: md.name, segment: md.segment }).returning();
      for (const [name, fuel, yearFrom, yearTo] of md.variants) {
        const [ex] = await db.select({ id: vehicleVariants.id }).from(vehicleVariants)
          .where(and(eq(vehicleVariants.modelId, model.id), eq(vehicleVariants.name, name), eq(vehicleVariants.yearFrom, yearFrom))).limit(1);
        if (!ex) await db.insert(vehicleVariants).values({ modelId: model.id, name, fuel, yearFrom, yearTo });
      }
    }
  }

}
