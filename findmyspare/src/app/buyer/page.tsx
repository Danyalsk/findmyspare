"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  SearchIcon,
  PlusIcon,
  ArrowRightIcon,
  PackageIcon,
  StarIcon,
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
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/store";
import { inquiriesApi, productsApi } from "@/lib/api";
import type { Inquiry, ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/constants";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const CATEGORIES = [
  { label: "Engine",       Icon: EngineIcon,       q: "engine" },
  { label: "Brakes",       Icon: BrakeIcon,        q: "brakes" },
  { label: "Lighting",     Icon: HeadlightIcon,    q: "headlight" },
  { label: "Body",         Icon: BodyIcon,         q: "bumper" },
  { label: "Suspension",   Icon: SuspensionIcon,   q: "shock" },
  { label: "Transmission", Icon: TransmissionIcon, q: "clutch" },
  { label: "Electrical",   Icon: ElectricalIcon,   q: "battery" },
  { label: "Filters",      Icon: FilterIconSvg,    q: "filter" },
  { label: "Tyres",        Icon: TyreIcon,         q: "tyre" },
  { label: "AC",           Icon: AcIcon,           q: "ac" },
  { label: "Wipers",       Icon: WiperIcon,        q: "wiper" },
  { label: "Interior",     Icon: InteriorIcon,     q: "interior" },
];

