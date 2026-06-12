import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { StarIcon, PackageIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   ProductCard — editorial premium.
   Portrait image, hairline border, refined typography,
   minimal overlays. Rating chip is restrained.
   ═══════════════════════════════════════════════════════ */

export interface ProductCardProps {
  id?: string;
  name: string;
  price: string;
  vehicle: string;
  rating: number;
  image?: string;
  imageLabel?: string;
  inStock?: boolean;
  discount?: number;
  className?: string;
  href?: string;
}

export function ProductCard({
  id = "1",
  name,
  price,
  vehicle,
  rating,
  image,
  imageLabel,
  inStock = true,
  discount,
  className,
  href,
}: ProductCardProps) {
  const link = href || `/buyer/product/${id}`;

  return (
    <Link href={link} className={clsx("block group", className)}>
      <div className="bg-paper border border-[color:var(--line)] rounded-[10px] overflow-hidden fms-press hover:border-[color:var(--accent)]/40 transition-colors">
        {/* Portrait image */}
        <div className="relative aspect-[4/5] bg-paper-2 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageIcon size={28} className="text-ink-3 opacity-30" />
            </div>
          )}

          {/* Discount badge — small corner */}
          {discount != null && discount > 0 && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[color:var(--discount)] text-white text-[10px] font-bold tracking-tight tabular">
                −{discount}%
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-paper/80 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-ink text-paper text-[10px] font-bold tracking-wider uppercase">
                Out of stock
              </span>
            </div>
          )}

          {/* Hairline bottom divider */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--line)]" />
        </div>

        {/* Info */}
        <div className="p-3.5">
          {imageLabel && (
            <div className="eyebrow !text-[10px] mb-1 truncate">{imageLabel}</div>
          )}

          <h3 className="serif text-[15px] leading-tight text-ink line-clamp-2 min-h-[36px] tracking-tight">
            {name}
          </h3>

          <div className="text-[11.5px] text-ink-3 mt-1 truncate">{vehicle}</div>

          {/* Price + rating row */}
          <div className="mt-3 pt-3 border-t border-[color:var(--line)] flex items-center justify-between gap-2">
            <span className="serif text-[16px] text-ink tabular leading-none">
              {price}
            </span>
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink tabular">
              <StarIcon size={11} className="text-[color:var(--accent)] fill-current" />
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
