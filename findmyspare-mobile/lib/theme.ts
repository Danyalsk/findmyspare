import type { ViewStyle } from "react-native";

/**
 * FindMySpare design tokens — "Swiggy-clean" LIGHT theme.
 * Single source of truth for icon/style color props. Flip these (and the
 * matching tailwind.config tokens) to re-theme the whole app.
 */
export const C = {
  paper: "#F6F7F9",      // app canvas (very light gray)
  paper2: "#FFFFFF",     // card / surface
  paper3: "#EEF0F4",     // image / inset bg
  paper4: "#E4E7EC",     // pressed surface
  ink: "#11121A",        // primary text/icon
  ink2: "#5A5D6B",       // secondary
  ink3: "#9499A6",       // tertiary / placeholder
  line: "#ECEEF2",       // hairline
  line2: "#DCDFE6",      // stronger border
  accent: "#FF6B1A",     // signature saffron-orange
  accent2: "#FF4D1A",    // gradient end (deep)
  accentInk: "#C2520A",  // accent TEXT on light (AA contrast)
  accentWash: "#FFF1E6", // accent tinted surface
  gold: "#FF9F1C",
  success: "#15924E",
  danger: "#E5484D",
  onInk: "#FFFFFF",      // content on the dark `bg-ink` inverse surface
  onAccent: "#FFFFFF",   // content on accent / gradient fills
  white: "#FFFFFF",
} as const;

/** Soft elevation for cards on the light canvas. */
export const shadowCard: ViewStyle = {
  shadowColor: "#101828",
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 5 },
  elevation: 3,
};

/** Stronger lift for floating surfaces. */
export const shadowFloat: ViewStyle = {
  shadowColor: "#101828",
  shadowOpacity: 0.12,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 14 },
  elevation: 12,
};

/** Warm glow under the primary accent CTA. */
export const glowAccent: ViewStyle = {
  shadowColor: C.accent,
  shadowOpacity: 0.38,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};
