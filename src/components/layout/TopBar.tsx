import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { BackIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   TopBar — sticky page header for inner pages
   Matches prototype nav pattern with back/title/action
   ═══════════════════════════════════════════════════════ */

export interface TopBarProps {
  /** Page title */
  title?: string;
  /** Small mono subtitle above title (e.g. "ORDER · ORD-10482") */
  subtitle?: string;
  /** Back navigation href. If omitted, no back button shown. */
  backHref?: string;
  /** Right-side action element (icon button, badge, etc.) */
  rightAction?: React.ReactNode;
  /** Transparent background (for overlay pages like scanner) */
  transparent?: boolean;
  /** Additional class names */
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
        "px-5 py-[18px]",
        !transparent && "sticky top-0 z-40",
        className
      )}
    >
      {/* Left — Back button */}
      {backHref ? (
        <Link
          href={backHref}
          className={clsx(
            "w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0",
            "transition-all active:scale-90",
            transparent
              ? "bg-white/10 backdrop-blur-xl"
              : "bg-paper-2 border border-line"
          )}
        >
          <BackIcon size={18} />
        </Link>
      ) : (
        <div className="w-9" /> /* spacer */
      )}

      {/* Center — Title */}
      {(title || subtitle) && (
        <div className="flex-1 text-center min-w-0">
          {subtitle && (
            <div className="mono text-[10px] text-ink-3 tracking-[0.12em] uppercase">
              {subtitle}
            </div>
          )}
          {title && (
            <div className="font-semibold text-sm mt-0.5 truncate">
              {title}
            </div>
          )}
        </div>
      )}

      {/* Right — Action */}
      {rightAction ? (
        <div className="flex-shrink-0">{rightAction}</div>
      ) : (
        <div className="w-9" /> /* spacer for centering */
      )}
    </div>
  );
}
