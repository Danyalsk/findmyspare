"use client";

import { motion } from "framer-motion";

interface DnaLoaderProps {
  size?: number;
  label?: string;
  fullscreen?: boolean;
}

const COUNT = 10;
const DURATION = 1.2;

export function DnaLoader({ size = 72, label, fullscreen = false }: DnaLoaderProps) {
  const loader = (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative flex items-center justify-between"
        style={{ width: size * 2.4, height: size }}
        aria-hidden
      >
        {Array.from({ length: COUNT }).map((_, i) => {
          const delay = (i / COUNT) * DURATION;
          return (
            <div key={i} className="relative flex-1" style={{ height: size }}>
              <motion.span
                className="absolute left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-accent"
                animate={{ top: ["0%", "88%", "0%"] }}
                transition={{ duration: DURATION, delay, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className="absolute left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-ink"
                animate={{ top: ["88%", "0%", "88%"] }}
                transition={{ duration: DURATION, delay, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          );
        })}
      </div>
      {label && (
        <div className="mono text-[10px] tracking-[0.2em] text-ink-3">{label}</div>
      )}
    </div>
  );

  if (!fullscreen) return loader;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-paper/85 backdrop-blur-sm"
    >
      {loader}
    </div>
  );
}
