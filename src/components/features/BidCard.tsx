import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { StarIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   BidCard — supplier bid row from Screen 06 (Live Bids)
   Rank number, supplier name, rating, price, description
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
    <Link href={href}>
      <Card
        className={clsx(
          "!p-3 flex gap-3 cursor-pointer transition-colors",
          isBest
            ? "border-[1.5px] !border-ink hover:bg-paper-2"
            : "hover:border-accent/40",
          className
        )}
      >
        {/* Rank */}
        <div
          className={clsx(
            "w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0",
            "mono text-xs font-semibold",
            isBest ? "bg-ink text-paper" : "bg-paper-2 text-ink"
          )}
        >
          {rank}
        </div>

        {/* Supplier info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Avatar initials={initials} size="sm" color={avatarColor} />
            <div className="min-w-0">
              <div className="text-[13px] font-medium leading-[1.2] truncate">{supplier}</div>
              <div className="text-[10px] text-ink-3 flex items-center gap-1">
                <StarIcon size={10} className="text-ink" /> {rating}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-ink-3 mt-1.5 leading-[1.3]">{description}</div>
        </div>

        {/* Price + badge */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="mono text-[15px] font-semibold">{price}</div>
          {isBest && <Chip variant="ok">BEST</Chip>}
        </div>
      </Card>
    </Link>
  );
}
