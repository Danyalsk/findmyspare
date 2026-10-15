import React from "react";
import {
  EngineIcon, BrakeIcon, HeadlightIcon, BodyIcon, SuspensionIcon, TransmissionIcon,
  ElectricalIcon, FilterIcon, TyreIcon, AcIcon, WiperIcon, InteriorIcon,
} from "@/lib/category-icons";

/* One line-icon vocabulary for every industry and part category in the
   taxonomy (icon keys come from the backend's taxonomy data). Same style as
   category-icons: 24px box, 1.6 stroke, rounded caps. */

type P = { size?: number; className?: string };
const svg = (children: React.ReactNode) =>
  function Icon({ size = 24, className }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {children}
      </svg>
    );
  };

const ICONS: Record<string, React.ComponentType<P>> = {
  // Industries
  car: svg(<><path d="M4 16v-4l2-5h12l2 5v4" /><path d="M3 16h18v2.5H3z" /><circle cx="7.5" cy="13" r="1" /><circle cx="16.5" cy="13" r="1" /><path d="M6 18.5V20M18 18.5V20" /></>),
  pump: svg(<><rect x="4" y="9" width="10" height="9" rx="2" /><path d="M14 12h3a2 2 0 0 1 2 2v0" /><path d="M19 14v5" /><path d="M9 9V5h4" /><circle cx="9" cy="13.5" r="2" /><path d="M4 20h16" /></>),
  motor: svg(<><rect x="3" y="7" width="13" height="10" rx="2" /><path d="M16 10h3v4h-3M19 12h2" /><path d="M6 7V5M10 7V5M13 7V5" /><path d="M6 17v2h7v-2" /></>),
  appliance: svg(<><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="13" r="4" /><circle cx="12" cy="13" r="1.4" /><path d="M8 6h2M15 6h1" /></>),
  power: svg(<><path d="M13 2 5 13h6l-1 9 8-11h-6z" /></>),
  tractor: svg(<><circle cx="7" cy="16" r="4" /><circle cx="18" cy="17" r="2.5" /><path d="M7 12V6h5l2 6h5v3" /><path d="M10.5 16h5" /><path d="M14 6V4" /></>),
  gear: svg(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>),
  excavator: svg(<><path d="M3 18h11" /><rect x="3" y="13" width="9" height="5" rx="1" /><path d="M6 13V9h4l2 4" /><path d="M12 10l5-5 4 3-3 3" /><path d="M18 11l-1 3h3" /><circle cx="5.5" cy="20" r="1" /><circle cx="10" cy="20" r="1" /></>),
  phone: svg(<><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M10.5 18.5h3" /></>),
  boat: svg(<><path d="M3 15h18l-2.5 5h-13z" /><path d="M12 3v12" /><path d="M12 4l6 9h-6" /><path d="M12 6l-5 7h5" /></>),
  // Categories
  engine: EngineIcon, brake: BrakeIcon, headlight: HeadlightIcon, body: BodyIcon, suspension: SuspensionIcon,
  transmission: TransmissionIcon, electrical: ElectricalIcon, filter: FilterIcon, tyre: TyreIcon, ac: AcIcon, wiper: WiperIcon, interior: InteriorIcon,
  battery: svg(<><rect x="3" y="7" width="16" height="11" rx="2" /><path d="M7 5v2M15 5v2M21 11v3" /><path d="M7 12.5h3M14 12.5h3M15.5 11v3" /></>),
  bearing: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="5.5" r="1" /><circle cx="18.5" cy="12" r="1" /><circle cx="12" cy="18.5" r="1" /><circle cx="5.5" cy="12" r="1" /></>),
  belt: svg(<><circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="4" /><path d="M6 9l12-1M6 15l12 1" /></>),
  blade: svg(<><path d="M4 20 14 10" /><path d="M14 10c2-4 5-6 7-6-0 2-2 5-6 7z" /><path d="M8 4c0 3 1 5 3 6" /></>),
  cable: svg(<><path d="M4 20c4 0 4-8 8-8s4-8 8-8" /><rect x="2" y="18" width="4" height="4" rx="1" /><rect x="18" y="2" width="4" height="4" rx="1" /></>),
  chip: svg(<><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>),
  fan: svg(<><circle cx="12" cy="12" r="1.6" /><path d="M12 10.4C12 6 14 3 16.5 4s1 5-4.5 6.4" /><path d="M13.4 12.8c3.8 2.2 5.4 5.4 3.4 7s-4.6-2.4-4.2-7.2" /><path d="M10.6 12.8C6.8 15 3.2 14.8 3 12.2s4-3.2 7.6.6" /></>),
  gauge: svg(<><path d="M4 18a9 9 0 1 1 16 0" /><path d="M12 14l4-5" /><circle cx="12" cy="14" r="1.2" /><path d="M7 18h10" /></>),
  heat: svg(<><path d="M6 20V9a2 2 0 0 1 4 0v4a2 2 0 0 0 4 0V9a2 2 0 0 1 4 0v11" /><path d="M8 4c0 1 1 1 1 2M12 3c0 1 1 1 1 2M16 4c0 1 1 1 1 2" /></>),
  oil: svg(<><path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z" /><path d="M10 14a2 2 0 0 0 2 2" /></>),
  panel: svg(<><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 7h3M8 10h3" /><circle cx="15.5" cy="8.5" r="1.5" /><path d="M8 15h8M8 18h8" /></>),
  plug: svg(<><path d="M9 3v5M15 3v5" /><path d="M6 8h12v3a6 6 0 0 1-12 0z" /><path d="M12 17v4" /></>),
  seal: svg(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="5" /><path d="M12 4v3M12 17v3" /></>),
  solar: svg(<><path d="M4 14l2-8h12l2 8z" /><path d="M5 10h14M10 6l-1 8M14 6l1 8" /><path d="M12 14v5M8 20h8" /></>),
  tool: svg(<><path d="M14.7 6.3a4 4 0 0 0 5 5l-8.6 8.6a2.1 2.1 0 0 1-3-3z" /><path d="M14.7 6.3 17 4l3 3-2.3 2.3" /></>),
  valve: svg(<><path d="M3 10h5l2 2-2 2H3zM21 10h-5l-2 2 2 2h5z" /><path d="M12 12V6" /><path d="M9 4h6" /></>),
};

export function NetIcon({ name, size = 24, className }: { name: string | null | undefined; size?: number; className?: string }) {
  const I = (name && ICONS[name]) || ICONS.gear!;
  return <I size={size} className={className} />;
}

/** Tinted round icon tile (Swiggy "what's on your mind" style). */
export function IconTile({ name, tint, ink, size = 72, iconSize, className }: { name: string; tint: string; ink: string; size?: number; iconSize?: number; className?: string }) {
  return (
    <span className={`rounded-full flex items-center justify-center flex-shrink-0 ${className ?? ""}`} style={{ width: size, height: size, background: tint, color: ink }}>
      <NetIcon name={name} size={iconSize ?? Math.round(size * 0.46)} />
    </span>
  );
}

/** Static look per industry (mirrors the taxonomy seed) for places that render before taxonomy loads. */
export const INDUSTRY_STYLE: Record<string, { icon: string; tint: string; ink: string; short: string }> = {
  automotive: { icon: "car", tint: "#FFF1EB", ink: "#A32D0C", short: "Vehicles" },
  pumps: { icon: "pump", tint: "#EAF0FD", ink: "#2457C5", short: "Water pumps" },
  electrical: { icon: "motor", tint: "#FFF6E0", ink: "#9A6700", short: "Motors" },
  appliances: { icon: "appliance", tint: "#E6F6FA", ink: "#0B6E85", short: "Appliances" },
  power: { icon: "power", tint: "#FFF8D6", ink: "#8A6100", short: "Power & solar" },
  agriculture: { icon: "tractor", tint: "#E7F5EF", ink: "#0B7A53", short: "Farm" },
  industrial: { icon: "gear", tint: "#EEF0F3", ink: "#3E434E", short: "Industrial" },
  construction: { icon: "excavator", tint: "#FFF6E0", ink: "#9A6700", short: "Construction" },
  electronics: { icon: "phone", tint: "#F1ECFB", ink: "#5B3CC4", short: "Electronics" },
  marine: { icon: "boat", tint: "#EAF0FD", ink: "#2457C5", short: "Marine & more" },
};

const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/capacitor|contactor|relay|mcb|electric|terminal/i, "electrical"], [/seal|o-ring/i, "seal"], [/bearing/i, "bearing"],
  [/belt|chain/i, "belt"], [/filter|membrane|separator/i, "filter"], [/pcb|controller|display|remote|chip|plc|sensor|motherboard/i, "chip"],
  [/compressor|cool/i, "ac"], [/batter/i, "battery"], [/cable|wire|lug|mc4/i, "cable"], [/fan/i, "fan"], [/heat|element|thermostat/i, "heat"],
  [/valve|gas|copper|fuel/i, "valve"], [/impeller|pump|hydraulic/i, "pump"], [/winding|stator|motor|alternator/i, "motor"], [/blade|teeth|bucket/i, "blade"],
  [/solar/i, "solar"], [/starter|panel/i, "panel"], [/gear|shaft|coupling|clutch|transmission|propeller/i, "gear"], [/tyre|rim|undercarriage|roller/i, "tyre"],
  [/lubric|oil|grease/i, "oil"], [/plug|ignition|charging|charger|adapter/i, "plug"], [/light/i, "headlight"], [/tool|spindle/i, "tool"],
  [/gauge|pressure/i, "gauge"], [/body|cabin|glass|panel|back/i, "body"], [/engine|injector/i, "engine"],
];
export const iconForCategory = (name: string | null | undefined) => (name && CATEGORY_KEYWORDS.find(([re]) => re.test(name))?.[1]) || "gear";
