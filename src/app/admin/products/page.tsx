"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SearchIcon } from "@/lib/icons";
import { adminApi } from "@/lib/api/admin";
import type { ProductSummary } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/constants";

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(q: string) {
    setLoading(true);
    try {
      const res = await adminApi.listProducts({ search: q || undefined });
      setRows(res.products);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="All products" backHref="/admin" />
      <div className="px-5 pb-12 max-w-5xl w-full mx-auto space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); load(query.trim()); }}>
          <div className="h-11 rounded-[12px] bg-paper-2 border border-line flex items-center px-3 gap-2.5 focus-within:border-accent">
            <SearchIcon size={18} className="text-ink-3" />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-[13px] text-ink-3 text-center py-12">No products.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <Card className="!p-3 flex items-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                  <div
                    className="w-12 h-12 rounded-[10px] flex-shrink-0 overflow-hidden"
                    style={{
                      background:
                        "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                    }}
                  >
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium leading-tight truncate">{p.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5 truncate">
                      {p.category || "—"} · {p.supplierName || "Supplier"}
                    </div>
                  </div>
                  <span className="mono text-sm font-semibold">{formatPrice(parseFloat(p.price))}</span>
                  <Chip variant={p.status === "active" ? "ok" : p.status === "paused" ? "warn" : "default"}>
                    {p.status}
                  </Chip>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
