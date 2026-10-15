"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { ShopShell } from "@/components/shop/AppShell";
import { ProductTile } from "@/components/shop/ProductTile";
import { CATEGORIES, EmptyState, Skel } from "@/components/shop/ui";
import { VehiclePicker } from "@/components/shop/VehiclePicker";
import { useVehicleStore, vehicleShortLabel } from "@/lib/vehicle-store";
import { shopApi, PART_TYPE_LABEL, type PartType, type ShopProduct } from "@/lib/api/v2";

const SORTS = [
  { v: "popular", l: "Relevance" },
  { v: "price_asc", l: "Price: low to high" },
  { v: "price_desc", l: "Price: high to low" },
  { v: "newest", l: "Newest" },
];

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const vehicle = useVehicleStore((s) => s.selected);
  const select = useVehicleStore((s) => s.select);
  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const partType = sp.get("partType") ?? "";
  const sort = sp.get("sort") ?? "popular";
  // A make/model in the URL wins (shareable links); else the selected vehicle.
  const make = sp.get("make") ?? vehicle?.make ?? "";
  const model = sp.get("model") ?? (sp.get("make") ? "" : vehicle?.model ?? "");

  const [picker, setPicker] = useState(false);
  const key = JSON.stringify([q, category, partType, make, model, sort]);
  const [res, setRes] = useState<{ key: string; items: ShopProduct[]; total: number } | null>(null);
  const loading = res?.key !== key;
  const items = res?.items ?? [];
  const total = res?.total ?? 0;

  useEffect(() => {
    const [q, category, partType, make, model, sort] = JSON.parse(key) as string[];
    shopApi
      .list({ search: q || undefined, category: category || undefined, partType: partType || undefined, make: make || undefined, model: model || undefined, sort, limit: 48 })
      .then((r) => setRes({ key, items: r.products, total: r.pagination.total }))
      .catch(() => setRes({ key, items: [], total: 0 }));
  }, [key]);

  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp.toString());
    if (v) n.set(k, v); else n.delete(k);
    router.push(`/search?${n.toString()}`);
  };
  const clearVehicle = () => {
    const n = new URLSearchParams(sp.toString());
    n.delete("make"); n.delete("model");
    select(null);
    router.push(`/search?${n.toString()}`);
  };

  const heading = q ? `Results for “${q}”` : category ? (CATEGORIES.find((c) => c.key === category)?.label ?? category) : partType ? PART_TYPE_LABEL[partType as PartType] : "All parts";

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-extrabold tracking-[-0.025em]">{heading}</h1>
          <p className="text-[14px] text-ink-3 font-semibold mt-1">{loading ? "Searching…" : `${total} part${total === 1 ? "" : "s"} from verified sellers`}</p>
        </div>
        <div className="flex items-center gap-2">
          {make ? (
            <span className="inline-flex items-center gap-2 h-10 pl-4 pr-1.5 rounded-full bg-[color:var(--success-wash)] text-[color:var(--success)] text-[13.5px] font-extrabold">
              Fits {model ? `${make} ${model}` : make}{vehicle && !sp.get("make") && vehicle.year ? ` ${vehicle.year}` : ""}
              <button onClick={clearVehicle} aria-label="Clear vehicle filter" className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center">×</button>
            </span>
          ) : (
            <button onClick={() => setPicker(true)} className="h-10 px-4 rounded-full border-2 border-dashed border-[color:var(--accent)] text-[color:var(--accent)] text-[13.5px] font-extrabold">+ Filter by your vehicle</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex gap-2 overflow-x-auto scroll-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="chip pr-8 appearance-none cursor-pointer" aria-label="Sort">
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        {(Object.keys(PART_TYPE_LABEL) as PartType[]).map((t) => (
          <button key={t} className="chip" data-on={partType === t} onClick={() => setParam("partType", partType === t ? null : t)}>{PART_TYPE_LABEL[t]}</button>
        ))}
        <span className="w-px bg-line mx-1 flex-shrink-0" />
        {CATEGORIES.map((c) => (
          <button key={c.key} className="chip" data-on={category === c.key} onClick={() => setParam("category", category === c.key ? null : c.key)}>
            <c.Icon size={15} /> {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => <div key={i}><Skel className="aspect-[4/3]" /><Skel className="h-4 mt-4 w-3/4" /><Skel className="h-4 mt-2 w-1/2" /></div>)}
          </div>
        ) : items.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-5 gap-y-10">
            {items.map((p) => <ProductTile key={p.id} p={p} />)}
          </div>
        ) : (
          <EmptyState
            title="Not listed yet, but we can find it"
            body={`Post a request${model ? ` for your ${make} ${model}` : ""} and verified sellers will send you quotes, usually within minutes.`}
            action={<Link href={`/buyer/requests/new?part=${encodeURIComponent(q)}`} className="h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Get quotes for this part</Link>}
          />
        )}
      </div>

      {!loading && items.length > 0 && (
        <div className="mt-14 rounded-[20px] bg-[color:var(--info-wash)] p-5 md:p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[17px] font-extrabold">Didn’t find the exact part?</div>
            <div className="text-[14px] text-ink-2 mt-0.5">Snap a photo or type the part. Sellers across India will quote.</div>
          </div>
          <Link href={`/buyer/requests/new?part=${encodeURIComponent(q)}`} className={clsx("h-11 px-5 inline-flex items-center rounded-[12px] bg-ink text-paper text-[14px] font-extrabold")}>Get quotes</Link>
        </div>
      )}
      <VehiclePicker open={picker} onClose={() => setPicker(false)} />
      {vehicle && !sp.get("make") && <span className="sr-only">Showing parts for {vehicleShortLabel(vehicle)}</span>}
    </div>
  );
}

export default function SearchPage() {
  return (
    <ShopShell>
      <Suspense>
        <SearchInner />
      </Suspense>
    </ShopShell>
  );
}
