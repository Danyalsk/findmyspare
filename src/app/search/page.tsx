"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { productsApi } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { SearchIcon } from "@/lib/icons";

function SearchContent() {
  const sp = useSearchParams();
  const initialQ = sp.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  async function load(search: string) {
    setLoading(true);
    try {
      const res = await productsApi.list({
        search: search || undefined,
        limit: 30,
        sort: "newest",
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
  }, [initialQ]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(query.trim());
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <PublicNav />

      <div className="max-w-7xl mx-auto w-full px-5 py-6">
        <form onSubmit={onSubmit} className="mb-5">
          <div className="h-12 rounded-[12px] bg-paper-2 border border-line flex items-center px-3 gap-2.5 focus-within:border-accent">
            <SearchIcon size={18} className="text-ink-3" />
            <input
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search parts, vehicles, brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-baseline justify-between mb-3">
          <div className="font-semibold">
            {loading ? "Loading…" : `${total} match${total === 1 ? "" : "es"}`}
          </div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.1em]">SORT · NEWEST</div>
        </div>

        {!loading && results.length === 0 && (
          <Card className="text-center !p-10">
            <div className="text-[14px] font-medium mb-1">No products found</div>
            <div className="text-[12px] text-ink-3 mb-3">
              Post a request and verified suppliers will bid for you.
            </div>
            <Link
              href="/buyer/requests/new"
              className="text-accent-ink text-[13px] font-medium hover:underline"
            >
              Post a request →
            </Link>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}>
              <Card className="!p-3 cursor-pointer hover:border-accent/40 transition-colors group">
                <div
                  className="aspect-square rounded-[10px] mb-2.5 overflow-hidden relative"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                  }}
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="absolute left-2 bottom-2 mono text-[9px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-1.5 py-0.5 rounded border border-line">
                      {(p.category || "PART").slice(0, 8)}
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-medium leading-[1.25] line-clamp-2">{p.name}</div>
                <div className="text-[11px] text-ink-3 mt-0.5">{p.supplierName || "Supplier"}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="mono text-[10px] text-ink-3">₹</span>{" "}
                    <span className="mono text-[15px] font-semibold">
                      {parseFloat(p.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Chip variant={p.stockQuantity > 0 ? "ok" : "warn"}>
                    {p.stockQuantity > 0 ? "In stock" : "Out"}
                  </Chip>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
