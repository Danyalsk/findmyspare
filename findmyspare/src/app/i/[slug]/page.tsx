"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ShopShell } from "@/components/shop/AppShell";
import { ProductTile } from "@/components/shop/ProductTile";
import { EmptyState, SectionTitle, Skel } from "@/components/shop/ui";
import { IconTile, NetIcon } from "@/components/net/NetIcon";
import { useTaxonomy } from "@/components/net/useTaxonomy";
import { marketApi, type NetProduct } from "@/lib/api/v3";

function IndustryInner() {
  const { slug } = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const industries = useTaxonomy();
  const ind = industries?.find((i) => i.slug === slug);
  const type = sp.get("type") ?? "";
  const category = sp.get("category") ?? "";
  const brand = sp.get("brand") ?? "";
  const mt = ind?.machineTypes.find((m) => m.slug === type);

  const key = JSON.stringify([slug, type, category, brand]);
  const [res, setRes] = useState<{ key: string; items: NetProduct[]; total: number } | null>(null);
  const loading = res?.key !== key;
  useEffect(() => {
    const [slug, type, category, brand] = JSON.parse(key) as string[];
    marketApi.list({ industry: slug, machineType: type || undefined, category: category || undefined, brand: brand || undefined, sort: "popular", limit: 48 })
      .then((r) => setRes({ key, items: r.products, total: r.pagination.total }))
      .catch(() => setRes({ key, items: [], total: 0 }));
  }, [key]);

  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp.toString());
    if (v) n.set(k, v); else n.delete(k);
    if (k === "type") n.delete("brand");
    router.replace(`/i/${slug}${n.toString() ? `?${n}` : ""}`, { scroll: false });
  };

  if (industries && !ind) {
    return <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16"><EmptyState title="We don’t have that industry yet" body="Browse everything we cover from the home page." action={<Link href="/" className="h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Go home</Link>} /></div>;
  }

  const items = res?.items ?? [];
  const brands = mt?.brands ?? [];
  const fixHref = `/fix?industry=${slug}${type ? `&type=${type}` : ""}`;

  return (
    <>
      {/* Header */}
      <section className="border-b border-line" style={{ background: ind?.tint ?? "var(--paper-2)" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 flex items-center gap-4 md:gap-6">
          {ind ? <IconTile name={ind.icon} tint="#ffffff" ink={ind.ink} size={72} className="md:!w-[96px] md:!h-[96px] shadow-[var(--shadow-card)]" /> : <Skel className="w-[72px] h-[72px] !rounded-full" />}
          <div className="min-w-0 flex-1">
            <nav className="text-[12.5px] font-bold text-ink-3"><Link href="/" className="hover:text-ink">Home</Link> / {ind?.name ?? "…"}</nav>
            <h1 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-tight mt-0.5">{mt ? `${mt.name} parts` : ind?.name ?? " "}</h1>
            <p className="text-[14px] md:text-[15px] text-ink-2 font-semibold mt-1">{ind ? `${ind.tagline ?? ""}${ind.parts ? ` · ${ind.parts.toLocaleString("en-IN")} parts from ${ind.sellers} sellers` : ""}` : " "}</p>
          </div>
          <Link href={fixHref} className="hidden md:inline-flex h-12 px-5 items-center gap-2 rounded-[14px] bg-ink text-paper text-[14.5px] font-extrabold fms-press flex-shrink-0">
            <NetIcon name="tool" size={18} /> Book a technician
          </Link>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Machine types */}
        <section className="mt-6">
          <div className="text-[13px] font-extrabold text-ink-3 uppercase tracking-wide mb-2.5">Which machine?</div>
          <div className="flex gap-2 overflow-x-auto scroll-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <button className="chip" data-on={!type} onClick={() => setParam("type", null)}>All</button>
            {(ind?.machineTypes ?? []).map((m) => (
              <button key={m.id} className="chip" data-on={type === m.slug} onClick={() => setParam("type", type === m.slug ? null : m.slug)}>{m.name}</button>
            ))}
          </div>
          {brands.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto scroll-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0">
              <span className="text-[12.5px] font-bold text-ink-3 self-center flex-shrink-0 mr-1">Brand</span>
              {brands.map((b) => <button key={b} className="chip" data-on={brand === b} onClick={() => setParam("brand", brand === b ? null : b)}>{b}</button>)}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="mt-8">
          <SectionTitle title="Shop by part" />
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-x-3 gap-y-5">
            {(ind?.categories ?? Array.from({ length: 8 }, (_, i) => ({ id: String(i), name: "", icon: "gear" }))).map((c) => (
              <button key={c.id} onClick={() => c.name && setParam("category", category === c.name ? null : c.name)} className="flex flex-col items-center gap-2 group" aria-pressed={category === c.name}>
                <span className="w-[64px] h-[64px] md:w-[76px] md:h-[76px] rounded-full flex items-center justify-center fms-press group-hover:scale-105 transition-transform"
                  style={{ background: category === c.name ? ind?.ink : ind?.tint ?? "var(--paper-2)", color: category === c.name ? "#fff" : ind?.ink }}>
                  <NetIcon name={c.icon} size={30} />
                </span>
                <span className="text-[12px] md:text-[13px] font-bold text-ink-2 text-center leading-tight min-h-[2em]">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="mt-10">
          <SectionTitle
            title={category || (mt ? `All ${mt.name.toLowerCase()} parts` : "All parts")}
            sub={loading ? "Loading…" : `${res?.total ?? 0} part${res?.total === 1 ? "" : "s"} from verified sellers`}
            action={(category || type || brand) ? <button onClick={() => router.replace(`/i/${slug}`, { scroll: false })} className="text-[14px] font-extrabold text-[color:var(--accent)]">Clear filters</button> : undefined}
          />
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
              title="Nobody has listed this yet"
              body="Post a request and sellers across India will quote, or book a technician who brings the part."
              action={
                <div className="flex gap-2 flex-wrap justify-center">
                  <Link href={`/buyer/requests/new?part=${encodeURIComponent(category || mt?.name || ind?.name || "")}`} className="h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Get quotes</Link>
                  <Link href={fixHref} className="h-12 px-6 inline-flex items-center rounded-[14px] bg-paper border border-line-2 font-extrabold">Book a technician</Link>
                </div>
              }
            />
          )}
        </section>

        {/* Fix CTA */}
        <section className="mt-14 rounded-[22px] p-6 md:p-8 flex items-center justify-between gap-5 flex-wrap" style={{ background: ind?.tint ?? "var(--paper-2)" }}>
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-[16px] bg-white flex items-center justify-center" style={{ color: ind?.ink }}><NetIcon name="tool" size={28} /></span>
            <div>
              <div className="text-[19px] font-extrabold tracking-tight">Not sure which part? Get it checked.</div>
              <div className="text-[14px] text-ink-2 font-semibold mt-0.5">Verified technicians near you for {ind?.name.toLowerCase() ?? "this machine"}.</div>
            </div>
          </div>
          <Link href={fixHref} className="h-12 px-6 inline-flex items-center rounded-[14px] bg-ink text-paper font-extrabold fms-press">Book a technician</Link>
        </section>
      </div>
    </>
  );
}

export default function IndustryPage() {
  return (
    <ShopShell>
      <Suspense>
        <IndustryInner />
      </Suspense>
    </ShopShell>
  );
}
