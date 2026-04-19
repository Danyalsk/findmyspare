"use client";

import Link from "next/link";
import { BackIcon, SearchIcon, StarIcon } from "@/lib/icons";
import { FilterPills, FilterItem } from "@/components/features/FilterPills";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   Search & Filters — Screen 03
   Faceted search with filter pills, price histogram,
   and ranked result list.
   ═══════════════════════════════════════════════════════ */

const initialFilters: FilterItem[] = [
  { label: "Maruti Swift ×", active: true },
  { label: "2015–2022 ×", active: true },
  { label: "OEM ×", active: true },
  { label: "Delhi ×", active: true },
];

const histogram = [5, 8, 11, 18, 22, 28, 26, 22, 18, 14, 16, 22, 18, 12, 8, 6, 5, 4, 3, 2];

const results = [
  {
    id: "1",
    name: "OEM Brake pad set (front)",
    price: "3,200",
    vehicle: "Maruti Swift 2016+",
    supplier: "Kirinyaga Parts · 4.9 ★",
    status: "ok" as const,
    statusLabel: "In stock · 12 pcs",
    label: "BRAKE PADS",
  },
  {
    id: "2",
    name: "Aftermarket ceramic pads",
    price: "2,450",
    vehicle: "Fits Swift / Baleno",
    supplier: "BestSpares IN · 4.6 ★",
    status: "warn" as const,
    statusLabel: "Ships 2–3 days",
    label: "CERAMIC",
  },
  {
    id: "3",
    name: "Premium OEM pad + sensor",
    price: "5,980",
    vehicle: "Maruti Swift ZXi+",
    supplier: "Genuine Motors · 4.8 ★",
    status: "ok" as const,
    statusLabel: "In stock · 4 pcs",
    label: "OEM PAD",
  },
];

export default function SearchPage() {
  const [filters, setFilters] = useState(initialFilters);

  const handleRemoveFilter = (label: string) => {
    setFilters((prev) => prev.filter((f) => f.label !== label));
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* ── Top bar: back + search input ── */}
      <div className="px-5 pt-4 flex gap-2.5 items-center">
        <Link
          href="/buyer"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="flex-1 h-11 rounded-[12px] bg-paper-2 border border-line flex items-center px-3 gap-2.5">
          <span className="text-ink-3">
            <SearchIcon size={18} />
          </span>
          <span className="text-sm">brake pads swift</span>
          <span className="mono text-[11px] text-ink-3 ml-auto">347</span>
        </div>
      </div>

      {/* ── Active facets as pills ── */}
      <div className="px-5 pt-3.5">
        <FilterPills
          filters={filters}
          onRemove={handleRemoveFilter}
          onAdd={() => {}}
        />
      </div>

      {/* ── Price slider with histogram ── */}
      <div className="px-5 pt-[18px]">
        <div className="flex justify-between items-baseline">
          <div className="mono text-[10px] text-ink-3 tracking-[0.1em]">
            PRICE · INR
          </div>
          <div className="text-xs mono">2,400 — 6,800</div>
        </div>
        <div className="mt-2.5 relative h-11">
          {/* Histogram bars */}
          <div className="flex items-end gap-[3px] h-[30px] absolute left-0 right-0 top-0">
            {histogram.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h * 1.1}px`,
                  background: i >= 3 && i <= 10 ? "var(--ink)" : "var(--line-2)",
                }}
              />
            ))}
          </div>
          {/* Track */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-line" />
          {/* Thumbs */}
          <div className="absolute bottom-[-4px] w-2.5 h-2.5 rounded-full bg-ink" style={{ left: "15%" }} />
          <div className="absolute bottom-[-4px] w-2.5 h-2.5 rounded-full bg-ink" style={{ left: "52%" }} />
        </div>
      </div>

      {/* ── Results header ── */}
      <div className="px-5 pt-[18px] flex justify-between items-baseline">
        <div className="font-semibold">347 matches</div>
        <div className="mono text-[10px] text-ink-3 tracking-[0.1em]">
          SORT · BEST MATCH ↓
        </div>
      </div>

      {/* ── Result list ── */}
      <div className="px-5 pt-2.5 pb-5 flex flex-col gap-2.5">
        {results.map((r) => (
          <Link key={r.id} href={`/buyer/product/${r.id}`}>
            <Card className="!p-3 flex gap-3 cursor-pointer hover:border-accent/40 transition-colors">
              {/* Thumbnail */}
              <div
                className="w-[82px] h-[82px] rounded-[10px] flex-shrink-0 relative overflow-hidden"
                style={{
                  background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                }}
              >
                <span className="absolute left-1.5 bottom-1.5 mono text-[9px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-1 py-0.5 rounded border border-line">
                  {r.label}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-[1.25]">{r.name}</div>
                <div className="text-[11px] text-ink-3 mt-0.5">{r.vehicle}</div>
                <div className="text-[11px] text-ink-3 mt-0.5">{r.supplier}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="mono text-[10px] text-ink-3">₹</span>{" "}
                    <span className="mono text-[15px] font-semibold">{r.price}</span>
                  </div>
                  <Chip variant={r.status}>{r.statusLabel}</Chip>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
