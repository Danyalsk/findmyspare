"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  StarIcon,
  PackageIcon,
} from "@/lib/icons";
import {
  EngineIcon,
  BrakeIcon,
  HeadlightIcon,
  BodyIcon,
  SuspensionIcon,
  TransmissionIcon,
  ElectricalIcon,
  FilterIcon as FilterIconSvg,
  TyreIcon,
  AcIcon,
  WiperIcon,
  InteriorIcon,
} from "@/lib/category-icons";
import { productsApi } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { BrandLogo } from "@/lib/brand-logos";
import { useAuthStore, getPostLoginPath } from "@/lib/store";

const CATEGORIES = [
  { key: "engine",   label: "Engine",       Icon: EngineIcon,       q: "engine" },
  { key: "brakes",   label: "Brakes",       Icon: BrakeIcon,        q: "brakes" },
  { key: "lighting", label: "Lighting",     Icon: HeadlightIcon,    q: "headlight" },
  { key: "body",     label: "Body",         Icon: BodyIcon,         q: "bumper" },
  { key: "susp",     label: "Suspension",   Icon: SuspensionIcon,   q: "shock" },
  { key: "tx",       label: "Transmission", Icon: TransmissionIcon, q: "clutch" },
  { key: "elec",     label: "Electrical",   Icon: ElectricalIcon,   q: "battery" },
  { key: "filters",  label: "Filters",      Icon: FilterIconSvg,    q: "filter" },
  { key: "tyre",     label: "Tyres",        Icon: TyreIcon,         q: "tyre" },
  { key: "aircon",   label: "AC",           Icon: AcIcon,           q: "ac" },
  { key: "wipers",   label: "Wipers",       Icon: WiperIcon,        q: "wiper" },
  { key: "interior", label: "Interior",     Icon: InteriorIcon,     q: "interior" },
];

const VEHICLE_BRANDS = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Honda",
  "Toyota",
  "Kia",
  "Renault",
];

const VALUES = [
  {
    title: "Verified supply",
    body: "Every supplier is GST-verified and admin reviewed before going live. No fly-by-night listings.",
  },
  {
    title: "Quotes in minutes",
    body: "Post a request and verified suppliers compete on price, quality, and ETA — live.",
  },
  {
    title: "Direct contact",
    body: "Connect with the supplier directly over WhatsApp and chat. No middle layer slowing you down.",
  },
  {
    title: "Pan-India reach",
    body: "Suppliers across 6,500+ pincodes. Find the right part wherever you are.",
  },
];

