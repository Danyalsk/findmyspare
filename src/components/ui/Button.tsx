import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Button — matches prototype .btn
   Variants: default, primary, accent
   Sizes: md (48px), lg (54px)
   Modifiers: block (full-width), dashed
   ═══════════════════════════════════════════════════════ */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "accent";
  size?: "md" | "lg";
  block?: boolean;
  dashed?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  block = false,
  dashed = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        /* Base */
        "inline-flex items-center justify-center gap-2",
        "font-medium text-sm cursor-pointer transition-all active:scale-[0.97]",
        "border",

        /* Size */
        size === "md" && "h-12 px-5 rounded-[12px] text-[14px]",
        size === "lg" && "h-[54px] px-6 rounded-[14px] text-[15px]",

        /* Variant */
        variant === "default" && [
          "bg-paper text-ink border-line",
          "hover:bg-paper-2",
        ],
        variant === "primary" && [
          "bg-ink text-paper border-ink",
          "hover:opacity-90",
        ],
        variant === "accent" && [
          "bg-accent border-transparent",
          "text-[oklch(0.18_0.05_160)]",
          "hover:opacity-90",
        ],

        /* Modifiers */
        block && "w-full",
        dashed && "border-dashed",

        /* Disabled */
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",

        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
      ) : children}
    </button>
  );
}
