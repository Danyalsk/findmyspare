import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Chip — matches prototype .chip
   Variants: default, ok (green), warn (amber), danger (red)
   Optional dismiss handler for removable chips
   ═══════════════════════════════════════════════════════ */

export interface ChipProps {
  variant?: "default" | "ok" | "warn" | "danger";
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  dashed?: boolean;
}

export function Chip({
  variant = "default",
  children,
  onRemove,
  className,
  dashed = false,
}: ChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-[5px] rounded-full",
        "text-[11px] font-medium whitespace-nowrap",

        /* Variant */
        variant === "default" && [
          "bg-paper-2 text-ink-2",
          dashed ? "border border-dashed border-line" : "border border-line",
        ],
        variant === "ok" && [
          "bg-accent-wash text-accent-ink border border-transparent",
        ],
        variant === "warn" && [
          "bg-amber-wash text-[oklch(0.45_0.12_60)] border border-transparent",
        ],
        variant === "danger" && [
          "bg-danger-wash text-[oklch(0.45_0.15_25)] border border-transparent",
        ],

        className
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
