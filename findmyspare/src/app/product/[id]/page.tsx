"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShopShell } from "@/components/shop/AppShell";
import { AddButton } from "@/components/shop/ProductTile";
import { PartThumb, PartTypeBadge, RatingPill, FitBadge, VerifiedBadge, SectionTitle, Skel, EmptyState } from "@/components/shop/ui";
import { VehiclePicker } from "@/components/shop/VehiclePicker";
import { useVehicleStore, fitsVehicle, vehicleShortLabel } from "@/lib/vehicle-store";
import { shopApi, inr, discountPct, type ProductDetailV2, type ShopProduct } from "@/lib/api/v2";
import { formatDistanceToNowStrict } from "date-fns";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const vehicle = useVehicleStore((s) => s.selected);
  const [loaded, setD] = useState<ProductDetailV2 | null>(null);
  // Ignore a previous product's data while the next one loads.
  const d = loaded && loaded.product.id === id ? loaded : null;
  const [offers, setOffers] = useState<ShopProduct[]>([]);
  const [error, setError] = useState("");
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    shopApi.get(id).then(async (r) => {
      setD(r);
      // Other sellers offering the same part for the same vehicle → price comparison.
      const fit = r.product.compatibleVehicles?.[0];
      const alt = await shopApi.list({ search: r.product.name, make: fit?.make, model: fit?.model, limit: 12 }).catch(() => null);
      setOffers((alt?.products ?? []).filter((p) => p.id !== r.product.id));
    }).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ShopShell><EmptyState title="Part not found" body={error} action={<Link href="/search" className="font-extrabold text-[color:var(--accent)]">Browse parts</Link>} /></ShopShell>;
  if (!d) return <ShopShell><div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 grid md:grid-cols-2 gap-8"><Skel className="aspect-square" /><div><Skel className="h-8 w-3/4" /><Skel className="h-5 w-1/2 mt-3" /><Skel className="h-24 mt-6" /></div></div></ShopShell>;

  const p = d.product;
  const fits = fitsVehicle(p.compatibleVehicles, vehicle, d.confirmedFits.filter((f) => vehicle && f.make_name === vehicle.make && f.model_name === vehicle.model).length);
  const off = discountPct(p.price, p.mrp);
  const specs = Object.entries(p.specifications ?? {});

  return (
    <ShopShell>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 pb-28 md:pb-10">
        <nav className="text-[13px] font-semibold text-ink-3 mb-4">
          <Link href="/search" className="hover:text-ink">Parts</Link> / {p.category && <Link href={`/search?category=${encodeURIComponent(p.category)}`} className="hover:text-ink">{p.category}</Link>}
        </nav>
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-8 md:gap-12">
          <div>
            <PartThumb category={p.category} brand={p.brand} size="lg" className="aspect-square rounded-[24px]" />
            {d.confirmedFits.length > 0 && (
              <div className="mt-5 card-flat p-4">
                <div className="text-[13px] font-extrabold text-[color:var(--success)] flex items-center gap-1.5">✓ Confirmed by buyers to fit</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {d.confirmedFits.map((f) => <span key={f.make_name + f.model_name} className="chip !h-8 !text-[12.5px]">{f.make_name} {f.model_name} <b className="text-[color:var(--success)]">×{f.n}</b></span>)}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <PartTypeBadge type={p.partType} />
              {p.brand && <span className="text-[13px] font-extrabold text-ink-2">{p.brand}</span>}
              {p.partNumber && <span className="mono text-[12px] text-ink-3">#{p.partNumber}</span>}
            </div>
            <h1 className="mt-2 text-[28px] md:text-[34px] font-extrabold tracking-[-0.025em] leading-tight">{p.name}</h1>
            <div className="mt-2"><RatingPill rating={d.rating} count={d.reviewCount} /></div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="price text-[30px]">{inr(p.price)}</span>
              {off > 0 && <><span className="strike text-[17px]">MRP {inr(p.mrp)}</span><span className="text-[15px] font-extrabold text-[color:var(--success)]">{off}% off</span></>}
            </div>
            <div className="text-[12.5px] text-ink-3 font-semibold">Inclusive of GST · {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}</div>

            {/* Fit check */}
            <div className="mt-5 rounded-[16px] border-2 p-4 flex items-center justify-between gap-3" style={{ borderColor: fits ? "var(--success)" : fits === false ? "var(--amber)" : "var(--line)", background: fits ? "var(--success-wash)" : fits === false ? "var(--amber-wash)" : "var(--paper-2)" }}>
              {vehicle ? <FitBadge fits={fits} label={`${vehicle.make} ${vehicleShortLabel(vehicle)}`} className="!text-[14px]" /> : <span className="text-[14px] font-bold text-ink-2">Check if it fits your vehicle</span>}
              <button onClick={() => setPicker(true)} className="text-[13px] font-extrabold text-[color:var(--accent)] whitespace-nowrap">{vehicle ? "Change" : "Select vehicle"}</button>
            </div>
            <div className="mt-3 text-[13px] text-ink-3"><b className="text-ink-2">Listed for:</b> {(p.compatibleVehicles ?? []).map((v) => `${v.make} ${v.model}${v.year ? ` (${v.year})` : ""}`).join(" · ") || "No fitment listed. Ask the seller."}</div>

            <div className="hidden md:flex mt-6 items-center gap-3">
              <AddButton p={p} size="lg" className="!w-44" />
              <Link href="/buyer/cart" className="h-12 px-6 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white text-[15px] font-extrabold fms-press">Go to cart</Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {[["Fit or free return", "If it doesn't fit your selected vehicle"], ["Escrow protected", "Seller paid after delivery"], [p.warrantyInfo && p.warrantyInfo !== "—" ? `Warranty: ${p.warrantyInfo}` : "Seller warranty", "Tracked in your Passport"]].map(([t, s]) => (
                <div key={t} className="rounded-[14px] bg-paper-2 p-3"><div className="text-[12.5px] font-extrabold">{t}</div><div className="text-[11.5px] text-ink-3 mt-0.5 leading-snug">{s}</div></div>
              ))}
            </div>

            {/* Seller */}
            <div className="mt-6 card-flat p-4 flex items-center gap-4">
              <span className="w-12 h-12 rounded-[14px] bg-ink text-paper flex items-center justify-center text-[18px] font-extrabold">{(p.supplierBusinessName ?? "S").slice(0, 1)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><span className="text-[15px] font-extrabold">{p.supplierBusinessName ?? p.supplierName}</span>{p.supplierVerified && <VerifiedBadge label="GST verified" />}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold mt-0.5">
                  {p.supplierCity ?? "India"} · {d.supplierOrders} orders delivered · on FMS {formatDistanceToNowStrict(new Date(p.supplierSince))}
                </div>
              </div>
              <RatingPill rating={d.supplierRating} count={d.supplierReviewCount} />
            </div>
          </div>
        </div>

        {offers.length > 0 && (
          <section className="mt-12">
            <SectionTitle title={`Compare ${offers.length} other offer${offers.length > 1 ? "s" : ""}`} sub="Same part from other verified sellers" />
            <div className="card-flat divide-y divide-line">
              {offers.map((o) => (
                <Link key={o.id} href={`/product/${o.id}`} className="flex items-center gap-4 p-4 hover:bg-paper-2">
                  <PartThumb category={o.category} size="sm" className="w-14 h-14 rounded-[12px] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><span className="text-[14.5px] font-extrabold">{o.brand}</span><PartTypeBadge type={o.partType} /></div>
                    <div className="text-[12.5px] text-ink-3 font-semibold">{o.supplierBusinessName} · {o.supplierCity}</div>
                  </div>
                  <RatingPill rating={o.rating} />
                  <span className="price text-[16px] w-24 text-right">{inr(o.price)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 grid md:grid-cols-2 gap-8">
          <div>
            <SectionTitle title="Details" />
            {p.description && <p className="text-[15px] text-ink-2 leading-relaxed">{p.description}</p>}
            {specs.length > 0 && (
              <dl className="mt-4 card-flat divide-y divide-line">
                {specs.map(([k, v]) => <div key={k} className="flex justify-between px-4 py-3 text-[14px]"><dt className="text-ink-3 font-semibold">{k}</dt><dd className="font-bold">{v}</dd></div>)}
              </dl>
            )}
          </div>
          <div>
            <SectionTitle title="Reviews" sub={d.reviewCount ? `${d.reviewCount} from verified buyers` : undefined} />
            {d.reviews.length ? (
              <ul className="space-y-3">
                {d.reviews.map((r, i) => (
                  <li key={i} className="card-flat p-4">
                    <div className="flex items-center justify-between gap-2"><RatingPill rating={r.rating} /><span className="text-[12px] text-ink-3">{formatDistanceToNowStrict(new Date(r.created_at))} ago</span></div>
                    {r.comment && <p className="text-[14px] text-ink-2 mt-2">{r.comment}</p>}
                    <div className="text-[12.5px] text-ink-3 font-semibold mt-2">
                      {r.buyer_name ?? "Buyer"}{r.vehicle ? ` · ${r.vehicle.make} ${r.vehicle.model}` : ""}
                      {r.fit_confirmed && <span className="text-[color:var(--success)] font-extrabold"> · ✓ Fitted perfectly</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-[14px] text-ink-3">No reviews yet. Buyers can review after delivery.</p>}
          </div>
        </section>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="md:hidden fixed inset-x-0 bottom-[62px] z-[96] bg-paper border-t border-line px-4 py-3 flex items-center justify-between shadow-[var(--shadow-sticky)]">
        <div><div className="price text-[18px]">{inr(p.price)}</div>{off > 0 && <div className="text-[12px] font-bold text-[color:var(--success)]">{off}% off MRP</div>}</div>
        <AddButton p={p} size="lg" />
      </div>
      <VehiclePicker open={picker} onClose={() => setPicker(false)} />
    </ShopShell>
  );
}
