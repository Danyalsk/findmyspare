"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useCartStore } from "@/lib/cart-store";
import { useVehicleStore, fitsVehicle, vehicleShortLabel } from "@/lib/vehicle-store";
import { inr, discountPct, type ShopProduct } from "@/lib/api/v2";
import { PartThumb, PartTypeBadge, RatingPill, FitBadge } from "./ui";
import { toast } from "@/lib/toast";

/** Swiggy-style ADD → stepper. */
export function AddButton({ p, className, size = "md" }: { p: ShopProduct; className?: string; size?: "md" | "lg" }) {
  const item = useCartStore((s) => s.items.find((i) => i.id === p.id));
  const add = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.updateQty);
  const out = p.stockQuantity <= 0;
  const h = size === "lg" ? "h-12 text-[15px]" : "h-9 text-[13.5px]";

  if (out) return <span className={clsx("inline-flex items-center justify-center px-4 rounded-[10px] bg-paper-2 text-ink-3 font-bold", h, className)}>Out of stock</span>;

  if (!item) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          add({
            id: p.id, productId: p.id, name: p.name, vehicle: (p.compatibleVehicles ?? []).map((f) => f.model).slice(0, 2).join(", "),
            quantity: 1, unitPrice: parseFloat(p.price), supplierId: p.supplierId, supplierName: p.supplierBusinessName || p.supplierName || "Seller",
            brand: p.brand, partType: p.partType, mrp: p.mrp ? parseFloat(p.mrp) : null, category: p.category, stock: p.stockQuantity,
          });
          toast.success(`Added ${p.brand ? p.brand + " " : ""}${p.name}`);
        }}
        className={clsx("fms-press inline-flex items-center justify-center px-5 rounded-[10px] bg-paper border border-line-2 shadow-[var(--shadow-card)] text-[color:var(--success)] font-extrabold tracking-wide uppercase hover:bg-[color:var(--success-wash)]", h, className)}
      >
        Add
      </button>
    );
  }
  return (
    <div className={clsx("inline-flex items-center justify-between rounded-[10px] bg-[color:var(--success)] text-white font-extrabold shadow-[var(--shadow-card)] overflow-hidden", h, size === "lg" ? "w-36" : "w-[96px]", className)}>
      <button type="button" aria-label="Decrease" onClick={(e) => { e.preventDefault(); setQty(p.id, item.quantity - 1); }} className="w-9 h-full hover:bg-black/10 text-[18px]">−</button>
      <span aria-live="polite">{item.quantity}</span>
      <button type="button" aria-label="Increase" onClick={(e) => { e.preventDefault(); if (item.quantity < p.stockQuantity) setQty(p.id, item.quantity + 1); }} className="w-9 h-full hover:bg-black/10 text-[18px]">+</button>
    </div>
  );
}

export function ProductTile({ p, layout = "grid" }: { p: ShopProduct; layout?: "grid" | "row" }) {
  const vehicle = useVehicleStore((s) => s.selected);
  const fits = fitsVehicle(p.compatibleVehicles, vehicle, p.fitConfirmations);
  const off = discountPct(p.price, p.mrp);
  const isVehiclePart = !p.industrySlug || p.industrySlug === "automotive";

  if (layout === "row") {
    return (
      <Link href={`/product/${p.id}`} className="flex gap-4 py-5 border-b border-line last:border-0 group">
        <div className="flex-1 min-w-0">
          <PartTypeBadge type={p.partType} />
          <div className="mt-1.5 text-[16px] font-extrabold tracking-tight text-ink leading-snug group-hover:text-[color:var(--accent)]">
            {p.brand && <span>{p.brand} </span>}{p.name}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="price text-[16px]">{inr(p.price)}</span>
            {off > 0 && <><span className="strike text-[13px]">{inr(p.mrp)}</span><span className="text-[12.5px] font-bold text-[color:var(--success)]">{off}% off</span></>}
          </div>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <RatingPill rating={p.rating} count={p.reviewCount} />
            <span className="text-[12.5px] text-ink-3 font-semibold">{p.supplierBusinessName}{p.supplierCity ? ` · ${p.supplierCity}` : ""}</span>
          </div>
          {vehicle && isVehiclePart && <FitBadge fits={fits} label={vehicleShortLabel(vehicle)} className="mt-2" />}
        </div>
        <div className="relative w-[132px] flex-shrink-0">
          <PartThumb category={p.category} industry={p.industrySlug} brand={null} className="w-[132px] h-[120px] rounded-[16px]" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2"><AddButton p={p} /></div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${p.id}`} className="group block">
      <div className="relative">
        <PartThumb category={p.category} industry={p.industrySlug} brand={p.brand} className="aspect-[4/3] rounded-[18px]" />
        {off > 0 && (
          <span className="absolute left-0 bottom-3 pl-2.5 pr-3 h-6 inline-flex items-center rounded-r-full bg-[color:var(--success)] text-white text-[11.5px] font-extrabold">
            {off}% OFF
          </span>
        )}
        <div className="absolute right-3 -bottom-4"><AddButton p={p} /></div>
      </div>
      <div className="pt-5 px-0.5">
        <div className="text-[15px] font-extrabold tracking-tight text-ink leading-snug line-clamp-2 group-hover:text-[color:var(--accent)]">{p.name}</div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <RatingPill rating={p.rating} count={p.reviewCount} />
          <span className="text-ink-4">•</span>
          <PartTypeBadge type={p.partType} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="price text-[16px]">{inr(p.price)}</span>
          {off > 0 && <span className="strike text-[13px]">{inr(p.mrp)}</span>}
        </div>
        <div className="text-[12.5px] text-ink-3 font-semibold truncate mt-0.5">
          {p.supplierBusinessName}{p.supplierCity ? ` · ${p.supplierCity}` : ""}
        </div>
        {vehicle && isVehiclePart && <FitBadge fits={fits} label={vehicleShortLabel(vehicle)} className="mt-1.5" />}
        {!!p.moq && p.moq > 1 && <div className="text-[12px] font-bold text-[color:var(--info)] mt-1">Min. order {p.moq}</div>}
      </div>
    </Link>
  );
}
