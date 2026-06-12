import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Avatar — initials-based avatar with configurable color
   Matches prototype supplier avatars (e.g. "KP")
   ═══════════════════════════════════════════════════════ */

export interface AvatarProps {
  initials: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-[26px] h-[26px] text-[10px]",
  md: "w-[36px] h-[36px] text-[13px]",
  lg: "w-[42px] h-[42px] text-[15px]",
};

export function Avatar({
  initials,
  color = "oklch(0.55 0.10 30)",
  size = "md",
  className,
}: AvatarProps) {
  return (
    <div
      className={clsx(
        "rounded-[12px] flex items-center justify-center",
        "font-semibold text-paper select-none flex-shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
