import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon, PackageIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   OrderCard — Swiggy-style soft card: thumb, status chip,
   part name, supplier + date, chevron action.
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
  image?: string;
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
  image,
  className,
}: OrderCardProps) {
  return (
    <Link href={href} className={clsx("block", className)}>
      <div className="bg-paper rounded-[16px] p-3.5 flex gap-3.5 fms-press shadow-[var(--shadow-card)] group">
        {/* Thumbnail */}
        <div
          className="w-[64px] h-[64px] rounded-[12px] flex-shrink-0 relative overflow-hidden bg-paper-3 flex items-center justify-center"
          style={
            image
              ? undefined
              : {
                  background:
                    "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                }
          }
        >
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <PackageIcon size={22} className="text-ink-3 opacity-50" />
          )}
          {imageLabel && (
            <span className="absolute left-1 bottom-1 text-[7px] font-bold tracking-wider uppercase bg-paper px-1 py-0.5 rounded-full text-ink-2">
              {imageLabel}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="text-[10px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase truncate">
              {orderId}
            </div>
            <Chip variant={statusVariant} size="sm" dot>
              {status}
            </Chip>
          </div>
          <div className="display text-[14px] text-ink leading-tight mt-1 line-clamp-1">{name}</div>
          <div className="text-[11px] text-ink-3 mt-1 flex items-center justify-between gap-2">
            <span className="truncate">{supplier}</span>
            <span className="font-semibold flex-shrink-0">{date}</span>
          </div>
        </div>

        <ArrowRightIcon
          size={16}
          className="text-ink-3 self-center flex-shrink-0 group-hover:text-[color:var(--accent)] group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </Link>
  );
}
