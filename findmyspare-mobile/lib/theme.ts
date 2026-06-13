import type { ViewStyle } from "react-native";

/**
 * FindMySpare design tokens — "Titanium" premium cool-LIGHT theme.
 * Single source of truth for icon/style color props. Values mirror
 * tailwind.config.js exactly — change both together.
 */
export const C = {
  paper: "#F4F5F7",      // canvas — cool titanium grey
  paper2: "#FFFFFF",     // surface: cards / sheets / inputs
  paper3: "#ECEEF1",     // inset: image wells, skeletons
  paper4: "#E2E5EA",     // pressed surface
  ink: "#15171A",        // cool near-black primary text/icon
  ink2: "#5B6068",       // slate secondary
  ink3: "#9AA0A8",        // cool tertiary / placeholder
  line: "#E8EAEE",       // cool hairline
  line2: "#D6DAE0",      // stronger border
  accent: "#2E5BFF",     // signature cobalt
  accent2: "#1E45E8",    // gradient end / deeper cobalt
  accentInk: "#1E45E8",  // accent TEXT on light (AA)
  accentWash: "#EAEEFF", // accent tinted surface
  gold: "#F5A623",       // ratings only
  amber: "#B45309",
  amberWash: "#FCF3E3",
  success: "#18794E",
  successWash: "#E7F4EE",
  danger: "#DC2626",
  dangerWash: "#FCEBEA",
  onInk: "#FFFFFF",      // content on the dark `bg-ink` inverse surface
  onAccent: "#FFFFFF",   // content on accent / gradient fills
  white: "#FFFFFF",
  scrim: "rgba(15,18,25,0.45)",      // sheet/modal backdrop
  glassTab: "rgba(255,255,255,0.78)", // frosted tab bar fill
} as const;

/** The only sanctioned gradient — two-stop cobalt ramp (Button hero, PromoBanner). */
export const GRADIENT: [string, string] = ["#3D6BFF", "#2E5BFF"];

/** Soft cool elevation for cards on the titanium canvas. */
export const shadowCard: ViewStyle = {
  shadowColor: "#1B2030",
  shadowOpacity: 0.07,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

/** Stronger lift for floating surfaces (tab bar, sheets, FABs). */
export const shadowFloat: ViewStyle = {
  shadowColor: "#1B2030",
  shadowOpacity: 0.16,
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
