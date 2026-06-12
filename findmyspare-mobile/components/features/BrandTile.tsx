import React, { useState } from "react";
import { View, Text } from "react-native";
import { SvgUri } from "react-native-svg";
import { C, shadowCard } from "@/lib/theme";

/* Real brand marks from the Simple Icons CDN (nominative use to identify
   brands whose parts are sold). Falls back to a colored monogram tile if the
   remote SVG fails to load. */

interface BrandStyle {
  slug: string;
  monogram: string;
  bg: string;
  fg: string;
}

const BRANDS: Record<string, BrandStyle> = {
  "Maruti Suzuki": { slug: "suzuki", monogram: "MS", bg: "#E11B22", fg: "#FFFFFF" },
  Maruti: { slug: "suzuki", monogram: "MS", bg: "#E11B22", fg: "#FFFFFF" },
  Hyundai: { slug: "hyundai", monogram: "HY", bg: "#002C5F", fg: "#FFFFFF" },
  Tata: { slug: "tata", monogram: "TA", bg: "#1A3668", fg: "#FFFFFF" },
  "Tata Motors": { slug: "tata", monogram: "TA", bg: "#1A3668", fg: "#FFFFFF" },
  Mahindra: { slug: "mahindra", monogram: "MA", bg: "#B11116", fg: "#FFFFFF" },
  Honda: { slug: "honda", monogram: "HO", bg: "#111317", fg: "#FFFFFF" },
  Toyota: { slug: "toyota", monogram: "TO", bg: "#EB0A1E", fg: "#FFFFFF" },
  Kia: { slug: "kia", monogram: "K", bg: "#05141F", fg: "#FFFFFF" },
  Renault: { slug: "renault", monogram: "R", bg: "#FFCC33", fg: "#111317" },
  Volkswagen: { slug: "volkswagen", monogram: "VW", bg: "#001E50", fg: "#FFFFFF" },
};

function styleFor(name: string): BrandStyle {
  return BRANDS[name] ?? { slug: "", monogram: name.slice(0, 1).toUpperCase(), bg: C.ink, fg: C.onInk };
}

export function BrandTile({ name, size = 64 }: { name: string; size?: number }) {
  const s = styleFor(name);
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.28);
  const logo = Math.round(size * 0.56);

  if (failed || !s.slug) {
    return (
      <View
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: s.bg, ...shadowCard }}
        className="items-center justify-center"
      >
        <Text style={{ color: s.fg, fontSize: Math.round(size * (s.monogram.length > 1 ? 0.32 : 0.4)) }} className="font-sans-extrabold">
          {s.monogram}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: C.paper2, borderWidth: 1, borderColor: C.line, ...shadowCard }}
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
