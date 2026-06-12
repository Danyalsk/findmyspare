import React from "react";
import { View, Text } from "react-native";

/* Custom brand monogram tiles — NOT official trademarked logos.
   Brand-evocative colors + initials. Swap to <Image> later for real artwork. */

interface BrandStyle {
  mono: string;
  bg: string;
  fg: string;
}

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
  return BRANDS[name] ?? { mono: name.slice(0, 1).toUpperCase(), bg: "#2A2D36", fg: "#FFFFFF" };
}

export function BrandTile({ name, size = 64 }: { name: string; size?: number }) {
  const s = styleFor(name);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundColor: s.bg,
        shadowColor: "#101828",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
      className="items-center justify-center"
    >
      <Text style={{ color: s.fg, fontSize: Math.round(size * (s.mono.length > 1 ? 0.32 : 0.4)) }} className="font-extrabold">
        {s.mono}
      </Text>
    </View>
  );
}
