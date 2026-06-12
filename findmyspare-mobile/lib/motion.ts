import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { Easing } from "react-native-reanimated";

/**
 * Central motion tokens — Emil Kowalski's principles applied to React Native.
 * One source of truth so every spring/timing across the app is consistent and
 * snappy. UI motion stays <300ms, uses ease-OUT (never ease-in), and only
 * animates transform/opacity.
 */

// ── Spring presets (moti / reanimated) ───────────────
// Snappy, low/no overshoot for UI. Subtle bounce only for playful/drag.
export const SPRING = {
  /** Press feedback — instant, no overshoot. */
  press: { type: "spring", damping: 18, stiffness: 340, mass: 0.7 } as const,
  /** General entrance / settle. */
  gentle: { type: "spring", damping: 20, stiffness: 220, mass: 0.9 } as const,
  /** Subtle playful bounce (use sparingly). */
  bouncy: { type: "spring", damping: 13, stiffness: 220, mass: 0.9 } as const,
  /** Bottom-sheet / drawer settle. */
  sheet: { type: "spring", damping: 24, stiffness: 260, mass: 1 } as const,
};

// ── Easing curves (stronger than RN defaults) ─────────
// out: entering/exiting · inOut: on-screen movement · drawer: iOS sheet curve.
export const EASE = {
  out: Easing.bezier(0.23, 1, 0.32, 1),
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
  drawer: Easing.bezier(0.32, 0.72, 0, 1),
};

// ── Durations (ms) — keep UI under 300 ────────────────
export const DURATION = { fast: 140, base: 200, slow: 280 };

/** moti timing preset helper. */
export const timing = (duration: number = DURATION.base, easing = EASE.out) =>
  ({ type: "timing", duration, easing } as const);

/** Staggered entry delay: index → ms (capped so long lists never feel slow). */
export const stagger = (index: number, step = 40, cap = 8) =>
  Math.min(index, cap) * step;

/**
 * Tracks the OS "Reduce Motion" setting. Callers drop transform-based motion
 * (keep opacity + haptics) when true, per accessibility guidance.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduced(v));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
