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
        // ── "Warm Porcelain" premium LIGHT theme ──
        // Warm neutral axis so the saffron accent harmonizes (Zomato/Airbnb).
        paper: "#F8F6F2",        // canvas — warm porcelain, not white
        "paper-2": "#FFFFFF",    // surface: cards, sheets, inputs
        "paper-3": "#F1EDE7",    // inset: image wells, skeletons
        "paper-4": "#E9E4DC",    // pressed
        ink: "#1C1814",          // espresso near-black (warm)
        "ink-2": "#6E6258",      // secondary
        "ink-3": "#9D9285",      // tertiary / placeholder
        line: "#EDE8E1",         // warm hairline
        "line-2": "#DCD5CB",     // stronger border
        accent: "#F25C05",       // signature saffron (holds on white)
        "accent-2": "#E03E00",   // gradient end
        "accent-ink": "#BC4708", // accent text on light (AA)
        "accent-wash": "#FDEEE2",
        gold: "#F5A623",         // ratings only
        amber: "#B45309",
        "amber-wash": "#FCF3E3",
        success: "#1B8A4C",
        "success-wash": "#E5F4EA",
        danger: "#D93025",
        "danger-wash": "#FBEAE7",
      },
      fontSize: {
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
