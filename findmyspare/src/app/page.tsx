"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShopShell } from "@/components/shop/AppShell";
import { ProductTile } from "@/components/shop/ProductTile";
import { SectionTitle, Skel } from "@/components/shop/ui";
import { VehiclePicker } from "@/components/shop/VehiclePicker";
import { LogoMark } from "@/components/brand/Logo";
import { IconTile, NetIcon, INDUSTRY_STYLE } from "@/components/net/NetIcon";
import { useTaxonomy } from "@/components/net/useTaxonomy";
import { useAuthStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { useVehicleStore, vehicleShortLabel } from "@/lib/vehicle-store";
import { vehiclesApi, type Vehicle } from "@/lib/api/v2";
import { marketApi, type NetProduct } from "@/lib/api/v3";

// Rails on the home page, in order. Automotive follows the selected vehicle.
const RAIL_INDUSTRIES = ["automotive", "pumps", "appliances", "power", "agriculture", "industrial", "electronics", "construction"];

const PROMPTS = ["submersible pump capacitor", "AC PCB", "Swift brake pads", "tractor clutch plate", "genset fuel filter", "phone display", "6205 bearing"];

function Rail({ slug, title, sub, products }: { slug: string; title: string; sub?: string; products: NetProduct[] | undefined }) {
  if (products && !products.length) return null;
  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
      <SectionTitle title={title} sub={sub} action={<Link href={`/i/${slug}`} className="text-[14px] font-extrabold text-[color:var(--accent)] whitespace-nowrap">See all →</Link>} />
      <div className="flex gap-5 overflow-x-auto scroll-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
        {!products
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-[220px] flex-shrink-0"><Skel className="aspect-[4/3]" /><Skel className="h-4 mt-4 w-3/4" /><Skel className="h-4 mt-2 w-1/2" /></div>)
          : products.map((p) => <div key={p.id} className="w-[220px] flex-shrink-0 snap-start"><ProductTile p={p} /></div>)}
      </div>
    </section>
  );
}

function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }} role="search" className="mt-6">
      <label className="h-[58px] rounded-[18px] bg-paper border border-line-2 shadow-[var(--shadow-card)] focus-within:border-[color:var(--accent)] flex items-center pl-5 pr-2 gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-ink-3 flex-shrink-0"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search any spare part" placeholder="Search any spare part, for any machine…" className="flex-1 min-w-0 bg-transparent outline-none text-[16px] font-semibold text-ink placeholder:text-ink-4" />
        <button className="h-[44px] px-5 rounded-[13px] bg-[color:var(--accent)] text-white text-[14.5px] font-extrabold fms-press flex-shrink-0">Search</button>
      </label>
      <div className="mt-3 flex gap-2 overflow-x-auto scroll-hidden -mx-4 px-4 md:mx-0 md:px-0">
        {PROMPTS.map((p) => (
          <Link key={p} href={`/search?q=${encodeURIComponent(p)}`} className="chip flex-shrink-0 bg-paper/80">{p}</Link>
        ))}
      </div>
    </form>
  );
}

