import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { StarIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";

/* ═══════════════════════════════════════════════════════
   ProductCard — 2-col grid item from Buyer Home (Screen 02)
   Image, name, vehicle fit, price, rating
   ═══════════════════════════════════════════════════════ */

export interface ProductCardProps {
  id?: string;
  name: string;
  price: string;
  vehicle: string;
  rating: number;
  image?: string;
  imageLabel?: string;
  className?: string;
}

export function ProductCard({
  id = "1",
  name,
  price,
  vehicle,
  rating,
  image,
  imageLabel,
  className,
}: ProductCardProps) {
  return (
    <Link href={`/buyer/product/${id}`}>
      <Card className={clsx("!p-2.5 cursor-pointer hover:border-accent/40 transition-colors group", className)}>
        {/* Image */}
        <div
          className={clsx(
            "aspect-square rounded-[10px] mb-2.5 overflow-hidden relative",
            !image && "bg-gradient-to-br from-paper-2 to-paper-3"
          )}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
              {/* Placeholder pattern */}
              <div
                className="absolute inset-0"
                style={{
                  background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                }}
              />
              {imageLabel && (
                <span className="absolute left-2 bottom-2 mono text-[9px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-1.5 py-0.5 rounded border border-line">
                  {imageLabel}
                </span>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="text-[13px] font-medium leading-[1.25]">{name}</div>
        <div className="text-[11px] text-ink-3 mt-0.5">{vehicle}</div>

        {/* Price + Rating */}
        <div className="flex items-center justify-between mt-2">
          <div className="mono text-xs font-semibold">{price}</div>
          <div className="flex items-center gap-1 text-ink-3 text-[11px]">
            <StarIcon size={10} className="text-ink" />
            {rating}
          </div>
        </div>
      </Card>
    </Link>
  );
}
