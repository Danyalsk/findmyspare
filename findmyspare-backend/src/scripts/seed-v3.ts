// Prototype seed (v3): a working supply chain across all 10 industries.
// Raw material → manufacturer → super stockist → distributor → retailer →
// technician → customer, with trade links, price lists, purchase orders in
// every state, a khata, counter bills, demand signals and open Fix requests.
// Idempotent; run after seed.ts, seed-catalog.ts and seed-v2.ts.
//   bun --env-file=.env run src/scripts/seed-v3.ts
import { and, eq, sql } from "drizzle-orm";
import { db, closeConnection } from "../db";
import {
  users,
  products,
  garages,
  vehicles,
  tradeLinks,
  priceLists,
  priceListItems,
  purchaseOrders,
  ledgerEntries,
  salesBills,
  searchEvents,
  serviceRequests,
  type PoLine,
  type BillLine,
} from "../db/schema";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

type Biz = {
  key: string; email: string; name: string; businessName: string; city: string; pincode: string; phone: string;
  roles: string[]; industries: string[]; years: number;
};

const BIZ: Biz[] = [
  { key: "castings", email: "castings@findmyspare.test", name: "Gurpreet Singh", businessName: "Ludhiana Castings & Forgings", city: "Ludhiana", pincode: "141003", phone: "9810000001", roles: ["raw_material_supplier", "manufacturer"], industries: ["industrial", "pumps", "agriculture"], years: 14 },
  { key: "sahyadri", email: "sahyadri@findmyspare.test", name: "Anil Kulkarni", businessName: "Sahyadri Pumps Manufacturing", city: "Kolhapur", pincode: "416003", phone: "9810000002", roles: ["manufacturer"], industries: ["pumps", "agriculture"], years: 11 },
  { key: "deccan", email: "deccan@findmyspare.test", name: "Meera Joshi", businessName: "Deccan Industrial Stockists", city: "Pune", pincode: "411018", phone: "9810000003", roles: ["super_stockist", "distributor"], industries: ["pumps", "electrical", "power"], years: 9 },
  { key: "ganesh", email: "ganesh@findmyspare.test", name: "Sachin Pawar", businessName: "Shree Ganesh Distributors", city: "Pune", pincode: "411002", phone: "9810000004", roles: ["distributor", "wholesaler"], industries: ["pumps", "electrical", "appliances"], years: 7 },
  { key: "patil", email: "patil@findmyspare.test", name: "Rahul Patil", businessName: "Patil Electricals & Pumps", city: "Pune", pincode: "411028", phone: "9810000005", roles: ["retailer"], industries: ["pumps", "electrical", "appliances"], years: 5 },
  { key: "coolcare", email: "coolcare@findmyspare.test", name: "Farhan Shaikh", businessName: "CoolCare Appliance Spares", city: "Mumbai", pincode: "400003", phone: "9810000006", roles: ["wholesaler", "retailer"], industries: ["appliances"], years: 8 },
  { key: "powergen", email: "powergen@findmyspare.test", name: "Hetal Shah", businessName: "PowerGen Spares", city: "Ahmedabad", pincode: "380001", phone: "9810000007", roles: ["distributor"], industries: ["power", "electrical"], years: 6 },
  { key: "krishi", email: "krishi@findmyspare.test", name: "Dnyaneshwar More", businessName: "Krishi Seva Kendra", city: "Nashik", pincode: "422001", phone: "9810000008", roles: ["retailer", "service_center"], industries: ["agriculture", "pumps"], years: 12 },
  { key: "bearings", email: "bearings@findmyspare.test", name: "Harjit Kaur", businessName: "Bharat Bearings & Belts", city: "Ludhiana", pincode: "141008", phone: "9810000009", roles: ["manufacturer", "wholesaler"], industries: ["industrial", "electrical", "agriculture"], years: 16 },
  { key: "earthmover", email: "earthmover@findmyspare.test", name: "Rakesh Sahu", businessName: "Earthmover Spares Raipur", city: "Raipur", pincode: "492001", phone: "9810000010", roles: ["distributor", "refurbisher"], industries: ["construction"], years: 10 },
  { key: "mobilehub", email: "mobilehub@findmyspare.test", name: "Aman Gupta", businessName: "Mobile Parts Hub", city: "Delhi", pincode: "110006", phone: "9810000011", roles: ["wholesaler"], industries: ["electronics"], years: 4 },
  { key: "kochi", email: "kochi@findmyspare.test", name: "Thomas Varghese", businessName: "Kochi Marine Supplies", city: "Kochi", pincode: "682001", phone: "9810000012", roles: ["retailer", "service_center"], industries: ["marine"], years: 13 },
];