export default function HomePage() {
  const mounted = useMounted();
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : null;
  const vehicle = useVehicleStore((s) => s.selected);
  const industries = useTaxonomy();
  const [picker, setPicker] = useState(false);

  // Rails are keyed by the selected vehicle so the automotive rail refetches when it changes.
  const vkey = `${vehicle?.make ?? ""}|${vehicle?.model ?? ""}`;
  const [rails, setRails] = useState<{ key: string; bySlug: Record<string, NetProduct[]> } | null>(null);
  const bySlug = rails?.key === vkey ? rails.bySlug : null;
  useEffect(() => {
    Promise.all(RAIL_INDUSTRIES.map((slug) =>
      marketApi.list({ industry: slug, sort: "popular", limit: 10, ...(slug === "automotive" ? { make: vehicle?.make, model: vehicle?.model } : {}) })
        .then((r) => [slug, r.products] as const)
        .catch(() => [slug, [] as NetProduct[]] as const),
    )).then((rows) => setRails({ key: vkey, bySlug: Object.fromEntries(rows) }));
  }, [vkey, vehicle?.make, vehicle?.model]);

  const [machines, setMachines] = useState<{ uid: string; list: Vehicle[] } | null>(null);
  const myMachines = user && machines?.uid === user.id ? machines.list : null;
  useEffect(() => {
    if (!user || user.role !== "buyer" || !user.profileCompleted) return;
    vehiclesApi.mine().then((r) => setMachines({ uid: user.id, list: r.vehicles })).catch(() => setMachines({ uid: user.id, list: [] }));
  }, [user]);

  const first = user?.name?.split(" ")[0];
  const nameOf = (slug: string) => industries?.find((i) => i.slug === slug)?.name ?? INDUSTRY_STYLE[slug]?.short ?? slug;
  const totalParts = industries?.reduce((s, i) => s + i.parts, 0) ?? 0;

  return (
    <ShopShell>
      {/* ── Hero: one search box for every machine ── */}
      <section className="relative overflow-hidden bg-[color:var(--accent-wash)] border-b border-line">
        <LogoMark size={420} color="rgba(229,70,27,.07)" className="absolute -right-24 -top-28 pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 pt-8 pb-8 md:pt-14 md:pb-12">
          <div className="max-w-[720px]">
            <div className="text-[14px] font-extrabold text-[color:var(--accent)]">{first ? `Namaste, ${first}` : "India’s spare-parts network"}</div>
            <h1 className="mt-2 text-[34px] md:text-[54px] leading-[1.03] font-extrabold tracking-[-0.035em] text-ink">
              Every spare part.<br />For every machine.
            </h1>
            <p className="mt-3 text-[15.5px] md:text-[17px] text-ink-2 max-w-[560px] leading-relaxed font-medium">
              Car, water pump, AC, tractor, genset or phone: find the part from verified sellers, or get a technician to fix it.
            </p>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ── What needs fixing? (industry carousel) ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 md:mt-10">
        <SectionTitle title="What are you fixing today?" sub={totalParts ? `${totalParts.toLocaleString("en-IN")} parts across ${industries?.length ?? 10} industries` : undefined} />
        <div className="flex gap-4 md:gap-6 overflow-x-auto scroll-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {(industries ?? Object.entries(INDUSTRY_STYLE).map(([slug, s]) => ({ slug, name: s.short, icon: s.icon, tint: s.tint, ink: s.ink }))).map((i) => (
            <Link key={i.slug} href={`/i/${i.slug}`} className="flex-shrink-0 w-[84px] md:w-[104px] flex flex-col items-center gap-2 group">
              <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={84} className="md:!w-[100px] md:!h-[100px] fms-press group-hover:scale-105 transition-transform" />
              <span className="text-[12.5px] md:text-[13.5px] font-bold text-ink-2 text-center leading-tight">{INDUSTRY_STYLE[i.slug]?.short ?? i.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Doors (Swiggy-style service tiles) ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { href: "/search", t: "Shop parts", s: "Verified sellers, delivered", tag: "1–3 day delivery", bg: "#FFF1EB", fg: "var(--accent)", icon: "gear" },
          { href: "/fix", t: "Fix it", s: "Book a technician for any machine", tag: "Pumps, AC, gensets…", bg: "#E7F5EF", fg: "#0B7A53", icon: "tool" },
          { href: "/buyer/requests/new", t: "Get quotes", s: "Describe or snap the part", tag: "Sellers compete", bg: "#EAF0FD", fg: "#2457C5", icon: "chip" },
          { href: "/sell", t: "Buy for business", s: "Bulk, credit & price lists", tag: "Shops & factories", bg: "#F1ECFB", fg: "#5B3CC4", icon: "panel" },
        ].map((d) => (
          <Link key={d.t} href={d.href} className="group relative overflow-hidden rounded-[22px] p-4 md:p-5 min-h-[132px] md:min-h-[150px] fms-press" style={{ background: d.bg }}>
            <div className="text-[19px] md:text-[22px] font-extrabold tracking-tight text-ink">{d.t}</div>
            <div className="text-[12.5px] md:text-[13.5px] font-semibold text-ink-2 mt-1 max-w-[190px] leading-snug">{d.s}</div>
            <span className="inline-flex mt-3 h-7 px-3 rounded-full bg-white text-[11.5px] md:text-[12px] font-extrabold items-center" style={{ color: d.fg }}>{d.tag}</span>
            <span className="absolute -right-3 -bottom-3 opacity-20 group-hover:opacity-30 transition-opacity" style={{ color: d.fg }}><NetIcon name={d.icon} size={92} /></span>
          </Link>
        ))}
      </section>

      {/* ── My machines ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <SectionTitle
          title="My machines"
          sub="Every service, part and warranty, in one record"
          action={<Link href={user ? "/vehicles" : "/login?next=/vehicles"} className="text-[14px] font-extrabold text-[color:var(--accent)] whitespace-nowrap">{myMachines?.length ? "Manage →" : "Add →"}</Link>}
        />
        <div className="flex gap-4 overflow-x-auto scroll-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {(myMachines ?? []).map((m) => {
            const st = INDUSTRY_STYLE[m.industrySlug ?? "automotive"] ?? INDUSTRY_STYLE.automotive!;
            return (
              <div key={m.id} className="card-flat flex-shrink-0 w-[260px] p-4">
                <Link href={`/vehicles/${m.id}`} className="flex items-center gap-3">
                  <IconTile name={st.icon} tint={st.tint} ink={st.ink} size={48} />
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold truncate">{m.nickname || `${m.makeName} ${m.modelName}`}</div>
                    <div className="text-[12.5px] text-ink-3 font-semibold truncate">{m.regNo ? m.regNoDisplay : `${m.makeName} ${m.modelName}`}</div>
                  </div>
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href={`/fix?vehicleId=${m.id}`} className="h-9 rounded-[10px] bg-paper-2 text-[12.5px] font-extrabold flex items-center justify-center hover:bg-paper-3">Book service</Link>
                  <Link href={m.industrySlug && m.industrySlug !== "automotive" ? `/i/${m.industrySlug}${m.machineType ? `?type=${m.machineType}` : ""}` : `/search?make=${encodeURIComponent(m.makeName)}&model=${encodeURIComponent(m.modelName)}`} className="h-9 rounded-[10px] bg-paper-2 text-[12.5px] font-extrabold text-[color:var(--accent)] flex items-center justify-center hover:bg-paper-3">Shop parts</Link>
                </div>
              </div>
            );
          })}
          <Link href={user ? "/vehicles?add=1" : "/login?next=/vehicles"} className="flex-shrink-0 w-[260px] min-h-[124px] rounded-[16px] border-2 border-dashed border-line-2 hover:border-[color:var(--accent)] flex flex-col items-center justify-center text-center p-4 fms-press">
            <span className="text-[15px] font-extrabold">+ Add a vehicle or machine</span>
            <span className="text-[12.5px] text-ink-3 font-semibold mt-1">Car by number plate; pump, AC or genset by brand & serial</span>
          </Link>
          {vehicle && !myMachines?.length && (
            <button onClick={() => setPicker(true)} className="card-flat flex-shrink-0 w-[260px] p-4 text-left">
              <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3">Shopping vehicle parts for</div>
              <div className="text-[16px] font-extrabold mt-1">{vehicle.make} {vehicleShortLabel(vehicle)}</div>
              <div className="text-[12.5px] font-bold text-[color:var(--accent)] mt-2">Change</div>
            </button>
          )}
        </div>
      </section>

      {/* ── Rails per industry ── */}
      <Rail
        slug="automotive"
        title={vehicle ? `For your ${vehicleShortLabel(vehicle)}` : "Popular for cars & bikes"}
        sub={vehicle ? "Listed or buyer-confirmed to fit" : "Most viewed vehicle parts this week"}
        products={bySlug?.automotive}
      />
      {RAIL_INDUSTRIES.slice(1, 4).map((slug) => <Rail key={slug} slug={slug} title={nameOf(slug)} sub="Popular this week" products={bySlug?.[slug]} />)}

      {/* ── One network: every tier of the supply chain ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-14">
        <div className="rounded-[24px] bg-ink text-white p-6 md:p-10 overflow-hidden relative">
          <div className="text-[13px] font-extrabold text-[color:var(--brand)] uppercase tracking-wider">One network</div>
          <div className="text-[26px] md:text-[36px] font-extrabold tracking-tight leading-tight mt-2 max-w-[640px]">From the foundry to your front door, everyone in the chain trades here.</div>
          <div className="mt-7 flex items-center gap-2 overflow-x-auto scroll-hidden pb-1 -mx-6 px-6 md:mx-0 md:px-0">
            {["Raw material", "Manufacturer", "Super stockist", "Distributor", "Retailer", "Technician", "You"].map((t, i, a) => (
              <div key={t} className="flex items-center gap-2 flex-shrink-0">
                <span className={`h-10 px-4 rounded-full inline-flex items-center text-[13.5px] font-extrabold ${i === a.length - 1 ? "bg-[color:var(--brand)] text-white" : "bg-white/10 text-white"}`}>{t}</span>
                {i < a.length - 1 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-white/40"><path d="m9 6 6 6-6 6" /></svg>}
              </div>
            ))}
          </div>
          <div className="mt-7 grid md:grid-cols-3 gap-4">
            {[
              ["Purchase orders & credit", "Order stock from your suppliers at your price list. Udhaar tracked automatically."],
              ["Counter billing & khata", "GST bills in seconds. Who owes what, with WhatsApp reminders."],
              ["Demand radar", "See what buyers near you search for and nobody stocks yet."],
            ].map(([t, s]) => (
              <div key={t} className="rounded-[16px] bg-white/[0.06] border border-white/10 p-4">
                <div className="text-[15px] font-extrabold">{t}</div>
                <div className="text-[13px] text-white/65 mt-1 leading-snug">{s}</div>
              </div>
            ))}
          </div>
          <Link href="/sell" className="mt-7 h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--brand)] text-white text-[15px] font-extrabold fms-press">Run your business on FindMySpare</Link>
        </div>
      </section>

      {RAIL_INDUSTRIES.slice(4).map((slug) => <Rail key={slug} slug={slug} title={nameOf(slug)} sub="Popular this week" products={bySlug?.[slug]} />)}

      {/* ── Promise strip ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-14">
        <div className="rounded-[22px] bg-paper-2 p-6 md:p-8 grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-[13px] font-extrabold text-[color:var(--accent)] uppercase tracking-wider">FMS Promise</div>
            <div className="text-[21px] font-extrabold tracking-tight mt-1 leading-tight">Buy like you’re at the counter, without the running around.</div>
          </div>
          {[
            ["Verified sellers", "Every seller is GST-checked and reviewed before going live."],
            ["Right part or free return", "Wrong fit for the machine you picked? We pick it up free."],
            ["Money held safely", "Your payment is held and released to the seller after delivery."],
          ].map(([t, s]) => (
            <div key={t} className="flex gap-3">
              <span className="w-9 h-9 rounded-[12px] bg-[color:var(--success-wash)] flex items-center justify-center flex-shrink-0"><LogoMark size={20} color="#0B7A53" /></span>
              <div><div className="text-[15px] font-extrabold">{t}</div><div className="text-[13.5px] text-ink-3 mt-0.5 leading-snug">{s}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workshops & technicians ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="rounded-[22px] p-6 md:p-10 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center" style={{ background: "linear-gradient(135deg,#1B1E24 0%,#2B2F38 100%)" }}>
          <div className="text-white">
            <div className="text-[13px] font-extrabold text-[color:var(--brand)] uppercase tracking-wider">For workshops & technicians · Free</div>
            <div className="text-[26px] md:text-[34px] font-extrabold tracking-tight leading-tight mt-2">Get jobs nearby. Run them from your phone.</div>
            <p className="text-white/70 text-[15px] mt-3 max-w-[480px]">Motor rewinding, AC repair, car service or tractor work: take Fix requests near you, send estimates, bill with GST and collect on UPI.</p>
            <Link href="/workshop" className="mt-5 h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--brand)] text-white text-[15px] font-extrabold fms-press">Open Workshop</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Jobs near you", "Matched to your trade & city"], ["Job cards", "Inspection for any machine"], ["GST invoices", "QR-verifiable"], ["Collect via UPI", "Link on every bill"]].map(([t, s]) => (
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
