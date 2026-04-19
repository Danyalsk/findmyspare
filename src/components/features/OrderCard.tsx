import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   OrderCard — order list item from Screen 08
   Thumbnail, order ID, status chip, part name, supplier
   ═══════════════════════════════════════════════════════ */

export interface OrderCardProps {
  orderId: string;
  name: string;
  status: string;
  statusVariant: "ok" | "warn" | "danger" | "default";
  supplier: string;
  date: string;
  href: string;
  imageLabel?: string;
  className?: string;
}

export function OrderCard({
  orderId,
  name,
  status,
  statusVariant,
  supplier,
  date,
  href,
  imageLabel,
  className,
}: OrderCardProps) {
  return (
    <Link href={href}>
      <Card className={clsx("!p-3 flex gap-3 cursor-pointer hover:border-accent/40 transition-colors group", className)}>
        {/* Thumbnail */}
        <div
          className="w-[60px] h-[60px] rounded-[10px] flex-shrink-0 relative overflow-hidden"
          style={{
            background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
          }}
        >
          {imageLabel && (
            <span className="absolute left-1 bottom-1 mono text-[7px] text-ink-3 uppercase tracking-[0.06em] bg-paper px-1 py-0.5 rounded border border-line">
              {imageLabel}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="mono text-[10px] text-ink-3 tracking-[0.08em]">{orderId}</div>
            <Chip variant={statusVariant}>{status}</Chip>
          </div>
          <div className="text-[14px] font-medium leading-[1.25] mt-0.5">{name}</div>
          <div className="text-[11px] text-ink-3 mt-0.5 flex items-center justify-between">
            <span>{supplier}</span>
            <span>{date}</span>
          </div>
        </div>

        <ArrowRightIcon size={16} className="text-ink-3 self-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </Link>
  );
}