export default function BuyerHomePage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const [requests, setRequests] = useState<Inquiry[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [reqRes, prodRes] = await Promise.allSettled([
          inquiriesApi.mine(),
          productsApi.list({ limit: 8, sort: "newest" }),
        ]);
        if (cancelled) return;
        if (reqRes.status === "fulfilled") setRequests(reqRes.value.inquiries);
        if (prodRes.status === "fulfilled") setProducts(prodRes.value.products);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const open = requests.filter((r) => r.isActive);
  const featured = products.slice(0, 8).map((p, i) => ({
    ...p,
    rating: [4.8, 4.7, 4.9, 4.6, 4.5, 4.7, 4.8, 4.6][i] || 4.5,
  }));

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden bg-paper pb-28 md:pb-16">
      {/* ───── HERO ─────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-12 pb-12 md:pt-20 md:pb-16">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 items-end">
            <div>
              <div className="eyebrow mb-5">{timeGreeting()}</div>
              <h1 className="h1 text-ink">
                Hello, {firstName}.
                <br />
                <span className="text-ink-3">What part today?</span>
              </h1>
              <p className="text-ink-2 text-[15px] mt-6 max-w-lg leading-relaxed">
                Search the catalogue or post a request — verified suppliers will
                quote within minutes.
              </p>
            </div>

            {/* Search */}
            <form
              action="/search"
              method="GET"
              className="w-full"
            >
              <label className="eyebrow block mb-2">Search</label>
              <div className="flex items-center gap-2 h-12 rounded-[8px] bg-paper-3 border border-[color:var(--line)] focus-within:border-ink px-4 transition-colors">
                <SearchIcon size={16} className="text-ink-3 flex-shrink-0" />
                <input
                  name="q"
                  className="flex-1 bg-transparent outline-none text-[14px] text-ink placeholder:text-ink-3"
                  placeholder="Bumpers, headlights, OEM number…"
                />
                <button
                  type="submit"
                  className="px-4 h-8 rounded-[6px] bg-ink text-paper text-[12px] font-semibold tracking-tight hover:bg-[color:var(--ink-2)] transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ───── PRIMARY ACTIONS ──────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--line)] rounded-[10px] border border-[color:var(--line)] overflow-hidden">
          <Link
            href="/search"
            className="group bg-paper hover:bg-paper-2 transition-colors p-7 md:p-9 flex flex-col gap-4"
          >
            <SearchIcon size={20} className="text-ink-2 group-hover:text-ink transition-colors" />
            <div>
              <div className="h3 text-ink">Browse parts</div>
              <p className="text-[13px] text-ink-3 mt-1.5">
                10k+ catalogued from verified suppliers nationwide.
              </p>
            </div>
            <div className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              Open catalogue
              <ArrowRightIcon
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </Link>

          <Link
            href="/buyer/requests/new"
            className="group bg-paper hover:bg-paper-2 transition-colors p-7 md:p-9 flex flex-col gap-4"
          >
            <PlusIcon size={20} className="text-[color:var(--accent)]" />
            <div>
              <div className="h3 text-ink">Post a request</div>
              <p className="text-[13px] text-ink-3 mt-1.5">
                Let suppliers compete on price, quality, and ETA — live.
              </p>
            </div>
            <div className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-[color:var(--accent-ink)]">
              Start a request
              <ArrowRightIcon
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* ───── CATEGORIES ───────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-16">
          <SectionHead
            title="Shop by category"
            link={{ label: "All categories", href: "/search" }}
          />
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-px bg-[color:var(--line)] border border-[color:var(--line)] rounded-[10px] overflow-hidden">
            {CATEGORIES.map(({ label, Icon, q }) => (
              <Link
                key={label}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="group flex flex-col items-center justify-center gap-2.5 bg-paper hover:bg-paper-2 py-6 px-3 transition-colors"
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

      {/* ───── YOUR REQUESTS ────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-16">
          <SectionHead
            title="Your requests"
            subtitle="Live quotes will appear as soon as suppliers respond"
            link={{ label: "View all", href: "/buyer/requests" }}
          />

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[88px] rounded-[10px] fms-shimmer"
                  />
                ))}
              </div>
            ) : open.length === 0 ? (
              <div className="border border-dashed border-[color:var(--line-2)] rounded-[10px] p-12 md:p-16 text-center">
                <div className="h3 mb-2">No open requests yet</div>
                <div className="text-[13px] text-ink-3 mb-6 max-w-md mx-auto">
                  Post one and verified suppliers will quote within minutes.
                </div>
                <Link href="/buyer/requests/new">
                  <Button variant="primary" size="md" rightIcon={<ArrowRightIcon size={14} />}>
                    Post a request
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {open.slice(0, 6).map((r) => (
                  <Link
                    key={r.id}
                    href={`/buyer/requests/${r.id}`}
                    className="group flex items-center gap-4 p-4 md:p-5 rounded-[10px] border border-[color:var(--line)] hover:border-[color:var(--line-2)] bg-paper fms-press transition-colors"
                  >
                    <div className="w-11 h-11 rounded-[8px] bg-paper-3 flex items-center justify-center flex-shrink-0">
                      <PackageIcon size={18} className="text-ink-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-ink truncate tracking-tight">
                        {r.partName}
                      </div>
                      <div className="text-[12px] text-ink-3 mt-0.5 truncate">
                        {r.make} {r.model} · {r.year}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Chip
                        variant={r.bidCount ? "ok" : "default"}
                        size="sm"
                        dot
                      >
                        {r.bidCount ?? 0} quote{(r.bidCount ?? 0) === 1 ? "" : "s"}
                      </Chip>
                      <ArrowRightIcon
                        size={14}
                        className="text-ink-3 group-hover:text-ink group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───── TOP PICKS ────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-16">
          <SectionHead
            title="Curated selection"
            subtitle="Hand-picked from verified suppliers"
            link={{ label: "Browse all", href: "/search" }}
          />

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-[10px] fms-shimmer"
                  />
                ))}
              </div>
            ) : featured.length === 0 ? (
              <div className="border border-dashed border-[color:var(--line-2)] rounded-[10px] p-12 text-center">
                <div className="text-[14px] text-ink-3">No products to show.</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {featured.map((p) => (
                  <ProductTile key={p.id} product={p} rating={p.rating} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────── */

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
        {subtitle && <p className="text-[13px] text-ink-3 mt-2">{subtitle}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-[12.5px] font-semibold text-ink hover:text-[color:var(--accent-ink)] tracking-tight flex items-center gap-1 whitespace-nowrap"
        >
          {link.label}
          <ArrowRightIcon size={13} />
        </Link>
      )}
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
              <PackageIcon size={28} className="text-ink-3 opacity-30" />
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
        <div className="p-4 border-t border-[color:var(--line)]">
          {p.category && (
            <div className="eyebrow !text-[10px] mb-1.5 truncate">{p.category}</div>
          )}
          <h3 className="text-[14.5px] font-semibold leading-snug text-ink line-clamp-2 min-h-[36px] tracking-tight">
            {p.name}
          </h3>
          <div className="text-[11.5px] text-ink-3 mt-1.5 truncate">
            {p.supplierName || "Verified supplier"}
          </div>
          <div className="mt-4 pt-3.5 border-t border-[color:var(--line)] flex items-center justify-between gap-2">
            <span className="text-[15px] font-semibold text-ink tabular leading-none">
              {formatPrice(priceNum)}
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
