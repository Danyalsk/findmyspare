"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShopShell } from "@/components/shop/AppShell";
import { ProductTile } from "@/components/shop/ProductTile";
import { CATEGORIES, SectionTitle, Skel } from "@/components/shop/ui";
import { VehiclePicker } from "@/components/shop/VehiclePicker";
import { LogoMark } from "@/components/brand/Logo";
import { BrandLogo } from "@/lib/brand-logos";
import { useAuthStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { useVehicleStore, vehicleShortLabel } from "@/lib/vehicle-store";
import { shopApi, type ShopProduct } from "@/lib/api/v2";

const MAKES = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Hero", "Bajaj", "TVS", "Royal Enfield"];

function Rail({ title, sub, products, loading, href }: { title: string; sub?: string; products: ShopProduct[]; loading: boolean; href: string }) {
  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
      <SectionTitle title={title} sub={sub} action={<Link href={href} className="text-[14px] font-extrabold text-[color:var(--accent)] whitespace-nowrap">See all →</Link>} />
      <div className="flex gap-5 overflow-x-auto scroll-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-[230px] flex-shrink-0"><Skel className="aspect-[4/3]" /><Skel className="h-4 mt-4 w-3/4" /><Skel className="h-4 mt-2 w-1/2" /></div>)
          : products.map((p) => <div key={p.id} className="w-[230px] flex-shrink-0 snap-start"><ProductTile p={p} /></div>)}
      </div>
    </section>
  );
}

