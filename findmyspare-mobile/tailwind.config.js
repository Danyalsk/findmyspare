/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── "Titanium" premium cool-LIGHT theme ──
        // Cool neutral axis so the cobalt accent reads crisp and expensive.
        paper: "#F4F5F7",        // canvas — cool titanium grey
        "paper-2": "#FFFFFF",    // surface: cards, sheets, inputs
        "paper-3": "#ECEEF1",    // inset: image wells, skeletons
        "paper-4": "#E2E5EA",    // pressed
        ink: "#15171A",          // cool near-black
        "ink-2": "#5B6068",      // slate secondary
        "ink-3": "#9AA0A8",      // tertiary / placeholder
        line: "#E8EAEE",         // cool hairline
        "line-2": "#D6DAE0",     // stronger border
        accent: "#2E5BFF",       // signature cobalt (holds on white)
        "accent-2": "#1E45E8",   // gradient end
        "accent-ink": "#1E45E8", // accent text on light (AA)
        "accent-wash": "#EAEEFF",
        gold: "#F5A623",         // ratings only
        amber: "#B45309",
        "amber-wash": "#FCF3E3",
        success: "#18794E",
        "success-wash": "#E7F4EE",
        danger: "#DC2626",
        "danger-wash": "#FCEBEA",
      },
      fontSize: {
        mega: ["44px", { lineHeight: "44px", letterSpacing: "-1.6px" }],
        hero: ["34px", { lineHeight: "36px", letterSpacing: "-1px" }],
        display: ["28px", { lineHeight: "34px", letterSpacing: "-0.5px" }],
        title: ["22px", { lineHeight: "28px", letterSpacing: "-0.3px" }],
        headline: ["17px", { lineHeight: "22px" }],
        body: ["15px", { lineHeight: "21px" }],
        sub: ["13px", { lineHeight: "18px" }],
        caption: ["12px", { lineHeight: "16px" }],
        micro: ["11px", { lineHeight: "14px" }],
        overline: ["11px", { lineHeight: "14px", letterSpacing: "0.88px" }],
      },
      borderRadius: {
        input: "12px",
        card: "16px",
        xl2: "20px",
        xl3: "28px",
      },
      fontFamily: {
        // Static Google-font weights — one family name per weight.
        sans: ["Inter_400Regular", "System"],
        "sans-medium": ["Inter_500Medium", "System"],
        "sans-semibold": ["Inter_600SemiBold", "System"],
        "sans-bold": ["Inter_700Bold", "System"],
        "sans-extrabold": ["Inter_800ExtraBold", "System"],
        mono: ["JetBrainsMono_500Medium", "Menlo"],
      },
    },
  },
  plugins: [],
};
