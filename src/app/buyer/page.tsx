"use client";

import Link from "next/link";
import { BellIcon, ScanIcon, CameraIcon, BoltIcon, ArrowRightIcon } from "@/lib/icons";
import { SearchBar } from "@/components/features/SearchBar";
import { ProductCard } from "@/components/features/ProductCard";
import { Card } from "@/components/ui/Card";

/* ═══════════════════════════════════════════════════════
   Buyer Home — Screen 02
   Garage-aware home with search, quick actions,
   open request hero, and trending products grid.
   ═══════════════════════════════════════════════════════ */

/* ── Mock trending products (INR) ── */
const trending = [
  { id: "1", name: "Alternator 90A",  price: "₹8,400",  vehicle: "Toyota · '01–'08",    rating: 4.9, label: "ALTERNATOR" },
  { id: "2", name: "Brake disc pair", price: "₹5,200",  vehicle: "Nissan · X-Trail",    rating: 4.7, label: "BRAKE DISC" },
  { id: "3", name: "Timing belt kit", price: "₹3,950",  vehicle: "Honda · Fit",          rating: 4.8, label: "BELT KIT"  },
  { id: "4", name: "Headlamp LH",    price: "₹12,000", vehicle: "Subaru · Forester",   rating: 4.6, label: "HEADLAMP"  },
];

const quickActions = [
  { icon: ScanIcon,   label: "Scan VIN",     href: "/buyer/scan" },
  { icon: CameraIcon, label: "Photo search", href: "/buyer/scan" },
  { icon: BoltIcon,   label: "Post request", href: "/buyer/requests" },
];

export default function BuyerHomePage() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* ── Header: garage context + notifications ── */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
            GARAGE · MARUTI SWIFT
          </div>
          <div className="font-semibold text-[17px] mt-0.5">
            Good morning, Daniel
          </div>
        </div>
        <Link href="/buyer/orders" className="relative">
          <div className="w-10 h-10 rounded-[12px] bg-paper-2 border border-line flex items-center justify-center">
            <BellIcon size={20} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-paper" />
        </Link>
      </div>

      {/* ── Search bar ── */}
      <div className="px-5 pt-[18px]">
        <SearchBar />
      </div>

      {/* ── Quick action trio ── */}
      <div className="px-5 pt-3.5 grid grid-cols-3 gap-2">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="p-3.5 px-2.5 rounded-[12px] bg-paper border border-line flex flex-col items-start gap-2 hover:border-accent/40 transition-colors active:scale-[0.97]"
          >
            <div className="w-7 h-7 text-accent-ink">
              <a.icon size={28} />
            </div>
            <div className="text-xs font-medium leading-[1.2]">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* ── Open request hero card ── */}
      <div className="px-5 pt-[18px]">
        <div className="mono text-[10px] tracking-[0.12em] text-ink-3 mb-2">
          YOUR OPEN REQUEST
        </div>
        <Card variant="dark" className="!p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs opacity-60 mono">REQ-2041</div>
              <div className="font-medium mt-1 text-[15px]">
                Front brake caliper · &apos;18 Swift
              </div>
            </div>
            <div className="text-[11px] bg-white/[0.14] px-2 py-1 rounded-md">
              4h left
            </div>
          </div>
          <div className="flex items-center gap-3.5 mt-3.5">
            {/* Avatar stack */}
            <div className="flex">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[26px] h-[26px] rounded-full border-2 border-ink"
                  style={{
                    marginLeft: i ? -8 : 0,
                    background: `oklch(${0.5 + i * 0.05} 0.02 ${i * 60})`,
                  }}
                />
              ))}
            </div>
            <div className="flex-1 text-[13px]">7 suppliers responding</div>
            <Link href="/buyer/requests/2041">
              <ArrowRightIcon size={20} />
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Trending near you ── */}
      <div className="px-5 pt-[22px] flex items-baseline justify-between">
        <div className="serif text-[22px]">Trending near you</div>
        <div className="mono text-[10px] text-ink-3 tracking-[0.1em]">
          DELHI · 12KM
        </div>
      </div>

      <div className="px-5 pt-2.5 pb-5 grid grid-cols-2 gap-2.5">
        {trending.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            vehicle={p.vehicle}
            rating={p.rating}
            imageLabel={p.label}
          />
        ))}
      </div>
    </div>
  );
}
