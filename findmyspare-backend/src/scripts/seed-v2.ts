// Prototype seed (v2): vehicle catalog, richer catalog with brands/fitment,
// a demo garage, a demo vehicle owner, and some delivered+reviewed history so
// ratings and "confirmed fit" badges have data. Idempotent; run after seed.ts.
//   bun --env-file=.env run src/scripts/seed-v2.ts
import { and, eq, inArray } from "drizzle-orm";
import { db, closeConnection } from "../db";
import {
  users,
  products,
  vehicles,
  garages,
  orders,
  orderItems,
  reviews,
  fitments,
  escrowTransactions,
  addresses,
} from "../db/schema";
import { CATALOG, seedVehicleCatalog } from "./catalog-data";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

async function upsertUser(u: { email: string; name: string; role: "buyer" | "supplier"; businessName?: string; city: string; pincode: string; phone: string; verificationStatus?: "approved" }) {
  const [ex] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
  // Sellers/garages read better with some tenure on the demo.
  const since = new Date(Date.now() - (u.role === "supplier" ? 2 * 365 : 200) * 864e5);
  const values = {
    createdAt: since,
    name: u.name, role: u.role, businessName: u.businessName ?? null, city: u.city, pincode: u.pincode,
    profileCompleted: true, emailVerified: true, isActive: true,
    verificationStatus: u.verificationStatus ?? ("not_submitted" as const),
  };
  if (ex) {
    // Phone is unique: only set it if nobody else holds it.
    await db.update(users).set(values).where(eq(users.id, ex.id));
    return ex.id;
  }
  const [c] = await db.insert(users).values({ email: u.email, phone: u.phone, ...values }).returning({ id: users.id });
  return c.id;
}

