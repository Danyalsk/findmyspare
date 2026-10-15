import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Button — v2 brand. Primary = Spark Vermilion (the ONE
   loud action on a screen). Secondary = ink. Ghost = outline.
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
        "font-bold cursor-pointer fms-press",
        "border border-transparent tracking-tight",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-paper",

        size === "sm" && "h-9 px-4 text-[13px]",
        size === "md" && "h-11 px-5 text-[14.5px]",
        size === "lg" && "h-[52px] px-7 text-[16px]",
        pill ? "rounded-full" : "rounded-[12px]",

        // Secondary = ink
        v === "secondary" && [
          "bg-ink text-paper",
          "hover:bg-[color:var(--ink-2)]",
        ],
        // Primary + accent = brand vermilion
        (v === "primary" || v === "accent") && [
          "bg-[color:var(--accent)] text-white",
          "hover:bg-[color:var(--accent-ink)]",
        ],
        v === "ghost" && [
          "bg-paper text-ink border-[color:var(--line-2)]",
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
