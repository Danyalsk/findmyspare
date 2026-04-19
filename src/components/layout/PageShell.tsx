import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   PageShell — scrollable page content wrapper
   Provides consistent scroll behavior and padding
   ═══════════════════════════════════════════════════════ */

export interface PageShellProps {
  children: React.ReactNode;
  /** Apply horizontal padding (default: true) */
  padded?: boolean;
  /** Additional class names */
  className?: string;
}

export function PageShell({
  children,
  padded = true,
  className,
}: PageShellProps) {
  return (
    <div
      className={clsx(
        "flex-1 overflow-y-auto overflow-x-hidden scroll-hidden",
        padded && "px-5",
        className
      )}
    >
      {children}
    </div>
  );
}