async function main() {
  console.log("🌱 seed-v2: catalog");
  await seedVehicleCatalog();

  console.log("🌱 seed-v2: people");
  const raza = await upsertUser({ email: "raza@findmyspare.test", name: "Raza", role: "supplier", businessName: "Raza Auto Parts", city: "Delhi", pincode: "110006", phone: "9876543210", verificationStatus: "approved" });
  const ayman = await upsertUser({ email: "ayman@findmyspare.test", name: "Ayman", role: "supplier", businessName: "Ayman Motors", city: "Mumbai", pincode: "400008", phone: "9876543211", verificationStatus: "approved" });
  const pudupet = await upsertUser({ email: "selvam@findmyspare.test", name: "Selvam", role: "supplier", businessName: "Pudupet Spares Co.", city: "Chennai", pincode: "600002", phone: "9876543212", verificationStatus: "approved" });
  const arjun = await upsertUser({ email: "buyer1@findmyspare.test", name: "Arjun Kumar", role: "buyer", city: "Pune", pincode: "411001", phone: "9123456789" });
  const priya = await upsertUser({ email: "buyer2@findmyspare.test", name: "Priya Sharma", role: "buyer", city: "Pune", pincode: "411004", phone: "9123456790" });
  const garageOwner = await upsertUser({ email: "garage@findmyspare.test", name: "Vikram Sharma", role: "buyer", city: "Pune", pincode: "411014", phone: "9123456791" });

  const [g] = await db.select().from(garages).where(eq(garages.ownerId, garageOwner)).limit(1);
  if (!g) {
    await db.insert(garages).values({
      ownerId: garageOwner, name: "Sharma Auto Works", gstin: "27ABCDE1234F1Z5", phone: "+91 91234 56791",
      addressLine: "Shop 4, Nagar Road, Viman Nagar", city: "Pune", state: "Maharashtra", pincode: "411014",
      upiId: "sharmaauto@okicici", invoicePrefix: "SAW", verified: true, specialisations: ["Maruti", "Hyundai", "AC repair"],
    });
  }

  for (const [uid, line1] of [[arjun, "Flat 302, Kalyani Nagar"], [garageOwner, "Shop 4, Nagar Road, Viman Nagar"]] as const) {
    const [a] = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, uid)).limit(1);
    if (!a) await db.insert(addresses).values({ userId: uid, label: uid === arjun ? "Home" : "Garage", line1, city: "Pune", state: "Maharashtra", postalCode: "411014", phone: "+919123456789", isDefault: true });
  }

  // Arjun's car (passport demo). A second car is left unowned for the "claim" flow.
  const [own] = await db.select().from(vehicles).where(eq(vehicles.regNo, "MH12AB3456")).limit(1);
  if (!own) {
    await db.insert(vehicles).values({ regNo: "MH12AB3456", ownerId: arjun, nickname: "Daily Swift", makeName: "Maruti Suzuki", modelName: "Swift", variantName: "VXi", fuel: "petrol", year: 2019, segment: "car", color: "Pearl White", odometerKm: 48210 });
  }
  const [bike] = await db.select().from(vehicles).where(eq(vehicles.regNo, "MH12QX7788")).limit(1);
  if (!bike) {
    await db.insert(vehicles).values({ regNo: "MH12QX7788", ownerId: arjun, nickname: "Activa", makeName: "Honda", modelName: "Activa 6G", variantName: "DLX", fuel: "petrol", year: 2021, segment: "scooter", odometerKm: 18400 });
  }

  console.log("🌱 seed-v2: catalog products");
  type P = { s: string; name: string; brand: string; type: "genuine" | "oes" | "aftermarket" | "used" | "refurbished"; cat: string; pn: string; price: number; mrp: number; stock: number; fits: [string, string, string?][]; warranty: string; desc: string; specs?: Record<string, string> };
  const S = { raza, ayman, pudupet };
  const SW: [string, string, string][] = [["Maruti Suzuki", "Swift", "2018-2023"], ["Maruti Suzuki", "Dzire", "2017-2024"]];
  const CATALOG_PRODUCTS: P[] = [
    { s: "raza", name: "Front Brake Pad Set", brand: "Bosch", type: "oes", cat: "Brakes", pn: "0986AB1234", price: 1180, mrp: 1650, stock: 40, fits: SW, warranty: "6 months", desc: "Low-dust ceramic pads, quiet braking. Bosch OES quality for Swift and Dzire.", specs: { Position: "Front", Material: "Ceramic", "Pieces": "4" } },
    { s: "ayman", name: "Front Brake Pad Set", brand: "Maruti Genuine", type: "genuine", cat: "Brakes", pn: "55810M68K00", price: 1490, mrp: 1590, stock: 18, fits: SW, warranty: "6 months", desc: "Maruti Suzuki Genuine Parts (MGP). Box with hologram and MRP sticker.", specs: { Position: "Front", "Pieces": "4" } },
    { s: "pudupet", name: "Front Brake Pad Set", brand: "Rane", type: "aftermarket", cat: "Brakes", pn: "RBP-SW18", price: 890, mrp: 1250, stock: 60, fits: SW, warranty: "3 months", desc: "Rane semi-metallic pads. Value pick for city driving.", specs: { Position: "Front", Material: "Semi-metallic" } },
    { s: "raza", name: "Engine Oil Filter", brand: "Bosch", type: "oes", cat: "Filters", pn: "F002H23415", price: 245, mrp: 320, stock: 120, fits: [...SW, ["Maruti Suzuki", "Baleno", "2019-2024"], ["Maruti Suzuki", "WagonR", "2019-2024"]], warranty: "—", desc: "Spin-on oil filter for K-series engines.", specs: { Thread: "M20x1.5" } },
    { s: "raza", name: "Air Filter", brand: "Purolator", type: "aftermarket", cat: "Filters", pn: "PU-AF-SW18", price: 420, mrp: 560, stock: 70, fits: SW, warranty: "—", desc: "Panel air filter, high dust-holding capacity." },
    { s: "ayman", name: "Cabin AC Filter (Activated Carbon)", brand: "Mann-Filter", type: "aftermarket", cat: "Filters", pn: "CUK1919", price: 610, mrp: 799, stock: 45, fits: [...SW, ["Hyundai", "i20", "2020-2024"]], warranty: "—", desc: "Blocks dust, pollen and odours. Carbon layer for city smog." },
    { s: "raza", name: "Clutch Plate Kit (3-piece)", brand: "Valeo", type: "oes", cat: "Transmission", pn: "VAL-826845", price: 5450, mrp: 6900, stock: 12, fits: SW, warranty: "12 months / 20,000 km", desc: "Clutch plate, pressure plate and release bearing.", specs: { Diameter: "190 mm", Pieces: "3" } },
    { s: "pudupet", name: "Clutch Plate Kit", brand: "LuK", type: "oes", cat: "Transmission", pn: "LUK-621-3061", price: 6200, mrp: 7400, stock: 8, fits: [["Hyundai", "Creta", "2020-2024"], ["Hyundai", "Venue", "2019-2024"]], warranty: "12 months", desc: "Schaeffler LuK OE-supplier clutch kit." },
    { s: "ayman", name: "Front Shock Absorber (pair)", brand: "Gabriel", type: "oes", cat: "Suspension", pn: "GAB-SW-F", price: 3980, mrp: 4600, stock: 14, fits: SW, warranty: "12 months", desc: "Gas-charged struts; restores ride height and comfort." },
    { s: "ayman", name: "Headlight Assembly (Right)", brand: "Lumax", type: "oes", cat: "Lighting", pn: "LMX-HL-SW-R", price: 3250, mrp: 3900, stock: 6, fits: [["Maruti Suzuki", "Swift", "2018-2023"]], warranty: "6 months", desc: "Halogen projector-style assembly with bulb holder." },
    { s: "ayman", name: "Side Mirror (Left, Power Fold)", brand: "Minda", type: "oes", cat: "Body", pn: "MND-SM-NX-L", price: 2650, mrp: 3100, stock: 9, fits: [["Tata", "Nexon", "2020-2023"]], warranty: "6 months", desc: "Electrically adjustable with indicator." },
    { s: "raza", name: "Wiper Blade Set (22\" + 16\")", brand: "Bosch", type: "aftermarket", cat: "Wipers", pn: "3397006420", price: 690, mrp: 950, stock: 80, fits: [...SW, ["Hyundai", "i20", "2020-2024"], ["Honda", "City", "2020-2024"]], warranty: "—", desc: "Frameless aerotwin blades, streak-free." },
    { s: "pudupet", name: "Car Battery 35Ah", brand: "Amaron", type: "aftermarket", cat: "Electrical", pn: "AAM-PR-0035", price: 4150, mrp: 5299, stock: 20, fits: [...SW, ["Maruti Suzuki", "WagonR", "2019-2024"], ["Tata", "Tiago", "2020-2024"]], warranty: "55 months (pro-rata)", desc: "Maintenance-free. Old battery exchange discount at delivery.", specs: { Capacity: "35Ah", Warranty: "55 months" } },
    { s: "pudupet", name: "Car Battery 45Ah", brand: "Exide", type: "aftermarket", cat: "Electrical", pn: "EX-MLDIN45", price: 5390, mrp: 6800, stock: 15, fits: [["Hyundai", "Creta", "2020-2024"], ["Honda", "City", "2020-2024"], ["Hyundai", "Venue", "2019-2024"]], warranty: "48 months", desc: "Exide Mileage DIN45. Higher cranking for diesel and AC load." },
    { s: "raza", name: "Spark Plug (set of 4)", brand: "NGK", type: "oes", cat: "Engine", pn: "NGK-LKR7E", price: 760, mrp: 980, stock: 50, fits: [...SW, ["Maruti Suzuki", "Baleno", "2019-2024"]], warranty: "—", desc: "Nickel spark plugs, OE-spec for K12 engines." },
    { s: "raza", name: "Timing Belt Kit", brand: "Gates", type: "oes", cat: "Engine", pn: "GTS-K015603", price: 3350, mrp: 4100, stock: 7, fits: [["Mahindra", "XUV500", "2015-2021"]], warranty: "12 months", desc: "Belt + tensioner + idler for mHawk engines." },
    { s: "ayman", name: "Radiator Coolant 1L (Pink)", brand: "Maruti Genuine", type: "genuine", cat: "Engine", pn: "99000M24120", price: 360, mrp: 380, stock: 100, fits: SW, warranty: "—", desc: "Long-life coolant, pre-mixed." },
    { s: "pudupet", name: "AC Compressor", brand: "Denso", type: "oes", cat: "AC", pn: "DNS-447190", price: 14800, mrp: 18500, stock: 3, fits: [["Toyota", "Innova Crysta", "2016-2024"]], warranty: "12 months", desc: "Denso OE compressor with clutch." },
    { s: "pudupet", name: "AC Condenser", brand: "Subros", type: "oes", cat: "AC", pn: "SUB-CND-CR", price: 5600, mrp: 6900, stock: 5, fits: [["Hyundai", "Creta", "2020-2024"]], warranty: "12 months", desc: "Parallel-flow condenser." },
    { s: "ayman", name: "Tail Lamp (Left)", brand: "Hyundai Mobis", type: "genuine", cat: "Lighting", pn: "92401C9000", price: 4200, mrp: 4450, stock: 4, fits: [["Hyundai", "Creta", "2020-2024"]], warranty: "6 months", desc: "Hyundai Mobis genuine LED tail lamp." },
    { s: "raza", name: "Alloy Wheel 15\" (used, grade A)", brand: "Maruti Genuine", type: "used", cat: "Tyres", pn: "USED-AW15-SW", price: 2900, mrp: 7800, stock: 4, fits: [["Maruti Suzuki", "Swift", "2018-2023"]], warranty: "7-day check", desc: "Grade A used alloy from a certified dismantler. No cracks, minor kerb marks.", specs: { Grade: "A", Size: "15 inch" } },
    { s: "pudupet", name: "Alternator (remanufactured)", brand: "Lucas TVS", type: "refurbished", cat: "Electrical", pn: "RMF-ALT-INN", price: 6900, mrp: 13800, stock: 3, fits: [["Toyota", "Innova Crysta", "2016-2024"]], warranty: "6 months", desc: "Factory remanufactured; old core return earns ₹1,000 back." },
    { s: "raza", name: "Tyre 185/65 R15", brand: "MRF ZVTV", type: "aftermarket", cat: "Tyres", pn: "MRF-1856515-ZV", price: 4850, mrp: 5600, stock: 24, fits: [["Maruti Suzuki", "Dzire", "2017-2024"], ["Honda", "City", "2020-2024"]], warranty: "Manufacturer", desc: "Tubeless radial; good wet grip." },
    // Two-wheelers
    { s: "pudupet", name: "Brake Shoe Set (rear)", brand: "Honda Genuine", type: "genuine", cat: "Brakes", pn: "06430-K0N-D00", price: 295, mrp: 320, stock: 90, fits: [["Honda", "Activa 6G", "2020-2024"]], warranty: "—", desc: "HMSI genuine rear brake shoes." },
    { s: "pudupet", name: "Air Filter Element", brand: "Honda Genuine", type: "genuine", cat: "Filters", pn: "17210-K0N-D00", price: 260, mrp: 280, stock: 70, fits: [["Honda", "Activa 6G", "2020-2024"]], warranty: "—", desc: "Viscous-type element; change every 16,000 km." },
    { s: "raza", name: "Chain Sprocket Kit", brand: "Rolon", type: "aftermarket", cat: "Transmission", pn: "RLN-CSK-SPL", price: 1150, mrp: 1480, stock: 35, fits: [["Hero", "Splendor Plus", "2018-2024"], ["Hero", "HF Deluxe", "2018-2024"]], warranty: "3 months", desc: "O-ring chain with front and rear sprocket." },
    { s: "raza", name: "Clutch Plate Set", brand: "Bajaj Genuine", type: "genuine", cat: "Transmission", pn: "JF581007", price: 980, mrp: 1040, stock: 22, fits: [["Bajaj", "Pulsar 150", "2019-2024"]], warranty: "—", desc: "Friction plate set, 5 pcs." },
    { s: "ayman", name: "Headlight LED Bulb (H4)", brand: "Philips", type: "aftermarket", cat: "Lighting", pn: "PH-H4-LED", price: 1290, mrp: 1690, stock: 50, fits: [["Royal Enfield", "Classic 350", "2021-2024"], ["Bajaj", "Pulsar 150", "2019-2024"]], warranty: "12 months", desc: "Ultinon LED, plug and play." },
    { s: "ayman", name: "Battery 12V 5Ah", brand: "Exide", type: "aftermarket", cat: "Electrical", pn: "EX-12XL5LB", price: 1350, mrp: 1650, stock: 40, fits: [["Honda", "Activa 6G", "2020-2024"], ["TVS", "Jupiter", "2019-2024"], ["Hero", "Splendor Plus", "2018-2024"]], warranty: "24 months", desc: "Exide Xplore, factory charged." },
    { s: "pudupet", name: "Front Disc Pad", brand: "TVS Genuine", type: "genuine", cat: "Brakes", pn: "N9200080", price: 340, mrp: 360, stock: 55, fits: [["TVS", "Apache RTR 160", "2019-2024"]], warranty: "—", desc: "TVS genuine disc pads." },
  ];

  // Retire the v1 demo listings' stock car photos (they don't show the part).
  await db.update(products).set({ images: [] }).where(inArray(products.supplierId, [raza, ayman]));

  const pidByKey = new Map<string, { id: string; supplierId: string; price: string }>();
  for (const p of CATALOG_PRODUCTS) {
    const supplierId = S[p.s as keyof typeof S];
    const [ex] = await db.select().from(products).where(and(eq(products.supplierId, supplierId), eq(products.partNumber, p.pn))).limit(1);
    const values = {
      supplierId, name: p.name, brand: p.brand, partType: p.type, category: p.cat, partNumber: p.pn,
      price: p.price.toFixed(2), mrp: p.mrp.toFixed(2), stockQuantity: p.stock, description: p.desc,
      specifications: p.specs ?? {}, compatibleVehicles: p.fits.map(([make, model, year]) => ({ make, model, year })),
      warrantyInfo: p.warranty, images: [] as string[], status: "active" as const,
    };
    const [row] = ex
      ? await db.update(products).set(values).where(eq(products.id, ex.id)).returning()
      : await db.insert(products).values(values).returning();
    pidByKey.set(`${p.s}:${p.pn}`, { id: row.id, supplierId, price: row.price });
  }

  console.log("🌱 seed-v2: delivered history + reviews");
  const history: [string, string, number, boolean, string, string][] = [
    ["raza:0986AB1234", "buyer2@findmyspare.test", 5, true, "Swift", "Fitted in 20 min. Exactly as shown, Bosch box sealed."],
    ["raza:0986AB1234", "buyer1@findmyspare.test", 4, true, "Dzire", "Good pads, a little noise first day then fine."],
    ["ayman:55810M68K00", "buyer2@findmyspare.test", 5, true, "Swift", "Genuine MGP with hologram. Pricier but worth it."],
    ["pudupet:AAM-PR-0035", "buyer1@findmyspare.test", 5, true, "WagonR", "Delivered next day, old battery taken back."],
    ["raza:F002H23415", "buyer2@findmyspare.test", 5, true, "Baleno", "Perfect fit."],
    ["ayman:CUK1919", "buyer1@findmyspare.test", 4, true, "i20", "Cabin smell gone."],
    ["pudupet:17210-K0N-D00", "buyer2@findmyspare.test", 5, true, "Activa 6G", "Genuine Honda, cheaper than service centre."],
  ];
  for (const [key, email, rating, fit, model, comment] of history) {
    const p = pidByKey.get(key)!;
    const [buyer] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    const [dup] = await db.select({ id: reviews.id }).from(reviews).where(and(eq(reviews.productId, p.id), eq(reviews.buyerId, buyer!.id))).limit(1);
    if (dup) continue;
    const delivered = new Date(Date.now() - (5 + Math.floor(Math.random() * 40)) * 864e5);
    const [o] = await db.insert(orders).values({
      buyerId: buyer!.id, supplierId: p.supplierId, status: "completed", paymentStatus: "paid", source: "cart",
      totalAmount: p.price, deliveredAt: delivered, closedAt: delivered, createdAt: new Date(delivered.getTime() - 2 * 864e5),
    }).returning();
    await db.insert(orderItems).values({ orderId: o.id, productId: p.id, quantity: 1, unitPrice: p.price, subtotal: p.price });
    await db.insert(escrowTransactions).values({ orderId: o.id, amount: p.price, status: "released", releasedAt: delivered });
    const make = CATALOG.find((m) => m.models.some((x) => x.name === model))!.make;
    await db.insert(reviews).values({ orderId: o.id, productId: p.id, supplierId: p.supplierId, buyerId: buyer!.id, rating, comment, fitConfirmed: fit, vehicle: { make, model }, createdAt: delivered });
    if (fit) await db.insert(fitments).values({ productId: p.id, makeName: make, modelName: model, source: "order_confirmed", confirmedBy: buyer!.id, createdAt: delivered });
  }

  console.log("✅ seed-v2 done");
  console.log("   Demo logins (DEMO_LOGIN=1, OTP 123456): buyer1@ (owner), garage@ (Sharma Auto Works), raza@ / ayman@ / selvam@ (sellers), admin@");
}

main().then(closeConnection).catch(async (e) => { console.error(e); await closeConnection(); process.exit(1); });
