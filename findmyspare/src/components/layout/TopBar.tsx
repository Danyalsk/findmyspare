import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { BackIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   TopBar — Swiggy-style sticky page header.
   Soft white surface with shadow (no hairline border),
   rounded back chip, centered title, optional eyebrow.
   ═══════════════════════════════════════════════════════ */

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function TopBar({
  title,
  subtitle,
  backHref,
  rightAction,
  transparent = false,
  className,
}: TopBarProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3",
        "px-4 py-3",
        !transparent && "sticky top-0 z-40 bg-paper/95 backdrop-blur-xl shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {backHref ? (
        <Link
          href={backHref}
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            "fms-press",
            transparent
              ? "bg-white/15 backdrop-blur-xl text-white"
              : "bg-paper-2 hover:bg-paper-3 text-ink"
          )}
          aria-label="Go back"
        >
          <BackIcon size={18} />
        </Link>
      ) : (
        <div className="w-10" /> /* spacer */
      )}

      {(title || subtitle) && (
        <div className="flex-1 text-center min-w-0">
          {subtitle && (
            <div className="text-[10px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
              {subtitle}
            </div>
          )}
          {title && (
            <div className="display text-[15px] text-ink mt-0.5 truncate">
              {title}
            </div>
          )}
        </div>
      )}

      {rightAction ? (
        <div className="flex-shrink-0">{rightAction}</div>
      ) : (
        <div className="w-10" />
      )}
    </div>
  );
}
