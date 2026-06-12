/* ═══════════════════════════════════════════════════════
   FindMySpare — Shared Constants
   ═══════════════════════════════════════════════════════ */

/**
 * Format a number as Indian Rupees.
 * e.g. formatPrice(3200) → "₹3,200"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as compact Indian Rupees.
 * e.g. formatPriceCompact(48200) → "₹48.2K"
 */
export function formatPriceCompact(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatPrice(amount);
}

/* ── Vehicle data (Make → Model → Years) ── */

export const vehicleData: Record<string, Record<string, string[]>> = {
  "Maruti Suzuki": {
    "Swift":       ["2024", "2023", "2022", "2021", "2020", "2019"],
    "Baleno":      ["2024", "2023", "2022", "2021", "2020"],
    "Alto":        ["2024", "2023", "2022", "2021", "2020", "2019"],
    "WagonR":      ["2024", "2023", "2022", "2021", "2020"],
    "Brezza":      ["2024", "2023", "2022", "2021"],
    "Dzire":       ["2024", "2023", "2022", "2021", "2020"],
    "Ertiga":      ["2024", "2023", "2022", "2021"],
  },
  "Hyundai": {
    "Creta":       ["2024", "2023", "2022", "2021", "2020"],
    "Venue":       ["2024", "2023", "2022", "2021", "2020"],
    "i20":         ["2024", "2023", "2022", "2021", "2020"],
    "Verna":       ["2024", "2023", "2022", "2021"],
    "Tucson":      ["2024", "2023", "2022"],
    "Grand i10":   ["2024", "2023", "2022", "2021", "2020"],
  },
  "Tata Motors": {
    "Nexon":       ["2024", "2023", "2022", "2021", "2020"],
    "Punch":       ["2024", "2023", "2022"],
    "Harrier":     ["2024", "2023", "2022", "2021"],
    "Safari":      ["2024", "2023", "2022", "2021"],
    "Altroz":      ["2024", "2023", "2022", "2021"],
    "Tiago":       ["2024", "2023", "2022", "2021", "2020"],
  },
  "Mahindra": {
    "Thar":        ["2024", "2023", "2022", "2021", "2020"],
    "XUV700":      ["2024", "2023", "2022"],
    "Scorpio-N":   ["2024", "2023", "2022"],
    "XUV300":      ["2024", "2023", "2022", "2021"],
    "Bolero":      ["2024", "2023", "2022", "2021", "2020"],
  },
  "Toyota": {
    "Innova Crysta": ["2024", "2023", "2022", "2021", "2020"],
    "Fortuner":      ["2024", "2023", "2022", "2021"],
    "Glanza":        ["2024", "2023", "2022"],
    "Urban Cruiser":  ["2024", "2023", "2022"],
  },
  "Honda": {
    "City":        ["2024", "2023", "2022", "2021", "2020"],
    "Amaze":       ["2024", "2023", "2022", "2021"],
    "Elevate":     ["2024", "2023"],
    "WR-V":        ["2023", "2022", "2021", "2020"],
  },
  "Kia": {
    "Seltos":      ["2024", "2023", "2022", "2021", "2020"],
    "Sonet":       ["2024", "2023", "2022", "2021"],
    "Carens":      ["2024", "2023", "2022"],
    "EV6":         ["2024", "2023"],
  },
  "Volkswagen": {
    "Taigun":      ["2024", "2023", "2022"],
    "Virtus":      ["2024", "2023", "2022"],
    "Polo":        ["2023", "2022", "2021", "2020"],
  },
};

export const makes = Object.keys(vehicleData);

/* ── Part categories ── */

export interface Category {
  label: string;
  desc: string;
  count: string;
}

export const categories: Category[] = [
  { label: "Engine",       desc: "Pistons & timing kits",    count: "1,240+ Parts" },
  { label: "Brakes",       desc: "Pads, rotors & calipers",  count: "840+ Parts"   },
  { label: "Suspension",   desc: "Shocks & struts",          count: "620+ Parts"   },
  { label: "Electrical",   desc: "Batteries & alternators",  count: "1,100+ Parts" },
  { label: "Transmission", desc: "Clutches & gearboxes",     count: "450+ Parts"   },
  { label: "Body Panels",  desc: "Doors & fenders",          count: "2,300+ Parts" },
  { label: "Cooling",      desc: "Radiators & pumps",        count: "580+ Parts"   },
  { label: "Fuel System",  desc: "Pumps & injectors",        count: "920+ Parts"   },
  { label: "Exhaust",      desc: "Mufflers & converters",    count: "310+ Parts"   },
  { label: "Lighting",     desc: "Headlights & relays",      count: "1,450+ Parts" },
  { label: "Bumpers",      desc: "Covers & guards",          count: "890+ Parts"   },
  { label: "Steering",     desc: "Racks & tie rods",         count: "530+ Parts"   },
];
