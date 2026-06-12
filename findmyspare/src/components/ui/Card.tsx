import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Card — premium editorial.
   Hairline border + small shadow by default.
   No big shadows, no gradients, restrained.
   ═══════════════════════════════════════════════════════ */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "dark" | "accent" | "success" | "flat";
  bordered?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  bordered = true,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius)] p-[var(--pad)]",

        variant === "default" && [
          "bg-paper",
          bordered && "border border-[color:var(--line)]",
        ],
        variant === "elevated" && [
          "bg-paper",
          "shadow-[var(--shadow-card)]",
          bordered && "border border-[color:var(--line)]",
        ],
        variant === "dark" && [
          "bg-ink text-paper",
        ],
        variant === "accent" && [
          "bg-accent-wash",
          "border border-[color:var(--accent)]/15",
        ],
        variant === "success" && [
          "bg-success-wash",
          "border border-[color:var(--success)]/15",
        ],
        variant === "flat" && [
          "bg-paper",
          bordered && "border border-[color:var(--line)]",
        ],

        interactive && "fms-press cursor-pointer hover:border-[color:var(--accent)]/40",

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
