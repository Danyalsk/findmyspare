import React, { useState } from "react";
import { View, Text } from "react-native";
import { SvgUri } from "react-native-svg";

/* Real brand marks from the Simple Icons CDN (nominative use to identify
   brands whose parts are sold). Falls back to a colored monogram tile if the
   remote SVG fails to load. */

interface BrandStyle {
  slug: string;
  mono: string;
  bg: string;
  fg: string;
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

const tileShadow = {
  shadowColor: "#101828",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

export function BrandTile({ name, size = 64 }: { name: string; size?: number }) {
  const s = styleFor(name);
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.28);
  const logo = Math.round(size * 0.56);

  if (failed || !s.slug) {
    return (
      <View
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: s.bg, ...tileShadow }}
        className="items-center justify-center"
      >
        <Text style={{ color: s.fg, fontSize: Math.round(size * (s.mono.length > 1 ? 0.32 : 0.4)) }} className="font-extrabold">
          {s.mono}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECEEF2", ...tileShadow }}
      className="items-center justify-center"
    >
      <SvgUri
        uri={`https://cdn.simpleicons.org/${s.slug}`}
        width={logo}
        height={logo}
        onError={() => setFailed(true)}
      />
    </View>
  );
}
