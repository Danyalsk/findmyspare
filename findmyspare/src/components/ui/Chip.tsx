import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Chip — refined editorial pill.
   Smaller, hairline-bordered, tighter typography.
   ═══════════════════════════════════════════════════════ */

export interface ChipProps {
  variant?:
    | "default"
    | "ok"
    | "warn"
    | "danger"
    | "rating"
    | "discount"
    | "accent"
    | "solid";
  size?: "sm" | "md";
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  dashed?: boolean;
  dot?: boolean;
}

export function Chip({
  variant = "default",
  size = "sm",
  children,
  onRemove,
  className,
  dashed = false,
  dot = false,
}: ChipProps) {
  const dotColor =
    variant === "ok" || variant === "rating"
      ? "bg-[color:var(--success)]"
      : variant === "warn"
      ? "bg-[color:var(--amber)]"
      : variant === "danger" || variant === "discount"
      ? "bg-[color:var(--danger)]"
      : variant === "accent"
      ? "bg-[color:var(--accent)]"
      : variant === "solid"
      ? "bg-white"
      : "bg-ink-3";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap font-semibold tracking-tight",
        "rounded-full",
        size === "sm" && "px-2 py-[3px] text-[10.5px]",
        size === "md" && "px-2.5 py-[5px] text-[11.5px]",

        variant === "default" && [
          "bg-paper text-ink-2",
          dashed ? "border border-dashed border-[color:var(--line-2)]" : "border border-[color:var(--line)]",
        ],
        variant === "ok" && "bg-success-wash text-[color:var(--success)] border border-[color:var(--success)]/15",
        variant === "rating" && "bg-paper border border-[color:var(--line)] text-ink",
        variant === "warn" && "bg-amber-wash text-[color:var(--amber)] border border-[color:var(--amber)]/15",
        variant === "discount" && "bg-discount-wash text-[color:var(--discount)] border border-[color:var(--discount)]/15",
        variant === "danger" && "bg-danger-wash text-[color:var(--danger)] border border-[color:var(--danger)]/15",
        variant === "accent" && "bg-accent-wash text-[color:var(--accent-ink)] border border-[color:var(--accent)]/15",
        variant === "solid" && "bg-ink text-paper border border-ink",

        className
      )}
    >
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full", dotColor)} />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-base leading-none"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
