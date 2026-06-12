import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Button — Apple-quiet premium.
   Default primary = solid ink (near-black). Accent variant
   uses saffron sparingly. Tight type, single radius.
   ═══════════════════════════════════════════════════════ */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger" | "default";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  pill?: boolean;
  dashed?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  pill = false,
  dashed = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const v = variant === "default" ? "ghost" : variant;

  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 select-none",
        "font-semibold cursor-pointer fms-press",
        "border border-transparent tracking-tight",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-paper",

        size === "sm" && "h-9 px-4 text-[13px]",
        size === "md" && "h-11 px-5 text-[14px]",
        size === "lg" && "h-[52px] px-7 text-[15px]",
        pill ? "rounded-full" : "rounded-[8px]",

        // Default primary = ink (Apple-quiet)
        (v === "primary" || v === "secondary") && [
          "bg-ink text-paper",
          "hover:bg-[color:var(--ink-2)]",
        ],
        // Accent reserved for special saffron CTA
        v === "accent" && [
          "bg-[color:var(--accent)] text-white",
          "hover:bg-[color:var(--accent-ink)]",
        ],
        v === "ghost" && [
          "bg-transparent text-ink border-[color:var(--line)]",
          "hover:bg-paper-2 hover:border-[color:var(--line-2)]",
        ],
        v === "danger" && [
          "bg-[color:var(--danger)] text-white",
          "hover:brightness-105",
        ],

        block && "w-full",
        dashed && "border-dashed",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
