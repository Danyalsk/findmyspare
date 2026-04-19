import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Input — search/text input matching prototype style
   Supports left and right icon slots
   ═══════════════════════════════════════════════════════ */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: "md" | "lg";
}

export function Input({
  leftIcon,
  rightIcon,
  inputSize = "md",
  className,
  ...props
}: InputProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2.5",
        "rounded-[14px] bg-paper-2 border border-line",
        "transition-all",
        "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",

        inputSize === "md" && "h-[52px] px-3.5",
        inputSize === "lg" && "h-[56px] px-4",

        className
      )}
    >
      {leftIcon && (
        <span className="text-ink-3 flex-shrink-0">{leftIcon}</span>
      )}
      <input
        className={clsx(
          "flex-1 min-w-0 bg-transparent border-0 outline-none",
          "text-sm text-ink placeholder:text-ink-3",
          "font-normal"
        )}
        {...props}
      />
      {rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </div>
  );
}