// [biz, industry, machineType, category, name, brand, partNumber, price, mrp, stock, moq, attributes]
type P = [string, string, string, string, string, string, string, number, number, number, number, Record<string, string>];
const PRODUCTS: P[] = [
  // Raw material / castings
  ["castings", "pumps", "submersible", "Impellers & diffusers", "Cast-iron impeller blank, 100 mm", "LCF", "LCF-IMP-100", 145, 190, 2400, 100, { material: "CI FG-200" }],
  ["castings", "industrial", "gearbox", "Couplings", "Forged steel coupling hub, 38 mm bore", "LCF", "LCF-CPL-38", 310, 420, 900, 50, { bore: "38 mm" }],
  ["castings", "agriculture", "tractor", "Gears & transmission", "EN-8 steel gear blank, 52 teeth", "LCF", "LCF-GB-52", 680, 900, 300, 20, { material: "EN-8" }],
  // Manufacturer: pumps
  ["sahyadri", "pumps", "submersible", "Impellers & diffusers", "Noryl impeller for 4\" V4 submersible (1 HP)", "Sahyadri", "SP-V4-IMP-1H", 85, 120, 5000, 50, { hp: "1", bore: "4 inch" }],
  ["sahyadri", "pumps", "submersible", "Windings & stators", "Stator winding kit, 1.5 HP single phase", "Sahyadri", "SP-STK-15", 2150, 2800, 320, 10, { hp: "1.5", phase: "single" }],
  ["sahyadri", "pumps", "monoblock", "Mechanical seals", "Mechanical seal 22 mm, carbon-ceramic", "Sahyadri", "SP-MS-22", 165, 240, 3000, 25, { shaft: "22 mm" }],
  ["sahyadri", "pumps", "openwell", "Shafts & sleeves", "SS-410 pump shaft, openwell 2 HP", "Sahyadri", "SP-SH-2H", 640, 850, 400, 10, { hp: "2" }],
  // Super stockist
  ["deccan", "pumps", "submersible", "Capacitors", "Running capacitor 36 µF 440 V", "Keltron", "KEL-36-440", 210, 320, 1800, 20, { uf: "36", volts: "440" }],
  ["deccan", "pumps", "submersible", "Starters & panels", "Single-phase submersible control panel 1–2 HP", "Deccan", "DIS-CP-12", 1890, 2600, 240, 5, { hp: "1-2", phase: "single" }],
  ["deccan", "electrical", "induction-motor", "Bearings", "Deep-groove ball bearing 6205 ZZ", "SKF", "6205-2Z", 168, 245, 4000, 20, { bore: "25 mm" }],
  ["deccan", "power", "inverter", "Inverter PCBs", "Sine-wave inverter main PCB, 900 VA", "Deccan", "DIS-PCB-900", 1450, 2100, 160, 5, { va: "900" }],
  // Distributor
  ["ganesh", "pumps", "submersible", "Capacitors", "Running capacitor 36 µF 440 V", "Keltron", "KEL-36-440", 245, 320, 600, 10, { uf: "36", volts: "440" }],
  ["ganesh", "pumps", "monoblock", "Mechanical seals", "Mechanical seal 22 mm, carbon-ceramic", "Sahyadri", "SP-MS-22", 190, 240, 900, 10, { shaft: "22 mm" }],
  ["ganesh", "electrical", "induction-motor", "Winding wire", "Super-enamelled copper winding wire 22 SWG (1 kg)", "Ram Ratna", "SEC-22SWG", 1020, 1180, 400, 5, { gauge: "22 SWG" }],
  ["ganesh", "appliances", "ac", "Capacitors", "AC dual capacitor 45+5 µF", "EPCOS", "AC-DC-45-5", 340, 480, 700, 10, { uf: "45+5" }],
  // Retailer
  ["patil", "pumps", "submersible", "Capacitors", "Running capacitor 36 µF 440 V", "Keltron", "KEL-36-440", 290, 320, 40, 1, { uf: "36", volts: "440" }],
  ["patil", "pumps", "monoblock", "Mechanical seals", "Mechanical seal 22 mm, carbon-ceramic", "Sahyadri", "SP-MS-22", 225, 240, 3, 1, { shaft: "22 mm" }],
  ["patil", "pumps", "pressure-booster", "Pressure switches", "Automatic pressure switch 1.4–2.8 bar", "Danfoss", "PS-1428", 780, 950, 12, 1, { range: "1.4-2.8 bar" }],
  ["patil", "pumps", "openwell", "Foot & check valves", "Foot valve 1.5\" with strainer", "Leader", "FV-15", 260, 340, 25, 1, { size: "1.5 inch" }],
  ["patil", "appliances", "fan", "Capacitors", "Ceiling fan capacitor 2.5 µF", "Havells", "FC-25", 45, 65, 150, 1, { uf: "2.5" }],
  // Appliances wholesaler
  ["coolcare", "appliances", "ac", "Compressors", "Rotary compressor 1.5 ton R32", "GMCC", "GMCC-15-R32", 9800, 12500, 35, 1, { tonnage: "1.5", gas: "R32" }],
  ["coolcare", "appliances", "ac", "PCBs & controllers", "Split AC indoor PCB, universal", "CoolCare", "CC-UPCB-01", 1150, 1600, 90, 2, {}],
  ["coolcare", "appliances", "refrigerator", "Thermostats & sensors", "Refrigerator defrost sensor (NTC)", "CoolCare", "CC-DFS-10K", 140, 220, 400, 10, { ntc: "10k" }],
  ["coolcare", "appliances", "washing-machine", "Drain pumps & valves", "Front-load washing machine drain pump", "Askoll", "ASK-DP-30W", 980, 1350, 60, 2, { watts: "30" }],
  ["coolcare", "appliances", "water-purifier", "Filters & membranes", "RO membrane 80 GPD", "Vontron", "VON-80", 690, 950, 220, 5, { gpd: "80" }],
  ["coolcare", "appliances", "geyser", "Heating elements", "Geyser heating element 2 kW", "Racold", "RC-HE-2K", 420, 580, 140, 5, { kw: "2" }],
  // Power
  ["powergen", "power", "genset", "Genset filters", "Genset fuel filter for 15–62.5 kVA", "Fleetguard", "FF5052", 520, 740, 300, 6, { kva: "15-62.5" }],
  ["powergen", "power", "genset", "AVRs & controllers", "AVR SX460 for brushless alternator", "Stamford", "SX460", 2350, 3400, 45, 1, {}],
  ["powergen", "power", "battery", "Batteries", "Tubular inverter battery 150 Ah", "Exide", "IT500", 11800, 14500, 30, 1, { ah: "150" }],
  ["powergen", "power", "solar", "Charge controllers", "MPPT solar charge controller 40 A", "PowerGen", "PG-MPPT-40", 3900, 5200, 70, 2, { amps: "40" }],
  // Agriculture
  ["krishi", "agriculture", "tractor", "Clutch & PTO", "Tractor clutch plate 11\" (35–50 HP)", "Valeo", "VL-CP-11", 2450, 3100, 20, 1, { hp: "35-50" }],
  ["krishi", "agriculture", "tractor", "Filters", "Tractor engine oil filter", "Mahle", "MH-OF-TR1", 260, 340, 80, 1, {}],
  ["krishi", "agriculture", "power-tiller", "Rotavator blades", "Rotavator L-blade set (36 pcs)", "Krishi", "KSK-RB-36", 3600, 4500, 15, 1, { pieces: "36" }],
  ["krishi", "agriculture", "sprayer", "Sprayer nozzles & pumps", "Battery sprayer pump 12 V", "Neptune", "NP-SP-12", 640, 850, 40, 1, { volts: "12" }],
  ["krishi", "agriculture", "irrigation", "Drip fittings", "Drip lateral 16 mm (100 m roll)", "Jain", "JN-DL-16", 1350, 1700, 60, 1, { size: "16 mm" }],
  // Industrial
  ["bearings", "industrial", "conveyor", "Belts & chains", "V-belt B-52 classical", "Fenner", "B52", 230, 320, 1200, 10, { section: "B" }],
  ["bearings", "industrial", "air-compressor", "Filters & separators", "Screw compressor air-oil separator", "Mann", "MN-AOS-15", 4200, 5600, 40, 1, {}],
  ["bearings", "industrial", "hydraulic-press", "Seals & O-rings", "Hydraulic cylinder seal kit 63 mm", "Hallite", "HL-SK-63", 880, 1200, 150, 5, { bore: "63 mm" }],
  ["bearings", "electrical", "induction-motor", "Bearings", "Ball bearing 6306 C3", "NBC", "6306-C3", 340, 460, 900, 10, { bore: "30 mm" }],
  ["bearings", "agriculture", "harvester", "Gears & transmission", "Harvester variator belt", "Fenner", "FN-HV-22", 2150, 2800, 60, 2, {}],
  // Construction
  ["earthmover", "construction", "backhoe", "Bucket teeth & GET", "Backhoe bucket tooth with pin", "Earthmover", "EM-BT-3DX", 820, 1150, 300, 5, {}],
  ["earthmover", "construction", "excavator", "Seal kits", "Excavator boom cylinder seal kit", "NOK", "NOK-BCK-20T", 3900, 5400, 40, 1, { class: "20 T" }],
  ["earthmover", "construction", "excavator", "Undercarriage", "Track roller, 20 T excavator (refurbished)", "Earthmover", "EM-TR-20R", 6200, 9800, 18, 1, { class: "20 T" }],
  ["earthmover", "construction", "mixer", "Hydraulic pumps & motors", "Transit-mixer hydraulic motor", "Earthmover", "EM-HM-TM6", 38500, 52000, 4, 1, {}],
  // Electronics
  ["mobilehub", "electronics", "smartphone", "Displays & touch", "AMOLED display with frame, Galaxy A-series", "OEM", "MPH-DSP-A54", 4900, 6800, 60, 2, {}],
  ["mobilehub", "electronics", "smartphone", "Charging ports & ICs", "USB-C charging port flex", "OEM", "MPH-CP-USBC", 180, 320, 900, 10, {}],
  ["mobilehub", "electronics", "smartphone", "Batteries", "Li-ion phone battery 5000 mAh", "OEM", "MPH-BAT-5K", 690, 1100, 300, 5, { mah: "5000" }],
  ["mobilehub", "electronics", "laptop", "Keyboards & trackpads", "Laptop keyboard, 14\" (backlit)", "OEM", "MPH-KB-14B", 1250, 1900, 80, 2, {}],
  ["mobilehub", "electronics", "cctv", "Chargers & adapters", "CCTV 12 V 2 A adapter", "OEM", "MPH-AD-122", 120, 200, 1500, 20, {}],
  // Marine & specialty
  ["kochi", "marine", "outboard", "Impellers & water pumps", "Outboard water-pump impeller, 9.9–15 HP", "Kochi Marine", "KM-IMP-15", 1450, 1900, 35, 1, { hp: "9.9-15" }],
  ["kochi", "marine", "outboard", "Propellers", "Aluminium propeller 9 1/4 x 10", "Solas", "SL-925-10", 5800, 7400, 8, 1, {}],
  ["kochi", "marine", "outboard", "Anodes", "Zinc anode kit, outboard", "Kochi Marine", "KM-ANO-K1", 950, 1300, 25, 1, {}],
  ["kochi", "marine", "fishing-boat", "Fuel systems", "Marine fuel water separator", "Racor", "RC-FWS-500", 3600, 4800, 12, 1, {}],
];

