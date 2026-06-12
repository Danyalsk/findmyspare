"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicNav } from "@/components/layout/PublicNav";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/features/ProductCard";
import { SearchBar } from "@/components/features/SearchBar";
import { FilterPills } from "@/components/features/FilterPills";
import { productsApi } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/constants";
import { ArrowRightIcon } from "@/lib/icons";

const QUICK_FILTERS = [
  "Engine",
  "Brakes",
  "Lighting",
  "Body",
  "Suspension",
  "Transmission",
  "Electrical",
  "Filters",
];

function SearchContent() {
  const sp = useSearchParams();
  const initialQ = sp.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");

  async function load(search: string) {
    setLoading(true);
    try {
      const res = await productsApi.list({
        search: search || undefined,
        limit: 30,
        sort,
      });
      setResults(res.products);
      setTotal(res.pagination?.total ?? res.products.length);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to search"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ, sort]);

  function onSubmit() {
    load(query.trim());
  }

  function toggleFilter(label: string) {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  }

  const filters = useMemo(
    () =>
      QUICK_FILTERS.map((label) => ({
        label,
        active: activeFilters.includes(label),
      })),
    [activeFilters]
  );

  // Client-side category filter on top of server results.
  const displayed = useMemo(() => {
    if (activeFilters.length === 0) return results;
    const lower = activeFilters.map((f) => f.toLowerCase());
    return results.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return lower.some((f) => cat.includes(f) || name.includes(f));
    });
  }, [results, activeFilters]);

  const visibleCount = displayed.length;

  return (
    <div className="min-h-screen bg-paper-3 flex flex-col pb-12">
      <PublicNav />

      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 bg-paper-3 px-5 pt-4 pb-3 shadow-[var(--shadow-sm)]">
        <div className="max-w-7xl mx-auto">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={onSubmit}
            placeholder="Search bumpers, headlights, brake pads…"
            autoFocus
          />
          <div className="mt-3 -mx-1 px-1">
            <FilterPills
              filters={filters}
              onToggle={toggleFilter}
              onRemove={(label) =>
                setActiveFilters((prev) => prev.filter((f) => f !== label))
              }
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-5 pt-4">
        {/* Result meta */}
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <div className="display text-[20px] text-ink leading-tight">
              {loading
                ? "Searching…"
                : `${visibleCount} ${visibleCount === 1 ? "result" : "results"}`}
            </div>
            {query.trim() && (
              <div className="text-[12px] text-ink-3 mt-0.5">
                for &ldquo;<span className="font-bold text-ink-2">{query}</span>&rdquo;
              </div>
            )}
          </div>
          <SortMenu sort={sort} onChange={setSort} />
        </div>

        {/* Active filters summary */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">
              Filtered:
            </span>
            {activeFilters.map((f) => (
              <Chip
                key={f}
                variant="accent"
                size="sm"
                onRemove={() =>
                  setActiveFilters((prev) => prev.filter((x) => x !== f))
                }
              >
                {f}
              </Chip>
            ))}
            <button
              onClick={() => setActiveFilters([])}
              className="text-[11px] font-bold text-[color:var(--accent-ink)] hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[16px] fms-shimmer" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState query={query} hasFilters={activeFilters.length > 0} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {displayed.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={formatPrice(parseFloat(p.price))}
                vehicle={p.supplierName || "Supplier"}
                rating={4.5}
                image={p.images?.[0]}
                imageLabel={p.category || undefined}
                inStock={p.stockQuantity > 0}
                href={`/product/${p.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SortMenu({
  sort,
  onChange,
}: {
  sort: "newest" | "price_asc" | "price_desc";
  onChange: (s: "newest" | "price_asc" | "price_desc") => void;
}) {
  const label =
    sort === "newest"
      ? "Newest"
      : sort === "price_asc"
      ? "Price ↑"
      : "Price ↓";

  return (
    <details className="relative">
      <summary className="list-none cursor-pointer flex items-center gap-1.5 px-3 h-9 rounded-full bg-paper shadow-[var(--shadow-sm)] text-[12px] font-bold text-ink fms-press">
        Sort: <span className="text-[color:var(--accent-ink)]">{label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-ink-3"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute right-0 mt-2 w-44 bg-paper rounded-[14px] shadow-[var(--shadow-lifted)] overflow-hidden z-20">
        {[
          { key: "newest", label: "Newest" },
          { key: "price_asc", label: "Price: low → high" },
          { key: "price_desc", label: "Price: high → low" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key as "newest" | "price_asc" | "price_desc")}
            className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold hover:bg-paper-2 ${
              sort === opt.key ? "text-[color:var(--accent-ink)] bg-accent-wash" : "text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </details>
  );
}

function EmptyState({ query, hasFilters }: { query: string; hasFilters: boolean }) {
  return (
    <div className="bg-paper rounded-[20px] shadow-[var(--shadow-card)] p-10 text-center">
      <div className="display text-[18px] text-ink mb-1">No products found</div>
      <div className="text-[13px] text-ink-3 mb-5">
        {hasFilters
          ? "Try removing filters, or post a request and verified suppliers will quote for you."
          : query.trim()
          ? `Nothing matches "${query}". Try a different keyword or post a request.`
          : "Post a request and verified suppliers will quote for you."}
      </div>
      <Link href="/buyer/requests/new" className="inline-block">
        <Button variant="primary" size="md" rightIcon={<ArrowRightIcon size={14} />}>
          Post a request
        </Button>
      </Link>
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
