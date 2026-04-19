import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Card — matches prototype .card
   Variants: default, dark (ink bg), accent-wash
   ═══════════════════════════════════════════════════════ */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "accent";
  bordered?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  bordered = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius)] p-[var(--pad)]",

        /* Variant */
        variant === "default" && [
          "bg-paper",
          bordered && "border border-line",
        ],
        variant === "dark" && [
          "bg-ink text-paper",
          bordered && "border border-ink",
        ],
        variant === "accent" && [
          "bg-accent-wash",
          "border border-transparent",
        ],

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