export default function HomePage() {
  const mounted = useMounted();
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : null;
  const vehicle = useVehicleStore((s) => s.selected);
  const [picker, setPicker] = useState(false);
  // Results are keyed by vehicle so "loading" is derived, not set in the effect.
  const key = `${vehicle?.make ?? ""}|${vehicle?.model ?? ""}`;
  const [rails, setRails] = useState<{ key: string; forVehicle: ShopProduct[]; genuine: ShopProduct[] } | null>(null);
  const loading = rails?.key !== key;
  const forVehicle = rails?.forVehicle ?? [];
  const genuine = rails?.genuine ?? [];

  useEffect(() => {
    Promise.all([
      shopApi.list({ make: vehicle?.make, model: vehicle?.model, sort: "popular", limit: 12 }),
      shopApi.list({ partType: "genuine", limit: 12 }),
    ])
      .then(([a, b]) => setRails({ key, forVehicle: a.products, genuine: b.products }))
      .catch(() => setRails({ key, forVehicle: [], genuine: [] }));
  }, [key, vehicle?.make, vehicle?.model]);

  const first = user?.name?.split(" ")[0];

  return (
    <ShopShell>
      {/* ── Hero ── */}
      <section className="bg-[color:var(--accent-wash)] border-b border-[color:var(--line)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-14 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <div className="text-[14px] font-extrabold text-[color:var(--accent)]">{first ? `Namaste, ${first}` : "India’s spare-parts marketplace"}</div>
            <h1 className="mt-2 text-[36px] md:text-[52px] leading-[1.04] font-extrabold tracking-[-0.035em] text-ink">
              Sahi part.<br />Pakka record.
            </h1>
            <p className="mt-4 text-[16px] md:text-[17px] text-ink-2 max-w-[520px] leading-relaxed font-medium">
              The right part for your car or bike from verified sellers. Guaranteed to fit, delivered fast, and saved to your vehicle’s service record.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/search" className="h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white text-[15px] font-extrabold hover:bg-[color:var(--accent-ink)] fms-press">Shop parts</Link>
              <Link href="/buyer/requests/new" className="h-12 px-6 inline-flex items-center rounded-[14px] bg-paper border border-line-2 text-ink text-[15px] font-extrabold hover:border-ink fms-press">Can’t find it? Get quotes</Link>
            </div>
          </div>

          {/* Vehicle card */}
          <div className="card p-5 md:p-6">
            {vehicle ? (
              <>
                <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3">Shopping for</div>
                <div className="mt-2 flex items-center gap-3">
                  <BrandLogo name={vehicle.make} size={48} />
                  <div className="min-w-0">
                    <div className="text-[20px] font-extrabold tracking-tight truncate">{vehicle.make} {vehicleShortLabel(vehicle)}</div>
                    {vehicle.regNoDisplay && <span className="reg-plate text-[12px] mt-1">{vehicle.regNoDisplay}</span>}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setPicker(true)} className="h-10 px-4 rounded-[12px] bg-paper-2 text-[13.5px] font-bold hover:bg-paper-3">Change vehicle</button>
                  {vehicle.vehicleId && <Link href={`/vehicles/${vehicle.vehicleId}`} className="h-10 px-4 inline-flex items-center rounded-[12px] bg-paper-2 text-[13.5px] font-bold hover:bg-paper-3">Open Passport</Link>}
                </div>
              </>
            ) : (
              <>
                <div className="text-[18px] font-extrabold tracking-tight">Which vehicle is it for?</div>
                <p className="text-[14px] text-ink-3 mt-1">We’ll only show parts that fit.</p>
                <button onClick={() => setPicker(true)} className="mt-4 w-full h-12 rounded-[14px] bg-ink text-paper text-[15px] font-extrabold fms-press">Select make & model</button>
                <Link href={user ? "/vehicles" : "/login?next=/vehicles"} className="mt-2.5 w-full h-12 rounded-[14px] border-2 border-dashed border-line-2 text-ink-2 text-[14px] font-bold flex items-center justify-center gap-2 hover:border-[color:var(--accent)]">
                  <span className="reg-plate text-[11px]">MH 12 AB 3456</span> Add by number plate
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Three doors (Swiggy-style service tiles) ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 -mt-0 md:mt-10 pt-8 md:pt-0 grid sm:grid-cols-3 gap-4">
        {[
          { href: "/search", t: "Shop parts", s: "OES, genuine & aftermarket from verified sellers", tag: "Delivery in 1–3 days", bg: "#FFF1EB", fg: "var(--accent)" },
          { href: "/buyer/requests/new", t: "Get quotes", s: "Describe or snap any part. Sellers compete", tag: "First quote in minutes", bg: "#EAF0FD", fg: "#2457C5" },
          { href: "/vehicles", t: "Vehicle Passport", s: "Every service, part and warranty in one place", tag: "Free", bg: "#E7F5EF", fg: "#0B7A53" },
        ].map((d) => (
          <Link key={d.t} href={d.href} className="group relative overflow-hidden rounded-[22px] p-5 min-h-[148px] fms-press" style={{ background: d.bg }}>
            <div className="text-[22px] font-extrabold tracking-tight text-ink">{d.t}</div>
            <div className="text-[13.5px] font-semibold text-ink-2 mt-1 max-w-[220px]">{d.s}</div>
            <span className="inline-flex mt-3 h-7 px-3 rounded-full bg-white text-[12px] font-extrabold items-center" style={{ color: d.fg }}>{d.tag}</span>
            <LogoMark size={110} color={d.fg} className="absolute -right-5 -bottom-6 opacity-15 group-hover:opacity-25 transition-opacity" />
          </Link>
        ))}
      </section>

      {/* ── Categories ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <SectionTitle title={vehicle ? `Shop by category for your ${vehicle.model}` : "What are you looking for?"} />
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-3 gap-y-6">
          {CATEGORIES.map((c) => (
            <Link key={c.key} href={`/search?category=${encodeURIComponent(c.key)}`} className="flex flex-col items-center gap-2 group">
              <span className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-full flex items-center justify-center fms-press group-hover:scale-105" style={{ background: c.tint, color: c.ink }}>
                <c.Icon size={34} />
              </span>
              <span className="text-[12.5px] md:text-[13.5px] font-bold text-ink-2 text-center leading-tight">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <Rail
        title={vehicle ? `Top picks for your ${vehicleShortLabel(vehicle)}` : "Popular right now"}
        sub={vehicle ? "Listed or buyer-confirmed to fit" : "Most viewed parts this week"}
        products={forVehicle}
        loading={loading}
        href={vehicle ? `/search?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}` : "/search"}
      />

      {/* ── Promise strip ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="rounded-[22px] bg-ink text-white p-6 md:p-8 grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="text-[13px] font-extrabold text-[color:var(--brand)] uppercase tracking-wider">FMS Promise</div>
            <div className="text-[22px] font-extrabold tracking-tight mt-1 leading-tight">Buy like you’re at the counter, without the running around.</div>
          </div>
          {[
            ["Verified sellers", "Every seller is GST-checked and reviewed before going live."],
            ["Fit or free return", "If it doesn’t fit the vehicle you selected, we pick it up free."],
            ["Money held safely", "Your payment is held in escrow and released only after delivery."],
          ].map(([t, s]) => (
            <div key={t} className="flex gap-3">
              <span className="w-9 h-9 rounded-[12px] bg-white/10 flex items-center justify-center flex-shrink-0"><LogoMark size={20} color="#3DD39A" /></span>
              <div><div className="text-[15px] font-extrabold">{t}</div><div className="text-[13.5px] text-white/65 mt-0.5 leading-snug">{s}</div></div>
            </div>
          ))}
        </div>
      </section>

      <Rail title="Genuine OEM parts" sub="Boxed with hologram, straight from authorised channels" products={genuine} loading={loading} href="/search?partType=genuine" />

      {/* ── Shop by make ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <SectionTitle title="Shop by vehicle make" />
        <div className="flex gap-4 overflow-x-auto scroll-hidden pb-2">
          {MAKES.map((m) => (
            <Link key={m} href={`/search?make=${encodeURIComponent(m)}`} className="flex-shrink-0 w-[112px] flex flex-col items-center gap-2 p-3 rounded-[18px] border border-line hover:border-line-2 hover:shadow-[var(--shadow-card)] fms-press">
              <BrandLogo name={m} size={52} />
              <span className="text-[12.5px] font-bold text-center leading-tight">{m}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Garages band ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="rounded-[22px] p-6 md:p-10 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center" style={{ background: "linear-gradient(135deg,#1B1E24 0%,#2B2F38 100%)" }}>
          <div className="text-white">
            <div className="text-[13px] font-extrabold text-[color:var(--brand)] uppercase tracking-wider">For garages · Free</div>
            <div className="text-[28px] md:text-[34px] font-extrabold tracking-tight leading-tight mt-2">Run your whole workshop from your phone.</div>
            <p className="text-white/70 text-[15px] mt-3 max-w-[480px]">Job cards, estimates customers approve on WhatsApp, GST invoices with a verification QR, UPI collection, and parts sourcing in one tap.</p>
            <Link href="/workshop" className="mt-5 h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--brand)] text-white text-[15px] font-extrabold fms-press">Open Workshop</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Job cards", "Inspection, photos, odometer"], ["Estimates", "Owner approves line by line"], ["GST invoices", "QR-verifiable, tamper-evident"], ["Collect via UPI", "Payment link on every bill"]].map(([t, s]) => (
              <div key={t} className="rounded-[16px] bg-white/[0.06] border border-white/10 p-4">
                <div className="text-white text-[15px] font-extrabold">{t}</div>
                <div className="text-white/60 text-[12.5px] mt-1">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VehiclePicker open={picker} onClose={() => setPicker(false)} />
    </ShopShell>
  );
}
