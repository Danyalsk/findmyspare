import React, { useEffect, useState } from "react";
import { Text, type TextProps } from "react-native";
import { useReducedMotion } from "@/lib/motion";

export interface AnimatedCounterProps extends TextProps {
  /** Target value to count up to. */
  value: number;
  /** Format the interpolated number (e.g. price, %, suffix). */
  format?: (n: number) => string;
  /** Count duration in ms. */
  duration?: number;
  className?: string;
}

/**
 * Counts a number up from 0 → value on mount with an ease-out curve. Used for
 * stat tiles and prices so figures feel "earned". Respects Reduce Motion
 * (snaps to final). Pure JS rAF — fine for one-shot mount animations.
 */
export function AnimatedCounter({ value, format = (n) => String(Math.round(n)), duration = 900, className, ...rest }: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <Text className={className} {...rest}>{format(display)}</Text>;
}
