"use client";

/* ═══════════════════════════════════════════════════════
   FindMySpare — Theme Provider
   Manages theme (light/dark), density, and accent color.
   ═══════════════════════════════════════════════════════ */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/* ── Types ── */

export type Theme = "light" | "dark";
export type Density = "comfortable" | "compact";
export type Accent = "emerald" | "blue" | "orange" | "ink";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  density: Density;
  setDensity: (d: Density) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
}

/* ── Accent color maps (from prototype app.js) ── */

const accentMaps: Record<Accent, {
  light: { accent: string; ink: string; wash: string };
  dark: { accent: string; ink: string; wash: string };
}> = {
  emerald: {
    light: { accent: "oklch(0.72 0.17 160)", ink: "oklch(0.32 0.11 160)", wash: "oklch(0.95 0.04 160)" },
    dark:  { accent: "oklch(0.78 0.17 160)", ink: "oklch(0.90 0.14 160)", wash: "oklch(0.26 0.05 160)" },
  },
  blue: {
    light: { accent: "oklch(0.68 0.18 245)", ink: "oklch(0.40 0.14 245)", wash: "oklch(0.95 0.04 245)" },
    dark:  { accent: "oklch(0.68 0.18 245)", ink: "oklch(0.88 0.14 245)", wash: "oklch(0.28 0.06 245)" },
  },
  orange: {
    light: { accent: "oklch(0.72 0.17 55)", ink: "oklch(0.42 0.14 55)", wash: "oklch(0.95 0.04 55)" },
    dark:  { accent: "oklch(0.72 0.17 55)", ink: "oklch(0.88 0.14 55)", wash: "oklch(0.28 0.06 55)" },
  },
  ink: {
    light: { accent: "oklch(0.22 0.01 240)", ink: "oklch(0.22 0.01 240)", wash: "oklch(0.93 0.008 85)" },
    dark:  { accent: "oklch(0.22 0.01 240)", ink: "oklch(0.97 0.005 85)", wash: "oklch(0.26 0.01 240)" },
  },
};

/* ── Context ── */

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ── Provider ── */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [density, setDensityState] = useState<Density>("comfortable");
  const [accent, setAccentState] = useState<Accent>("emerald");

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const savedTheme = localStorage.getItem("fms_theme") as Theme | null;
    const savedDensity = localStorage.getItem("fms_density") as Density | null;
    const savedAccent = localStorage.getItem("fms_accent") as Accent | null;

    if (savedTheme) setThemeState(savedTheme);
    if (savedDensity) setDensityState(savedDensity);
    if (savedAccent) setAccentState(savedAccent);
  }, []);

  /* Apply theme attribute to <html> */
  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  /* Apply density attribute to <html> */
  const applyDensity = useCallback((d: Density) => {
    document.documentElement.setAttribute("data-density", d);
  }, []);

  /* Apply accent colors as CSS custom properties */
  const applyAccent = useCallback((a: Accent, t: Theme) => {
    const mode = t === "dark" ? "dark" : "light";
    const colors = accentMaps[a]?.[mode] ?? accentMaps.emerald[mode];
    const root = document.documentElement;
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-ink", colors.ink);
    root.style.setProperty("--accent-wash", colors.wash);
  }, []);

  /* Sync DOM whenever state changes */
  useEffect(() => {
    applyTheme(theme);
    applyDensity(density);
    applyAccent(accent, theme);
  }, [theme, density, accent, applyTheme, applyDensity, applyAccent]);

  /* Public setters — persist + update state */
  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("fms_theme", t);
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const setDensity = useCallback((d: Density) => {
    localStorage.setItem("fms_density", d);
    setDensityState(d);
  }, []);

  const setAccent = useCallback((a: Accent) => {
    localStorage.setItem("fms_accent", a);
    setAccentState(a);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, density, setDensity, accent, setAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Hook ── */

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
