import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   SupplierKpiCard — soft white tile, display number,
   colored sparkline (accent), uppercase eyebrow label.
   ═══════════════════════════════════════════════════════ */

export interface SupplierKpiCardProps {
  label: string;
  value: string;
  sublabel: string;
  trend?: "up" | "down" | "flat";
  sparkline?: number[];
  className?: string;
}

export function SupplierKpiCard({
  label,
  value,
  sublabel,
  trend = "up",
  sparkline,
  className,
}: SupplierKpiCardProps) {
  let polyline = "";
  if (sparkline && sparkline.length > 1) {
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    const w = 80;
    const h = 28;
    polyline = sparkline
      .map(
        (v, i) =>
          `${(i / (sparkline.length - 1)) * w},${h - ((v - min) / range) * h}`
      )
      .join(" ");
  }

  const stroke =
    trend === "down" ? "var(--danger)" : trend === "flat" ? "var(--ink-3)" : "var(--accent)";

  return (
    <div
      className={clsx(
        "bg-paper rounded-[16px] p-3.5 shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="text-[10px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
        {label}
      </div>
      <div className="flex items-end justify-between mt-2 gap-2">
        <div className="display text-[28px] leading-none text-ink">{value}</div>
        {sparkline && sparkline.length > 1 && (
          <svg width="80" height="28" className="flex-shrink-0 mb-0.5" aria-hidden>
            <polyline
              points={polyline}
              fill="none"
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="text-[11px] text-ink-3 mt-1.5 font-semibold">{sublabel}</div>
    </div>
  );
}
