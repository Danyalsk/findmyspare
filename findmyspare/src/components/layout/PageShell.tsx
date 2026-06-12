import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   PageShell — scrollable page content wrapper
   Centers content + responsive horizontal padding
   ═══════════════════════════════════════════════════════ */

export interface PageShellProps {
  children: React.ReactNode;
  /** Apply horizontal padding (default: true) */
  padded?: boolean;
  /** Constrain max width on desktop (default: true) */
  constrained?: boolean;
  /** Additional class names */
  className?: string;
}

export function PageShell({
  children,
  padded = true,
  constrained = true,
  className,
}: PageShellProps) {
  return (
    <div
      className={clsx(
        "flex-1 overflow-y-auto overflow-x-hidden scroll-hidden",
        className
      )}
    >
      <div
        className={clsx(
          constrained && "max-w-screen-xl mx-auto",
          padded && "px-5 md:px-8 lg:px-10"
        )}
      >
        {children}
      </div>
    </div>
  );
}
