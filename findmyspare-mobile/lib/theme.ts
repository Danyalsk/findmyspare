import type { ViewStyle } from "react-native";

/**
 * FindMySpare design tokens — "Warm Porcelain" premium LIGHT theme.
 * Single source of truth for icon/style color props. Values mirror
 * tailwind.config.js exactly — change both together.
 */
export const C = {
  paper: "#F8F6F2",      // canvas — warm porcelain
  paper2: "#FFFFFF",     // surface: cards / sheets / inputs
  paper3: "#F1EDE7",     // inset: image wells, skeletons
  paper4: "#E9E4DC",     // pressed surface
  ink: "#1C1814",        // espresso primary text/icon
  ink2: "#6E6258",       // secondary
  ink3: "#9D9285",       // tertiary / placeholder
  line: "#EDE8E1",       // warm hairline
  line2: "#DCD5CB",      // stronger border
  accent: "#F25C05",     // signature saffron
  accent2: "#E03E00",    // gradient end
  accentInk: "#BC4708",  // accent TEXT on light (AA)
  accentWash: "#FDEEE2", // accent tinted surface
  gold: "#F5A623",       // ratings only
  amber: "#B45309",
  amberWash: "#FCF3E3",
  success: "#1B8A4C",
  successWash: "#E5F4EA",
  danger: "#D93025",
  dangerWash: "#FBEAE7",
  onInk: "#FFFFFF",      // content on the dark `bg-ink` inverse surface
  onAccent: "#FFFFFF",   // content on accent / gradient fills
  white: "#FFFFFF",
  scrim: "rgba(28,24,20,0.45)",      // sheet/modal backdrop
  glassTab: "rgba(255,255,255,0.78)", // frosted tab bar fill
} as const;

/** The only sanctioned gradient — two-stop saffron ramp (Button, hero CTA, sign-in pill). */
export const GRADIENT: [string, string] = ["#FF7A1F", "#F25C05"];

/** Soft warm elevation for cards on the porcelain canvas. */
export const shadowCard: ViewStyle = {
  shadowColor: "#3D2E1E",
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

/** Stronger lift for floating surfaces (tab bar, sheets, FABs). */
export const shadowFloat: ViewStyle = {
  shadowColor: "#3D2E1E",
  shadowOpacity: 0.14,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 12,
};

/** Warm glow under the primary accent CTA. */
export const glowAccent: ViewStyle = {
  shadowColor: C.accent,
  shadowOpacity: 0.28,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};
