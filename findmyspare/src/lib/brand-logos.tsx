"use client";

import React, { useState } from "react";

/* ═══════════════════════════════════════════════════════
   Brand tiles — real brand marks pulled from the Simple
   Icons CDN (nominative use to identify brands whose parts
   are sold). Falls back to a colored monogram tile if the
   logo fails to load (offline / 404 / CDN down).
   ═══════════════════════════════════════════════════════ */

interface BrandStyle {
  slug: string; // simpleicons slug → https://cdn.simpleicons.org/<slug>
  mono: string; // fallback monogram
  bg: string; // fallback tile bg
  fg: string; // fallback monogram color
}

const BRANDS: Record<string, BrandStyle> = {
  "Maruti Suzuki": { slug: "suzuki", mono: "MS", bg: "#E11B22", fg: "#FFFFFF" },
  Maruti: { slug: "suzuki", mono: "MS", bg: "#E11B22", fg: "#FFFFFF" },
  Hyundai: { slug: "hyundai", mono: "HY", bg: "#002C5F", fg: "#FFFFFF" },
  Tata: { slug: "tata", mono: "TA", bg: "#1A3668", fg: "#FFFFFF" },
  "Tata Motors": { slug: "tata", mono: "TA", bg: "#1A3668", fg: "#FFFFFF" },
  Mahindra: { slug: "mahindra", mono: "MA", bg: "#B11116", fg: "#FFFFFF" },
  Honda: { slug: "honda", mono: "HO", bg: "#111317", fg: "#FFFFFF" },
  Toyota: { slug: "toyota", mono: "TO", bg: "#EB0A1E", fg: "#FFFFFF" },
  Kia: { slug: "kia", mono: "K", bg: "#05141F", fg: "#FFFFFF" },
  Renault: { slug: "renault", mono: "R", bg: "#FFCC33", fg: "#111317" },
  Volkswagen: { slug: "volkswagen", mono: "VW", bg: "#001E50", fg: "#FFFFFF" },
};

function styleFor(name: string): BrandStyle {
  return BRANDS[name] ?? { slug: "", mono: name.slice(0, 1).toUpperCase(), bg: "#2A2D36", fg: "#FFFFFF" };
}

export function BrandLogo({ name, size = 56 }: { name: string; size?: number }) {
  const s = styleFor(name);
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.28);

  // Fallback: colored monogram tile.
  if (failed || !s.slug) {
    const font = Math.round(size * (s.mono.length > 1 ? 0.34 : 0.42));
    return (
      <div
        aria-hidden
        style={{ width: size, height: size, borderRadius: radius, background: s.bg, color: s.fg, fontSize: font }}
        className="flex items-center justify-center font-extrabold tracking-tight select-none shadow-[0_4px_14px_rgba(16,24,40,0.12)]"
      >
        {s.mono}
      </div>
    );
  }

  // Real brand mark on a clean light tile.
  return (
    <div
      style={{ width: size, height: size, borderRadius: radius }}
      className="flex items-center justify-center bg-paper border border-[color:var(--line)] shadow-[0_4px_14px_rgba(16,24,40,0.10)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.simpleicons.org/${s.slug}`}
        alt={`${name} logo`}
        width={Math.round(size * 0.56)}
        height={Math.round(size * 0.56)}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: size * 0.56, height: size * 0.56, objectFit: "contain" }}
      />
    </div>
  );
}