async function upsertBiz(b: Biz) {
  const since = new Date(Date.now() - b.years * 365 * 864e5);
  const values = {
    name: b.name, role: "supplier" as const, businessName: b.businessName, city: b.city, pincode: b.pincode,
    profileCompleted: true, emailVerified: true, isActive: true, verificationStatus: "approved" as const,
    businessRoles: b.roles, industries: b.industries, createdAt: since,
  };
  const [ex] = await db.select({ id: users.id }).from(users).where(eq(users.email, b.email)).limit(1);
  if (ex) { await db.update(users).set(values).where(eq(users.id, ex.id)); return ex.id; }
  const [c] = await db.insert(users).values({ email: b.email, phone: b.phone, ...values }).returning({ id: users.id });
  return c!.id;
}

const r2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

async function main() {
  console.log("🌱 seed-v3: businesses");
  const id: Record<string, string> = {};
  for (const b of BIZ) id[b.key] = await upsertBiz(b);

  // Give the v2 demo sellers their place in the chain.
  const tag = async (email: string, roles: string[], inds: string[]) =>
    db.update(users).set({ businessRoles: roles, industries: inds }).where(eq(users.email, email));
  await tag("raza@findmyspare.test", ["distributor", "wholesaler"], ["automotive"]);
  await tag("ayman@findmyspare.test", ["retailer"], ["automotive"]);
  await tag("selvam@findmyspare.test", ["wholesaler", "retailer"], ["automotive", "agriculture"]);
  await tag("garage@findmyspare.test", ["service_center"], ["automotive", "appliances"]);
  await db.update(garages).set({ industrySlugs: ["automotive", "appliances"] })
    .where(sql`${garages.ownerId} = (SELECT id FROM users WHERE email = 'garage@findmyspare.test')`);

  console.log("🌱 seed-v3: listings across 10 industries");
  const pid: Record<string, string> = {}; // `${biz}:${partNumber}` → product id
  for (const [biz, industry, machineType, category, name, brand, partNumber, price, mrp, stock, moq, attributes] of PRODUCTS) {
    const supplierId = id[biz]!;
    const [ex] = await db.select({ id: products.id }).from(products).where(and(eq(products.supplierId, supplierId), eq(products.partNumber, partNumber))).limit(1);
    const vals = {
      supplierId, name, brand, partNumber, category, industrySlug: industry, machineType, attributes, moq,
      price: price.toFixed(2), mrp: mrp.toFixed(2), stockQuantity: stock, lowStockThreshold: Math.max(5, Math.round(stock * 0.1)),
      partType: (name.includes("refurbished") ? "refurbished" : brand === "OEM" ? "oes" : "aftermarket") as "refurbished" | "oes" | "aftermarket",
      status: "active" as const, warrantyInfo: "6 months seller warranty",
    };
    if (ex) { await db.update(products).set({ ...vals, updatedAt: new Date() }).where(eq(products.id, ex.id)); pid[`${biz}:${partNumber}`] = ex.id; }
    else { const [p] = await db.insert(products).values(vals).returning({ id: products.id }); pid[`${biz}:${partNumber}`] = p!.id; }
  }

  console.log("🌱 seed-v3: trade links + price lists");
  const priceList = async (owner: string, name: string, discountPct: number) => {
    const [ex] = await db.select().from(priceLists).where(and(eq(priceLists.ownerId, owner), eq(priceLists.name, name))).limit(1);
    if (ex) return ex.id;
    const [p] = await db.insert(priceLists).values({ ownerId: owner, name, discountPct: discountPct.toFixed(2) }).returning();
    return p!.id;
  };
  const deccanDist = await priceList(id.deccan!, "Distributors", 8);
  const ganeshRetail = await priceList(id.ganesh!, "Retailers", 5);
  const sahyadriStockist = await priceList(id.sahyadri!, "Super stockists", 12);
  await db.insert(priceListItems).values({ priceListId: ganeshRetail, productId: pid["ganesh:KEL-36-440"]!, price: "225.00", minQty: 20 })
    .onConflictDoUpdate({ target: [priceListItems.priceListId, priceListItems.productId], set: { price: "225.00", minQty: 20 } });

  const link = async (supplier: string, buyer: string, opts: { status?: "active" | "pending"; creditLimit?: number; creditDays?: number; priceListId?: string }) => {
    await db.insert(tradeLinks).values({
      supplierId: id[supplier]!, buyerId: id[buyer]!, requestedBy: id[buyer]!, status: opts.status ?? "active",
      creditLimit: (opts.creditLimit ?? 0).toFixed(2), creditDays: opts.creditDays ?? 0, priceListId: opts.priceListId ?? null,
    }).onConflictDoNothing();
  };
  await link("castings", "sahyadri", { creditLimit: 500000, creditDays: 45 });
  await link("castings", "bearings", { creditLimit: 200000, creditDays: 30 });
  await link("sahyadri", "deccan", { creditLimit: 800000, creditDays: 30, priceListId: sahyadriStockist });
  await link("sahyadri", "krishi", { creditLimit: 100000, creditDays: 15 });
  await link("deccan", "ganesh", { creditLimit: 300000, creditDays: 21, priceListId: deccanDist });
  await link("deccan", "powergen", { creditLimit: 150000, creditDays: 15, priceListId: deccanDist });
  await link("ganesh", "patil", { creditLimit: 60000, creditDays: 15, priceListId: ganeshRetail });
  await link("bearings", "deccan", { creditLimit: 250000, creditDays: 30 });
  await link("coolcare", "patil", { creditLimit: 40000, creditDays: 7 });
  await link("ganesh", "krishi", { status: "pending" });

  console.log("🌱 seed-v3: purchase orders through the chain");
  const po = async (number: string, seller: string, buyer: string, status: "sent" | "accepted" | "shipped" | "received", items: [string, number, number][], daysAgo: number) => {
    const [ex] = await db.select({ id: purchaseOrders.id }).from(purchaseOrders).where(eq(purchaseOrders.number, number)).limit(1);
    if (ex) return;
    const lines: PoLine[] = [];
    for (const [pn, qty, unit] of items) {
      const spec = PRODUCTS.find((p) => p[0] === seller && p[6] === pn)!;
      lines.push({ productId: pid[`${seller}:${pn}`]!, name: spec[4], partNumber: pn, brand: spec[5], quantity: qty, unitPrice: unit.toFixed(2), gstRate: 18, total: r2(qty * unit * 1.18) });
    }
    const subtotal = items.reduce((s, [, q, u]) => s + q * u, 0);
    const createdAt = new Date(Date.now() - daysAgo * 864e5);
    const [linkRow] = await db.select().from(tradeLinks).where(and(eq(tradeLinks.supplierId, id[seller]!), eq(tradeLinks.buyerId, id[buyer]!))).limit(1);
    const due = status === "shipped" || status === "received" ? new Date(createdAt.getTime() + (1 + (linkRow?.creditDays ?? 0)) * 864e5) : null;
    const [p] = await db.insert(purchaseOrders).values({
      number, sellerId: id[seller]!, buyerId: id[buyer]!, status, lines,
      subtotal: r2(subtotal), tax: r2(subtotal * 0.18), total: r2(subtotal * 1.18), paymentTerms: "credit", dueDate: due,
      trackingNote: status === "shipped" ? "VRL Logistics LR 44812" : null, createdAt, updatedAt: createdAt,
    }).returning();
    if (status === "shipped" || status === "received") {
      await db.insert(ledgerEntries).values({ ownerId: id[seller]!, counterpartyId: id[buyer]!, type: "invoice", amount: p!.total, refType: "po", refId: p!.id, note: `PO ${number}`, createdAt: new Date(createdAt.getTime() + 864e5) });
    }
  };
  await po("PO-SEED-0001", "castings", "sahyadri", "received", [["LCF-IMP-100", 1000, 140]], 40);
  await po("PO-SEED-0002", "sahyadri", "deccan", "received", [["SP-MS-22", 500, 150], ["SP-STK-15", 40, 1950]], 28);
  await po("PO-SEED-0003", "deccan", "ganesh", "received", [["KEL-36-440", 200, 195], ["6205-2Z", 100, 160]], 25);
  await po("PO-SEED-0004", "ganesh", "patil", "shipped", [["KEL-36-440", 30, 235], ["SP-MS-22", 10, 185]], 2);
  await po("PO-SEED-0005", "ganesh", "patil", "sent", [["AC-DC-45-5", 20, 330]], 0);
  await po("PO-SEED-0006", "deccan", "powergen", "accepted", [["DIS-PCB-900", 10, 1350]], 1);
  await po("PO-SEED-0007", "sahyadri", "deccan", "sent", [["SP-V4-IMP-1H", 1000, 78]], 0);

  // Part payments so balances look like a real book.
  const pay = async (owner: string, cp: string, amount: number, note: string, daysAgo: number) => {
    const [ex] = await db.select({ id: ledgerEntries.id }).from(ledgerEntries).where(and(eq(ledgerEntries.ownerId, id[owner]!), eq(ledgerEntries.note, note))).limit(1);
    if (!ex) await db.insert(ledgerEntries).values({ ownerId: id[owner]!, counterpartyId: id[cp]!, type: "payment", amount: (-amount).toFixed(2), method: "upi", refType: "manual", note, createdAt: new Date(Date.now() - daysAgo * 864e5) });
  };
  await pay("castings", "sahyadri", 165200, "NEFT settlement Sept", 5);
  await pay("sahyadri", "deccan", 100000, "RTGS part payment", 6);
  await pay("deccan", "ganesh", 30000, "UPI part payment", 3);

  console.log("🌱 seed-v3: counter bills + walk-in khata");
  const [hasBills] = await db.select({ n: sql<number>`count(*)::int` }).from(salesBills).where(eq(salesBills.sellerId, id.patil!));
  if (!hasBills!.n) {
    const bill = async (n: number, customerName: string | null, customerPhone: string | null, mode: string, items: [string, number][], hoursAgo: number) => {
      const lines: BillLine[] = items.map(([pn, q]) => {
        const s = PRODUCTS.find((p) => p[0] === "patil" && p[6] === pn)!;
        return { productId: pid[`patil:${pn}`]!, name: s[4], quantity: q, unitPrice: s[7].toFixed(2), gstRate: 18, total: r2(q * s[7] * 1.18) };
      });
      const sub = items.reduce((s, [pn, q]) => s + q * PRODUCTS.find((p) => p[0] === "patil" && p[6] === pn)![7], 0);
      const createdAt = new Date(Date.now() - hoursAgo * 36e5);
      const [b] = await db.insert(salesBills).values({ sellerId: id.patil!, number: `BILL-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`, customerName, customerPhone, lines, subtotal: r2(sub), tax: r2(sub * 0.18), total: r2(sub * 1.18), paymentMode: mode, createdAt }).returning();
      if (mode === "credit") await db.insert(ledgerEntries).values({ ownerId: id.patil!, counterpartyName: customerName, counterpartyPhone: customerPhone, type: "invoice", amount: b!.total, refType: "bill", refId: b!.id, note: b!.number, createdAt });
    };
    await bill(1, "Walk-in", null, "cash", [["FC-25", 2]], 30);
    await bill(2, "Imran Motor Rewinding", "9822011223", "credit", [["KEL-36-440", 4], ["SP-MS-22", 2]], 26);
    await bill(3, "Suresh (farm, Wagholi)", "9890012345", "upi", [["FV-15", 1], ["KEL-36-440", 1]], 3);
    await bill(4, "Imran Motor Rewinding", "9822011223", "credit", [["PS-1428", 1]], 1);
  }

  console.log("🌱 seed-v3: a technician who fixes pumps & appliances");
  const [imranEx] = await db.select({ id: users.id }).from(users).where(eq(users.email, "imran@findmyspare.test")).limit(1);
  const imran = imranEx?.id ?? (await db.insert(users).values({
    email: "imran@findmyspare.test", phone: "9822011223", name: "Imran Shaikh", role: "buyer", city: "Pune", pincode: "411013",
    profileCompleted: true, emailVerified: true, isActive: true, businessRoles: ["technician"], industries: ["pumps", "appliances", "electrical"],
  }).returning({ id: users.id }))[0]!.id;
  const [ig] = await db.select({ id: garages.id }).from(garages).where(eq(garages.ownerId, imran)).limit(1);
  if (!ig) {
    await db.insert(garages).values({
      ownerId: imran, name: "Imran Motor Rewinding", phone: "+91 98220 11223", addressLine: "Hadapsar Industrial Estate", city: "Pune",
      state: "Maharashtra", pincode: "411013", upiId: "imranrewind@okaxis", invoicePrefix: "IMR", verified: true,
      specialisations: ["Submersible rewinding", "Monoblock", "AC & fridge"], industrySlugs: ["pumps", "appliances", "electrical"],
    });
  }

  console.log("🌱 seed-v3: customers' machines + open Fix requests");
  const arjun = (await db.select({ id: users.id }).from(users).where(eq(users.email, "buyer1@findmyspare.test")).limit(1))[0]?.id;
  const priya = (await db.select({ id: users.id }).from(users).where(eq(users.email, "buyer2@findmyspare.test")).limit(1))[0]?.id;
  if (arjun) {
    const machine = async (vals: { industrySlug: string; machineType: string; makeName: string; modelName: string; serialNo: string; nickname: string; year: number }) => {
      const [ex] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.serialNo, vals.serialNo)).limit(1);
      if (ex) return ex.id;
      const [v] = await db.insert(vehicles).values({ ...vals, ownerId: arjun }).returning({ id: vehicles.id });
      return v!.id;
    };
    const pump = await machine({ industrySlug: "pumps", machineType: "submersible", makeName: "Sahyadri", modelName: "V4 1 HP", serialNo: "SP24V41H0912", nickname: "Borewell pump", year: 2022 });
    await machine({ industrySlug: "appliances", machineType: "ac", makeName: "Voltas", modelName: "1.5 T Inverter Split", serialNo: "VLT185IVZ7781", nickname: "Bedroom AC", year: 2021 });
    await machine({ industrySlug: "power", machineType: "inverter", makeName: "Luminous", modelName: "Zelio+ 1100", serialNo: "LUM1100Z44521", nickname: "Home inverter", year: 2020 });
    const [hasReq] = await db.select({ n: sql<number>`count(*)::int` }).from(serviceRequests).where(eq(serviceRequests.customerId, arjun));
    if (!hasReq!.n) {
      await db.insert(serviceRequests).values([
        { customerId: arjun, industrySlug: "pumps", machineType: "submersible", brand: "Sahyadri", model: "V4 1 HP", vehicleId: pump, problem: "Borewell pump runs but no water comes up. Trips the starter after 2 minutes.", city: "Pune", address: "Kalyani Nagar", phone: "9123456789", preferredTime: "Tomorrow morning" },
      ]);
    }
  }
  if (priya) {
    const [hasReq] = await db.select({ n: sql<number>`count(*)::int` }).from(serviceRequests).where(eq(serviceRequests.customerId, priya));
    if (!hasReq!.n) {
      await db.insert(serviceRequests).values([
        { customerId: priya, industrySlug: "appliances", machineType: "ac", brand: "Daikin", model: "1 T split", problem: "AC is running but not cooling, outdoor fan not spinning.", city: "Pune", address: "Aundh", phone: "9123456790", preferredTime: "Today evening" },
        { customerId: priya, industrySlug: "power", machineType: "genset", brand: "Kirloskar", model: "15 kVA", problem: "Society genset smokes heavily on start and stops under load.", city: "Pune", address: "Baner", phone: "9123456790", preferredTime: "This week" },
      ]);
    }
  }

  console.log("🌱 seed-v3: demand signals");
  const [hasSearch] = await db.select({ n: sql<number>`count(*)::int` }).from(searchEvents);
  if (!hasSearch!.n) {
    const S: [string, string, string, number, number][] = [
      // query, industry, city, results, times
      ["submersible capacitor", "pumps", "Pune", 4, 14], ["mechanical seal 22mm", "pumps", "Pune", 3, 9],
      ["openwell pump winding 3hp", "pumps", "Nashik", 0, 6], ["solar pump controller", "pumps", "Nashik", 0, 5],
      ["ac pcb", "appliances", "Mumbai", 1, 11], ["fridge compressor", "appliances", "Pune", 0, 7],
      ["inverter pcb 900va", "power", "Ahmedabad", 1, 4], ["tractor clutch plate", "agriculture", "Nashik", 1, 8],
      ["excavator seal kit", "construction", "Raipur", 1, 3], ["iphone 13 display", "electronics", "Delhi", 0, 12],
      ["outboard impeller", "marine", "Kochi", 1, 3], ["vfd 5hp", "industrial", "Pune", 0, 5], ["swift brake pads", "automotive", "Pune", 3, 10],
    ];
    const rows = S.flatMap(([query, industrySlug, city, resultCount, times]) =>
      Array.from({ length: times }, (_, i) => ({ query, industrySlug, city, resultCount, createdAt: new Date(Date.now() - (i * 2 + 1) * 36e5) })));
    await db.insert(searchEvents).values(rows);
  }

  console.log("✅ seed-v3 done", Object.keys(id).length, "businesses,", PRODUCTS.length, "listings");
}

main().then(closeConnection).catch(async (e) => { console.error(e); await closeConnection(); process.exit(1); });
