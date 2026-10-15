"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clsx } from "clsx";
import { inr, discountPct } from "@/lib/api/v2";
import { storeApi, taxonomyApi, BUSINESS_ROLE_LABEL, type Storefront } from "@/lib/api/v3";
import { ShopShell } from "@/components/shop/AppShell";
import { EmptyState, PartThumb, RatingPill, Skel, VerifiedBadge } from "@/components/shop/ui";
import { NetIcon } from "@/components/net/NetIcon";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { toast } from "@/lib/toast";
import { BI, useApi } from "@/components/biz/kit";

function since(d: string) {
  const months = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / (30.44 * 864e5)));
  if (months < 1) return "New on FindMySpare";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} on FindMySpare`;
  const y = Math.floor(months / 12);
  return `${y} year${y === 1 ? "" : "s"} on FindMySpare`;
}

/** The shopper header redirects sellers to their console, so sellers previewing
 *  a storefront get a slim header with a way back to the Business OS. */
function Chrome({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const hydrated = useAuthStore((s) => s.isHydrated);
  const role = useAuthStore((s) => s.user?.role);
  if (mounted && hydrated && role && role !== "buyer") {
    return (
      <div className="min-h-dvh bg-paper">
        <header className="sticky top-0 z-[100] bg-paper/95 backdrop-blur-md border-b border-line">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between gap-3">
            <Link href="/" aria-label="FindMySpare home"><Logo size={24} /></Link>
            <Link href={role === "supplier" ? "/biz" : "/admin"} className="h-10 px-4 rounded-[12px] bg-paper-2 text-[13.5px] font-extrabold inline-flex items-center gap-1.5"><BI.back size={16} /> {role === "supplier" ? "Business OS" : "Admin"}</Link>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }
  return <ShopShell cartBar={false}>{children}</ShopShell>;
}

type P = Storefront["products"][number];

function ProductCard({ p }: { p: P }) {
  const off = discountPct(p.price, p.mrp);
  return (
    <Link href={`/product/${p.id}`} className="card overflow-hidden fms-press hover:shadow-[var(--shadow-lifted)] transition-shadow flex flex-col">
      <PartThumb category={p.category} brand={p.brand} className="aspect-[4/3]" />
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[13.5px] font-extrabold leading-snug line-clamp-2">{p.name}</div>
        <div className="mt-auto pt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="price text-[16px] text-[color:var(--accent)]">{inr(p.price)}</span>
          {p.mrp && off > 0 && <><span className="strike text-[12px]">{inr(p.mrp)}</span><span className="text-[11.5px] font-extrabold text-[color:var(--success)]">{off}% off</span></>}
        </div>
        {p.stockQuantity <= 0 && <div className="text-[11.5px] font-bold text-ink-4 mt-0.5">Out of stock</div>}
      </div>
    </Link>
  );
}

function StoreBody({ id }: { id: string }) {
  const r = useApi(`store:${id}`, () => storeApi.get(id));
  const tax = useApi("taxonomy", () => taxonomyApi.get());
  const [q, setQ] = useState("");
  const [ind, setInd] = useState("");

  if (r.error) return <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10"><EmptyState title="Store not found" body="This storefront doesn't exist or isn't public." action={<Link href="/search" className="font-extrabold text-[color:var(--accent)]">Browse parts</Link>} /></div>;
  if (!r.data) return <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-4"><Skel className="h-40" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }, (_, i) => <Skel key={i} className="h-56" />)}</div></div>;

  const { store, products } = r.data;
  const name = store.businessName ?? store.name ?? "Store";
  const industries = (store.industries ?? []).map((s) => tax.data?.industries.find((i) => i.slug === s) ?? { slug: s, name: s, icon: "gear", tint: "#EEF0F3", ink: "#3E434E" });
  const prodInds = Array.from(new Set(products.map((p) => p.industrySlug)));
  const ql = q.trim().toLowerCase();
  const shown = products.filter((p) => (!ind || p.industrySlug === ind) && (!ql || p.name.toLowerCase().includes(ql) || (p.brand ?? "").toLowerCase().includes(ql)));

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: `${name} on FindMySpare`, url }); return; }
      await navigator.clipboard.writeText(url);
      toast.success("Store link copied");
    } catch { /* user cancelled */ }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-5 md:py-8">
      <section className="rounded-[22px] border border-line p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-4">
        <span className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] bg-[color:var(--accent-wash)] text-[color:var(--accent)] flex items-center justify-center text-[28px] md:text-[34px] font-extrabold flex-shrink-0">{name.slice(0, 1).toUpperCase()}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[24px] md:text-[30px] font-extrabold tracking-[-0.02em] leading-tight">{name}</h1>
            {store.verified && <VerifiedBadge label="Verified seller" />}
          </div>
          <div className="text-[13.5px] text-ink-3 font-semibold mt-1 flex items-center gap-x-2 gap-y-1 flex-wrap">
            {store.city && <span>{store.city}</span>}
            <span>· {since(store.since)}</span>
            {store.delivered > 0 && <span>· {store.delivered} orders delivered</span>}
            <span className="inline-flex items-center gap-1">· <RatingPill rating={store.rating} count={store.reviews || undefined} /></span>
          </div>
          {(store.businessRoles?.length || industries.length) ? (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(store.businessRoles ?? []).map((r) => <span key={r} className="h-7 px-3 rounded-full bg-paper-2 text-[12.5px] font-bold text-ink-2 inline-flex items-center">{BUSINESS_ROLE_LABEL[r] ?? r}</span>)}
              {industries.map((i) => <span key={i.slug} className="h-7 px-2.5 rounded-full text-[12.5px] font-bold inline-flex items-center gap-1.5" style={{ background: i.tint, color: i.ink }}><NetIcon name={i.icon} size={15} />{i.name}</span>)}
            </div>
          ) : null}
        </div>
        <button onClick={share} className="h-11 px-5 rounded-[14px] bg-paper-2 font-extrabold text-[14px] inline-flex items-center justify-center gap-2 hover:bg-paper-3 flex-shrink-0"><BI.share size={18} /> Share store</button>
      </section>

      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
        <h2 className="text-[19px] font-extrabold tracking-tight flex-1">{products.length} part{products.length === 1 ? "" : "s"} listed</h2>
        {products.length > 0 && (
          <label className="h-11 md:w-[320px] rounded-[14px] bg-paper-2 border border-transparent focus-within:border-[color:var(--accent)] focus-within:bg-paper flex items-center px-3.5 gap-2.5 text-ink-3">
            <BI.search size={18} />
            <input className="flex-1 min-w-0 bg-transparent outline-none text-[14.5px] font-medium text-ink placeholder:text-ink-4" placeholder={`Search ${name}`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search this store" />
          </label>
        )}
      </div>
      {prodInds.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scroll-hidden mt-3 -mx-4 px-4 md:mx-0 md:px-0">
          <button className="chip" data-on={!ind} onClick={() => setInd("")}>All</button>
          {prodInds.map((s) => {
            const i = tax.data?.industries.find((x) => x.slug === s);
            return <button key={s} className="chip" data-on={ind === s} onClick={() => setInd(ind === s ? "" : s)}>{i && <NetIcon name={i.icon} size={16} />}{i?.name ?? s}</button>;
          })}
        </div>
      )}
      {!products.length ? (
        <EmptyState title="No parts listed yet" body="This seller hasn't put stock online yet. Check back soon." />
      ) : !shown.length ? (
        <EmptyState title="Nothing matches" body="Try another word." />
      ) : (
        <div className={clsx("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4")}>
          {shown.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

export default function StorefrontPage() {
  const { id } = useParams<{ id: string }>();
  return <Chrome><StoreBody id={id} /></Chrome>;
}
