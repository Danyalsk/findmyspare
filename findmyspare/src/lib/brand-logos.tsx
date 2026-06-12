import React from "react";

/* ═══════════════════════════════════════════════════════
   Brand tiles — custom-designed monogram badges (brand-
   evocative colors + initials). NOT official trademarked
   logos. To use real artwork later: drop PNG/SVG files in
   /public/logos and swap <BrandLogo> to render an <img>.
   ═══════════════════════════════════════════════════════ */

interface BrandStyle {
  mono: string; // 1–2 letter monogram
  bg: string; // tile background
  fg: string; // monogram color
}

// Keyed by the brand label used in VEHICLE_BRANDS / constants.
const BRANDS: Record<string, BrandStyle> = {
  "Maruti Suzuki": { mono: "MS", bg: "#E11B22", fg: "#FFFFFF" },
  Maruti: { mono: "MS", bg: "#E11B22", fg: "#FFFFFF" },
  Hyundai: { mono: "HY", bg: "#002C5F", fg: "#FFFFFF" },
  Tata: { mono: "TA", bg: "#1A3668", fg: "#FFFFFF" },
  "Tata Motors": { mono: "TA", bg: "#1A3668", fg: "#FFFFFF" },
  Mahindra: { mono: "MA", bg: "#B11116", fg: "#FFFFFF" },
  Honda: { mono: "HO", bg: "#111317", fg: "#FFFFFF" },
  Toyota: { mono: "TO", bg: "#EB0A1E", fg: "#FFFFFF" },
  Kia: { mono: "K", bg: "#05141F", fg: "#FFFFFF" },
  Renault: { mono: "R", bg: "#FFCC33", fg: "#111317" },
  Volkswagen: { mono: "VW", bg: "#001E50", fg: "#FFFFFF" },
};

function styleFor(name: string): BrandStyle {
  return (
    BRANDS[name] ?? {
      mono: name.slice(0, 1).toUpperCase(),
      bg: "#2A2D36",
      fg: "#FFFFFF",
    }
  );
}

export function BrandLogo({ name, size = 56 }: { name: string; size?: number }) {
  const s = styleFor(name);
  const radius = Math.round(size * 0.28);
  const font = Math.round(size * (s.mono.length > 1 ? 0.34 : 0.42));
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(145deg, ${s.bg} 0%, ${s.bg}cc 100%)`,
        color: s.fg,
        fontSize: font,
        boxShadow: "0 4px 14px rgba(16,24,40,0.12)",
      }}
      className="flex items-center justify-center font-extrabold tracking-tight select-none"
    >
      {s.mono}
    </div>
  );
}