export default function PublicHome() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const loggedIn = isHydrated && !!user;
  const dashboardHref = user ? getPostLoginPath(user) : "/login";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productsApi.list({ limit: 8, sort: "newest" });
        if (!cancelled) setProducts(res.products);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = products.slice(0, 8).map((p, i) => ({
    ...p,
    rating: [4.8, 4.7, 4.9, 4.6, 4.5, 4.7, 4.8, 4.6][i] || 4.5,
  }));

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <PublicNav />

      {/* ───── HERO ──────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-4xl">
            <div className="eyebrow mb-7">India · Auto parts marketplace</div>
            <h1 className="h1 text-ink">
              Every part. For every car.
              <br />
              <span className="text-ink-3">Delivered with care.</span>
            </h1>
            <p className="text-ink-2 text-[17px] mt-8 max-w-xl leading-relaxed">
              A curated marketplace for the Indian aftermarket. Verified suppliers,
              live quotes, direct contact.
            </p>
            <div className="mt-10 flex gap-3 flex-wrap">
              <Link href="/search">
                <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon size={16} />}>
                  Browse the marketplace
                </Button>
              </Link>
              <Link href={loggedIn ? dashboardHref : "/login"}>
                <Button variant="ghost" size="lg">
                  {loggedIn ? "Go to dashboard" : "Sign in"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── HERO IMAGE ─────────────────────────────── */}
      <section className="border-b border-[color:var(--line)] bg-paper-3">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-[14px] overflow-hidden bg-paper-2">
            <Image
              src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=2000&q=85"
              alt="Curated parts catalogue"
              fill
              sizes="(max-width: 1280px) 100vw, 1216px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ───── CATEGORIES ─────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
          <SectionHead
            title="Shop by category"
            link={{ label: "All categories", href: "/search" }}
          />
          <div className="mt-12 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-px bg-[color:var(--line)] border border-[color:var(--line)] rounded-[10px] overflow-hidden">
            {CATEGORIES.map(({ key, label, Icon, q }) => (
              <Link
                key={key}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="group flex flex-col items-center justify-center gap-3 bg-paper hover:bg-paper-2 py-7 px-3 transition-colors"
              >
                <Icon size={22} className="text-ink-2 group-hover:text-ink transition-colors" />
                <span className="text-[12px] font-semibold text-ink text-center tracking-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FEATURED PRODUCTS ──────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
          <SectionHead
            title="Curated selection"
            subtitle="Hand-selected from verified suppliers nationwide"
            link={{ label: "Browse all", href: "/search" }}
          />

          {featured.length === 0 ? (
            <div className="mt-12 border border-dashed border-[color:var(--line-2)] rounded-[10px] p-16 text-center">
              <div className="h3 mb-2">No products listed yet</div>
              <div className="text-[14px] text-ink-3 mb-6">
                No products listed yet. Check back soon.
              </div>
              <Link href={loggedIn ? dashboardHref : "/login"}>
                <Button variant="primary" size="md">{loggedIn ? "Go to dashboard" : "Sign in"}</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
              {featured.map((p) => (
                <ProductTile key={p.id} product={p} rating={p.rating} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── BRANDS ──────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <SectionHead title="Shop by brand" />
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-px bg-[color:var(--line)] border border-[color:var(--line)] rounded-[10px] overflow-hidden">
            {VEHICLE_BRANDS.map((name) => (
              <Link
                key={name}
                href={`/search?q=${encodeURIComponent(name)}`}
                className="group flex flex-col items-center justify-center gap-2.5 bg-paper hover:bg-paper-2 py-8 px-3 transition-colors"
              >
                <BrandLogo name={name} size={52} />
                <span className="text-[12px] font-semibold tracking-tight text-ink-2 text-center group-hover:text-ink transition-colors">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── VALUES ──────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)] bg-paper-3">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="max-w-2xl mb-16">
            <div className="eyebrow mb-5">Why FindMySpare</div>
            <h2 className="h2">
              Built around the realities of the Indian aftermarket.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--line)] border border-[color:var(--line)] rounded-[10px] overflow-hidden">
            {VALUES.map((v, i) => (
              <div key={v.title} className="bg-paper p-8 lg:p-10">
                <div className="text-[11px] font-semibold text-ink-3 tabular tracking-wider mb-4">
                  0{i + 1}
                </div>
                <div className="h3 mb-3 text-ink">{v.title}</div>
                <p className="text-[14px] text-ink-2 leading-relaxed">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="max-w-2xl mb-16">
            <div className="eyebrow mb-5">How it works</div>
            <h2 className="h2">Three steps from request to part.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              { step: "01", title: "Post a request", body: "Tell us the part name, make, model, and year. Add a photo if you can." },
              { step: "02", title: "Receive quotes", body: "Verified suppliers compete on price, quality, and ETA — live." },
              { step: "03", title: "Connect direct", body: "Pick the best quote and chat or WhatsApp the supplier directly to close the deal." },
            ].map((s) => (
              <div key={s.step} className="border-t border-ink pt-5">
                <div className="text-[12px] font-semibold text-ink-3 tabular tracking-wider mb-6">
                  {s.step}
                </div>
                <div className="h3 mb-3">{s.title}</div>
                <p className="text-[14px] text-ink-2 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SUPPLIER CTA ────────────────────────────── */}
      <section className="bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-28 grid md:grid-cols-[1.4fr_1fr] gap-12 items-end">
          <div>
            <div className="eyebrow !text-paper opacity-60 mb-6">For suppliers</div>
            <h3 className="h1 !text-paper">
              Reach verified buyers
              <br />
              <span className="opacity-60">across India.</span>
            </h3>
            <p className="opacity-70 mt-7 text-[16px] max-w-lg leading-relaxed">
              GST-verified onboarding, live inquiry feed, direct WhatsApp leads.
              Zero listing fees to get started.
            </p>
          </div>
          <div className="flex gap-3 md:justify-end flex-wrap">
            <Link href="/sell">
              <Button
                variant="accent"
                size="lg"
                rightIcon={<ArrowRightIcon size={16} />}
              >
                Become a supplier
              </Button>
            </Link>
            <Link href="/supplier-login">
              <Button
                variant="ghost"
                size="lg"
                className="!bg-transparent !border-paper/30 !text-paper hover:!bg-white/10"
              >
                Supplier login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-[color:var(--line)] bg-paper">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-paper font-bold text-[16px] leading-none">
                f
              </div>
              <span className="text-[16px] font-semibold tracking-tight">FindMySpare</span>
            </div>
            <p className="text-[13px] text-ink-3 mt-5 max-w-xs leading-relaxed">
              India&apos;s trusted parts marketplace. Verified suppliers, live quotes, direct contact across India.
            </p>
          </div>
          <FooterCol
            title="Buyers"
            links={[
              { label: "Browse parts", href: "/search" },
              { label: "Post a request", href: "/login" },
              { label: "Track orders", href: "/login" },
              { label: "How it works", href: "/" },
            ]}
          />
          <FooterCol
            title="Suppliers"
            links={[
              { label: "Sell with us", href: "/sell" },
              { label: "Supplier login", href: "/supplier-login" },
              { label: "Onboarding", href: "/sell" },
              { label: "Pricing", href: "#" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Press", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
        </div>
        <div className="border-t border-[color:var(--line)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between flex-wrap gap-3 text-[11.5px] text-ink-3">
            <span>© 2026 FindMySpare · Made in India</span>
            <span>Privacy · Terms · Refund policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

function SectionHead({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 className="h2">{title}</h2>
        {subtitle && <p className="text-[14px] text-ink-3 mt-2">{subtitle}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-[13px] font-semibold text-ink hover:text-[color:var(--accent-ink)] tracking-tight flex items-center gap-1 whitespace-nowrap"
        >
          {link.label}
          <ArrowRightIcon size={13} />
        </Link>
      )}
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[13px] text-ink-2 hover:text-ink transition-colors tracking-tight"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductTile({
  product: p,
  rating,
}: {
  product: ProductSummary;
  rating: number;
}) {
  const hasStock = p.stockQuantity > 0;
  const priceNum = parseFloat(p.price);

  return (
    <Link href={`/product/${p.id}`} className="block group">
      <div className="bg-paper rounded-[10px] overflow-hidden border border-[color:var(--line)] fms-press hover:border-[color:var(--line-2)] transition-colors">
        <div className="relative aspect-[4/5] bg-paper-2 overflow-hidden">
          {p.images?.[0] ? (
            <Image
              src={p.images[0]}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageIcon size={32} className="text-ink-3 opacity-30" />
            </div>
          )}
          {!hasStock && (
            <div className="absolute inset-0 bg-paper/80 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-ink text-paper text-[10px] font-bold tracking-wider uppercase">
                Out of stock
              </span>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-[color:var(--line)]">
          {p.category && (
            <div className="eyebrow !text-[10px] mb-2 truncate">{p.category}</div>
          )}
          <h3 className="text-[15px] font-semibold leading-snug text-ink line-clamp-2 min-h-[38px] tracking-tight">
            {p.name}
          </h3>
          <div className="text-[12px] text-ink-3 mt-1.5 truncate">
            {p.supplierName || "Verified supplier"}
          </div>
          <div className="mt-5 pt-4 border-t border-[color:var(--line)] flex items-center justify-between gap-2">
            <span className="text-[16px] font-semibold text-ink tabular leading-none">
              {formatPrice(priceNum)}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink tabular">
              <StarIcon size={11} className="text-[color:var(--accent)] fill-current" />
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
