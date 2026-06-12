import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { StarIcon, ArrowRightIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   BidCard — Swiggy-style: soft white surface, rank pill,
   supplier avatar + rating chip, big price, "BEST" callout
   ═══════════════════════════════════════════════════════ */

export interface BidCardProps {
  rank: number;
  supplier: string;
  initials: string;
  avatarColor?: string;
  rating: number;
  price: string;
  description: string;
  isBest?: boolean;
  href?: string;
  className?: string;
}

export function BidCard({
  rank,
  supplier,
  initials,
  avatarColor,
  rating,
  price,
  description,
  isBest = false,
  href = "#",
  className,
}: BidCardProps) {
  return (
    <Link href={href} className={clsx("block", className)}>
      <div
        className={clsx(
          "bg-paper rounded-[16px] p-3.5 flex gap-3 fms-press transition-all",
          "shadow-[var(--shadow-card)]",
          isBest && "ring-2 ring-[color:var(--accent)]/40"
        )}
      >
        {/* Rank pill */}
        <div
          className={clsx(
            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
            "text-[13px] font-extrabold",
            isBest ? "bg-[color:var(--accent)] text-white" : "bg-paper-2 text-ink"
          )}
        >
          {rank}
        </div>

        {/* Supplier info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Avatar initials={initials} size="sm" color={avatarColor} />
            <div className="min-w-0">
              <div className="text-[13px] font-bold leading-tight truncate text-ink">{supplier}</div>
              <div className="mt-0.5">
                <Chip variant="rating" size="sm">
                  <StarIcon size={9} className="fill-current" /> {rating.toFixed(1)}
                </Chip>
              </div>
            </div>
          </div>
          <div className="text-[12px] text-ink-2 mt-2 leading-snug line-clamp-2">{description}</div>
        </div>

        {/* Price + best badge */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <span className="display text-[16px] text-ink leading-none">{price}</span>
          <div className="flex flex-col items-end gap-1">
            {isBest && <Chip variant="solid" size="sm">BEST</Chip>}
            <ArrowRightIcon size={14} className="text-ink-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
