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
        // ── Swiggy-clean LIGHT theme ──
        paper: "#F6F7F9",       // canvas
        "paper-2": "#FFFFFF",   // card / surface
        "paper-3": "#EEF0F4",   // image / inset
        "paper-4": "#E4E7EC",   // pressed
        ink: "#11121A",         // primary text
        "ink-2": "#5A5D6B",     // secondary
        "ink-3": "#9499A6",     // tertiary / placeholder
        line: "#ECEEF2",        // hairline
        "line-2": "#DCDFE6",    // stronger border
        accent: "#FF6B1A",      // saffron-orange
        "accent-2": "#FF4D1A",  // gradient end
        "accent-ink": "#C2520A",// accent text (AA on white)
        "accent-wash": "#FFF1E6",
        gold: "#FF9F1C",
        amber: "#E8A317",
        "amber-wash": "#FFF4DD",
        success: "#15924E",
        danger: "#E5484D",
        "danger-wash": "#FDECEC",
      },
      borderRadius: {
        card: "20px",
        xl2: "26px",
        xl3: "32px",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "System"],
        mono: ["JetBrainsMono_400Regular", "Menlo"],
        serif: ["InstrumentSerif_400Regular", "Georgia"],
      },
    },
  },
  plugins: [],
};
