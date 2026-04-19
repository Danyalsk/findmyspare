import React from "react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";

/* ═══════════════════════════════════════════════════════
   SupplierKpiCard — KPI stat card from Screen 10
   Big serif number, label, sub-label, optional sparkline
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
  sparkline,
  className,
}: SupplierKpiCardProps) {
  /* Build sparkline polyline points */
  let polyline = "";
  if (sparkline && sparkline.length > 1) {
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    const w = 80;
    const h = 24;
    polyline = sparkline
      .map(
        (v, i) =>
          `${(i / (sparkline.length - 1)) * w},${h - ((v - min) / range) * h}`
      )
      .join(" ");
  }

  return (
    <Card className={clsx("!p-3.5", className)}>
      <div className="mono text-[10px] text-ink-3 tracking-[0.12em] uppercase">
        {label}
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="serif text-[34px] leading-[1]">{value}</div>
        {sparkline && sparkline.length > 1 && (
          <svg width="80" height="24" className="flex-shrink-0 ml-2 mb-1">
            <polyline
              points={polyline}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="text-[11px] text-ink-3 mt-1.5">{sublabel}</div>
    </Card>
  );
}
