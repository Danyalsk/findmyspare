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

/* ── Context ── */

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ── Provider ── */

function readStorage<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  return (value as T | null) ?? fallback;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStorage("fms_theme", "light"));
  const [density, setDensityState] = useState<Density>(() =>
    readStorage("fms_density", "comfortable")
  );
  const [accent, setAccentState] = useState<Accent>(() => readStorage("fms_accent", "emerald"));

  /* Apply theme attribute to <html> */
  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  /* Apply density attribute to <html> */
  const applyDensity = useCallback((d: Density) => {
    document.documentElement.setAttribute("data-density", d);
  }, []);

  /* v2 brand: the accent is fixed (Spark Vermilion, see brand/GUIDELINES.md).
     globals.css owns --accent*; clear any inline override a v1 accent
     picker (stored in fms_accent) may have left behind. */
  const applyAccent = useCallback((_a: Accent, _t: Theme) => {
    const root = document.documentElement;
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-ink");
    root.style.removeProperty("--accent-wash");
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
