// Universal taxonomy: 10 industries → machine types (+ spec fields, brands) → part categories.
// Production-safe and idempotent: inserts missing rows only, never touches users/products.
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { industries, machineTypes, partCategories } from "../db/schema";

type MT = { slug: string; name: string; attrs?: [string, string, string?][]; brands: string[] };
type Ind = { slug: string; name: string; tagline: string; icon: string; tint: string; ink: string; idLabel: string; types: MT[]; categories: [string, string][] };

const HP: [string, string, string?] = ["hp", "Power", "HP"];
const PHASE: [string, string, string?] = ["phase", "Phase"];

export const TAXONOMY: Ind[] = [
  {
    slug: "automotive", name: "Cars, bikes & trucks", tagline: "Every vehicle on Indian roads", icon: "car", tint: "#FFF1EB", ink: "#A32D0C", idLabel: "Registration no.",
    types: [
      { slug: "car", name: "Car", attrs: [["fuel", "Fuel"], ["year", "Year"]], brands: ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Kia", "Renault"] },
      { slug: "bike", name: "Motorcycle", attrs: [["cc", "Engine", "cc"]], brands: ["Hero", "Bajaj", "TVS", "Honda", "Royal Enfield", "Yamaha"] },
      { slug: "scooter", name: "Scooter", attrs: [["cc", "Engine", "cc"]], brands: ["Honda", "TVS", "Suzuki", "Ola Electric", "Ather"] },
      { slug: "commercial", name: "Truck & bus", attrs: [["gvw", "GVW", "t"]], brands: ["Tata", "Ashok Leyland", "Eicher", "BharatBenz", "Mahindra"] },
      { slug: "three-wheeler", name: "Auto & e-rickshaw", brands: ["Bajaj", "Piaggio", "Mahindra", "TVS"] },
    ],
    categories: [["Brakes", "brake"], ["Filters", "filter"], ["Engine", "engine"], ["Electrical", "electrical"], ["Suspension", "suspension"], ["Transmission", "transmission"], ["Lighting", "headlight"], ["Body", "body"], ["AC", "ac"], ["Tyres", "tyre"], ["Wipers", "wiper"], ["Interior", "interior"]],
  },
  {
    slug: "pumps", name: "Water pumps & motors", tagline: "Submersible, monoblock, openwell, solar", icon: "pump", tint: "#EAF0FD", ink: "#2457C5", idLabel: "Serial no.",
    types: [
      { slug: "submersible", name: "Submersible pump", attrs: [HP, ["stages", "Stages"], PHASE], brands: ["Kirloskar", "Crompton", "CRI", "Texmo", "Lubi", "Shakti"] },
      { slug: "monoblock", name: "Monoblock pump", attrs: [HP, PHASE], brands: ["Kirloskar", "Crompton", "Havells", "V-Guard", "KSB"] },
      { slug: "openwell", name: "Openwell pump", attrs: [HP, PHASE], brands: ["Kirloskar", "Texmo", "CRI", "Lubi"] },
      { slug: "self-priming", name: "Self-priming / domestic", attrs: [HP], brands: ["Crompton", "Havells", "V-Guard", "Kirloskar"] },
      { slug: "solar-pump", name: "Solar pump", attrs: [HP, ["controller", "Controller"]], brands: ["Shakti", "Tata Power Solar", "Lubi", "CRI"] },
      { slug: "pressure-booster", name: "Pressure booster", attrs: [HP], brands: ["Grundfos", "KSB", "Crompton"] },
    ],
    categories: [["Impellers & diffusers", "pump"], ["Windings & stators", "motor"], ["Capacitors", "electrical"], ["Mechanical seals", "seal"], ["Bearings", "bearing"], ["Starters & panels", "panel"], ["Cables", "cable"], ["Shafts & sleeves", "gear"], ["Pressure switches", "gauge"], ["Foot & check valves", "valve"]],
  },
  {
    slug: "electrical", name: "Motors & electricals", tagline: "Industrial motors, panels, switchgear", icon: "motor", tint: "#FFF6E0", ink: "#9A6700", idLabel: "Serial no.",
    types: [
      { slug: "induction-motor", name: "Induction motor", attrs: [HP, PHASE, ["rpm", "Speed", "rpm"]], brands: ["ABB", "Siemens", "Crompton", "Havells", "Bharat Bijlee", "Kirloskar"] },
      { slug: "starter-panel", name: "Starter & control panel", attrs: [HP], brands: ["L&T", "Schneider", "Siemens", "Havells"] },
      { slug: "transformer", name: "Transformer", attrs: [["kva", "Rating", "kVA"]], brands: ["Kirloskar", "Siemens", "ABB"] },
      { slug: "switchgear", name: "Switchgear & DB", brands: ["Schneider", "L&T", "Legrand", "Havells", "Siemens"] },
    ],
    categories: [["Bearings", "bearing"], ["Winding wire", "motor"], ["Contactors & relays", "electrical"], ["MCB & MCCB", "panel"], ["Starters", "panel"], ["Fans & cooling", "fan"], ["Terminal boxes", "electrical"], ["Brushes & slip rings", "gear"], ["Cables & lugs", "cable"]],
  },
  {
    slug: "appliances", name: "Home appliances", tagline: "AC, fridge, washing machine, geyser, fan", icon: "appliance", tint: "#E6F6FA", ink: "#0B6E85", idLabel: "Serial no.",
    types: [
      { slug: "ac", name: "Air conditioner", attrs: [["tonnage", "Capacity", "ton"], ["type", "Type"]], brands: ["Voltas", "LG", "Daikin", "Samsung", "Blue Star", "Lloyd", "Panasonic"] },
      { slug: "refrigerator", name: "Refrigerator", attrs: [["litres", "Capacity", "L"]], brands: ["LG", "Samsung", "Whirlpool", "Godrej", "Haier"] },
      { slug: "washing-machine", name: "Washing machine", attrs: [["kg", "Capacity", "kg"]], brands: ["LG", "Samsung", "IFB", "Whirlpool", "Bosch"] },
      { slug: "geyser", name: "Water heater", attrs: [["litres", "Capacity", "L"]], brands: ["Racold", "AO Smith", "Havells", "Bajaj", "V-Guard"] },
      { slug: "water-purifier", name: "Water purifier", brands: ["Kent", "Aquaguard", "Pureit", "Livpure"] },
      { slug: "fan", name: "Fan & cooler", brands: ["Crompton", "Havells", "Orient", "Usha", "Bajaj", "Symphony"] },
      { slug: "kitchen", name: "Mixer, microwave & chimney", brands: ["Bajaj", "Philips", "Preethi", "Prestige", "Elica"] },
    ],
    categories: [["Compressors", "ac"], ["PCBs & controllers", "chip"], ["Motors & fans", "fan"], ["Gas & copper", "valve"], ["Capacitors", "electrical"], ["Thermostats & sensors", "gauge"], ["Filters & membranes", "filter"], ["Heating elements", "heat"], ["Drain pumps & valves", "valve"], ["Remotes & displays", "chip"]],
  },
  {
    slug: "power", name: "Power backup & solar", tagline: "Inverters, batteries, gensets, solar", icon: "power", tint: "#FFF8D6", ink: "#8A6100", idLabel: "Serial no.",
    types: [
      { slug: "inverter", name: "Inverter & UPS", attrs: [["va", "Rating", "VA"]], brands: ["Luminous", "Microtek", "V-Guard", "Exide"] },
      { slug: "battery", name: "Inverter battery", attrs: [["ah", "Capacity", "Ah"]], brands: ["Exide", "Amaron", "Luminous", "Okaya"] },
      { slug: "genset", name: "Diesel genset", attrs: [["kva", "Rating", "kVA"]], brands: ["Kirloskar", "Cummins", "Mahindra Powerol", "Ashok Leyland"] },
      { slug: "solar", name: "Solar system", attrs: [["kw", "Size", "kW"]], brands: ["Tata Power Solar", "Waaree", "Adani Solar", "Luminous"] },
    ],
    categories: [["Batteries", "battery"], ["Inverter PCBs", "chip"], ["Charge controllers", "panel"], ["Genset filters", "filter"], ["AVRs & controllers", "panel"], ["Alternator parts", "motor"], ["Solar panels", "solar"], ["MC4 & DC cables", "cable"], ["Fuel pumps & injectors", "engine"]],
  },
  {
    slug: "agriculture", name: "Tractors & farm machines", tagline: "Tractors, harvesters, tillers, sprayers", icon: "tractor", tint: "#E7F5EF", ink: "#0B7A53", idLabel: "Registration / serial no.",
    types: [
      { slug: "tractor", name: "Tractor", attrs: [HP], brands: ["Mahindra", "Swaraj", "Sonalika", "John Deere", "Massey Ferguson", "Escorts Kubota", "New Holland"] },
      { slug: "harvester", name: "Combine harvester", brands: ["Preet", "Kartar", "John Deere", "Mahindra"] },
      { slug: "power-tiller", name: "Power tiller & rotavator", brands: ["VST", "Shrachi", "Mahindra", "Shaktiman"] },
      { slug: "sprayer", name: "Sprayer", brands: ["Aspee", "Neptune", "KisanKraft"] },
      { slug: "irrigation", name: "Drip & sprinkler", brands: ["Jain Irrigation", "Netafim", "Finolex"] },
    ],
    categories: [["Clutch & PTO", "transmission"], ["Hydraulics", "valve"], ["Rotavator blades", "blade"], ["Filters", "filter"], ["Tyres & rims", "tyre"], ["Gears & transmission", "gear"], ["Sprayer nozzles & pumps", "pump"], ["Drip fittings", "valve"], ["Lights & electricals", "headlight"]],
  },
  {
    slug: "industrial", name: "Industrial machinery (MRO)", tagline: "Bearings, belts, hydraulics, pneumatics", icon: "gear", tint: "#EEF0F3", ink: "#3E434E", idLabel: "Asset tag / serial no.",
    types: [
      { slug: "air-compressor", name: "Air compressor", attrs: [["cfm", "Flow", "CFM"], HP], brands: ["Elgi", "Atlas Copco", "Ingersoll Rand", "Kaeser"] },
      { slug: "cnc", name: "CNC & machine tools", brands: ["Ace Micromatic", "BFW", "Fanuc", "Haas", "Jyoti"] },
      { slug: "hydraulic-press", name: "Hydraulic system & press", brands: ["Bosch Rexroth", "Yuken", "Parker", "Eaton"] },
      { slug: "conveyor", name: "Conveyor & material handling", brands: ["Fenner", "Godrej", "Toyota"] },
      { slug: "gearbox", name: "Gearbox & drives", brands: ["Elecon", "Bonfiglioli", "SEW", "Siemens"] },
      { slug: "boiler", name: "Boiler & thermal", brands: ["Thermax", "Forbes Marshall", "Cheema"] },
    ],
    categories: [["Bearings", "bearing"], ["Belts & chains", "belt"], ["Seals & O-rings", "seal"], ["Hydraulic valves & cylinders", "valve"], ["Pneumatics", "valve"], ["Couplings", "gear"], ["Filters & separators", "filter"], ["Sensors & PLC", "chip"], ["Lubricants & greases", "oil"], ["Tools & spindles", "tool"]],
  },
  {
    slug: "construction", name: "Construction equipment", tagline: "Backhoes, excavators, mixers, cranes", icon: "excavator", tint: "#FFF6E0", ink: "#9A6700", idLabel: "Machine serial no.",
    types: [
      { slug: "backhoe", name: "Backhoe loader", brands: ["JCB", "Case", "Mahindra", "ACE"] },
      { slug: "excavator", name: "Excavator", brands: ["Tata Hitachi", "Komatsu", "Hyundai CE", "Caterpillar", "Volvo CE"] },
      { slug: "mixer", name: "Concrete mixer", brands: ["Schwing Stetter", "Ajax Fiori", "AIMIX"] },
      { slug: "crane", name: "Crane & forklift", brands: ["ACE", "Escorts", "Godrej", "Toyota"] },
      { slug: "roller", name: "Road roller", brands: ["Hamm", "Dynapac", "Volvo CE", "Escorts"] },
    ],
    categories: [["Bucket teeth & GET", "tool"], ["Hydraulic pumps & motors", "pump"], ["Undercarriage", "gear"], ["Filters", "filter"], ["Seal kits", "seal"], ["Engine parts", "engine"], ["Electricals", "electrical"], ["Cabin & glass", "body"]],
  },
  {
    slug: "electronics", name: "Mobiles & electronics", tagline: "Phones, laptops, TVs, CCTV, printers", icon: "phone", tint: "#F1ECFB", ink: "#5B3CC4", idLabel: "IMEI / serial no.",
    types: [
      { slug: "smartphone", name: "Smartphone", brands: ["Samsung", "Apple", "Xiaomi", "Vivo", "Oppo", "OnePlus", "Realme"] },
      { slug: "laptop", name: "Laptop", brands: ["HP", "Dell", "Lenovo", "Asus", "Acer", "Apple"] },
      { slug: "tv", name: "Television", attrs: [["inch", "Screen", "in"]], brands: ["Samsung", "LG", "Sony", "Xiaomi", "TCL"] },
      { slug: "cctv", name: "CCTV & security", brands: ["Hikvision", "CP Plus", "Dahua", "Godrej"] },
      { slug: "printer", name: "Printer", brands: ["HP", "Canon", "Epson", "Brother"] },
    ],
    categories: [["Displays & touch", "chip"], ["Batteries", "battery"], ["Charging ports & ICs", "chip"], ["Motherboards", "chip"], ["Cameras", "chip"], ["Speakers & mics", "electrical"], ["Back panels & bodies", "body"], ["Keyboards & trackpads", "chip"], ["Chargers & adapters", "plug"]],
  },
  {
    slug: "marine", name: "Marine & specialised machines", tagline: "Boats, outboard motors, medical, textile", icon: "boat", tint: "#EAF0FD", ink: "#2457C5", idLabel: "Hull / serial no.",
    types: [
      { slug: "outboard", name: "Outboard motor", attrs: [HP], brands: ["Yamaha", "Suzuki Marine", "Mercury", "Tohatsu"] },
      { slug: "fishing-boat", name: "Fishing boat engine", attrs: [HP], brands: ["Kirloskar", "Greaves", "Ashok Leyland", "Yanmar"] },
      { slug: "medical", name: "Medical equipment", brands: ["Philips", "GE Healthcare", "BPL", "Mindray"] },
      { slug: "textile", name: "Textile & sewing machines", brands: ["Juki", "Usha", "Brother", "Lakshmi Machine Works"] },
      { slug: "printing", name: "Printing & packaging machines", brands: ["Heidelberg", "Komori", "Manugraph"] },
    ],
    categories: [["Propellers", "fan"], ["Impellers & water pumps", "pump"], ["Spark plugs & ignition", "electrical"], ["Gearcase parts", "gear"], ["Fuel systems", "engine"], ["Anodes", "tool"], ["Belts & hoses", "belt"], ["Sensors & probes", "gauge"]],
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function seedTaxonomy() {
  let order = 0;
  for (const ind of TAXONOMY) {
    order += 10;
    let [row] = await db.select().from(industries).where(eq(industries.slug, ind.slug)).limit(1);
    if (!row) {
      [row] = await db.insert(industries).values({
        slug: ind.slug, name: ind.name, tagline: ind.tagline, icon: ind.icon, tint: ind.tint, ink: ind.ink,
        identifierLabel: ind.idLabel, sortOrder: order,
      }).returning();
    }
    let t = 0;
    for (const mt of ind.types) {
      t += 10;
      const [ex] = await db.select({ id: machineTypes.id }).from(machineTypes)
        .where(and(eq(machineTypes.industryId, row!.id), eq(machineTypes.slug, mt.slug))).limit(1);
      if (!ex) {
        await db.insert(machineTypes).values({
          industryId: row!.id, slug: mt.slug, name: mt.name, brands: mt.brands, sortOrder: t,
          attributes: (mt.attrs ?? []).map(([key, label, unit]) => ({ key, label, ...(unit ? { unit } : {}) })),
        });
      }
    }
    let c = 0;
    for (const [name, icon] of ind.categories) {
      c += 10;
      const [ex] = await db.select({ id: partCategories.id }).from(partCategories)
        .where(and(eq(partCategories.industryId, row!.id), eq(partCategories.name, name))).limit(1);
      if (!ex) await db.insert(partCategories).values({ industryId: row!.id, name, icon, sortOrder: c });
    }
  }
}

export { slugify };
