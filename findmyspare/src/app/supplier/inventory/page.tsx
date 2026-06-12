"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/features/SearchBar";
import { FilterPills } from "@/components/features/FilterPills";
import { InventoryItemCard } from "@/components/features/InventoryItemCard";
import { StockAdjustDialog } from "@/components/features/StockAdjustDialog";
import { StockHistoryDrawer } from "@/components/features/StockHistoryDrawer";
import { PlusIcon } from "@/lib/icons";
import { inventoryApi } from "@/lib/api";
import type { InventoryListParams } from "@/lib/api/inventory";
import type { InventoryItem, InventorySummary } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const FILTERS = ["All", "Drafts", "Active", "Low stock", "Out of stock"] as const;
type FilterLabel = (typeof FILTERS)[number];

function filterToParams(filter: FilterLabel): Partial<InventoryListParams> {
  switch (filter) {
    case "Drafts":
      return { status: "draft" };
    case "Active":
      return { status: "active" };
    case "Low stock":
      return { lowStock: true };
    case "Out of stock":
      return { status: "out_of_stock" };
    default:
      return {};
  }
}

export default function SupplierInventoryPage() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterLabel>(
    searchParams.get("lowStock") === "true" ? "Low stock" : "All"
  );
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        inventoryApi.list({ ...filterToParams(filter), search: query || undefined, limit: 50 }),
        inventoryApi.summary(),
      ]);
      setItems(listRes.items);
      setSummary(summaryRes);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load inventory"));
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Inventory"
        rightAction={
          <Link href="/supplier/inventory/new">
            <Button variant="primary" className="!h-9 !text-[12px]">
              <PlusIcon size={14} /> Add item
            </Button>
          </Link>
        }
      />

      <div className="px-5 pb-8 space-y-4">
        {/* Summary strip */}
        {summary && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Items", value: summary.totalItems },
              { label: "Drafts", value: summary.drafts },
              { label: "Low", value: summary.lowStock },
              { label: "Out", value: summary.outOfStock },
            ].map((s) => (
              <div key={s.label} className="bg-paper rounded-[14px] p-3 text-center shadow-[var(--shadow-sm)]">
                <div className="mono text-[18px] font-bold text-ink leading-none">{s.value}</div>
                <div className="text-[10px] font-bold text-ink-3 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <SearchBar
          placeholder="Search your inventory…"
          value={search}
          onChange={setSearch}
          onSubmit={() => setQuery(search)}
        />

        <FilterPills
          filters={FILTERS.map((f) => ({ label: f, active: f === filter }))}
          onToggle={(label) => setFilter(label as FilterLabel)}
        />

        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : items.length === 0 ? (
          <Card className="text-center !p-8">
            <div className="text-[14px] font-medium mb-1">Nothing here yet</div>
            <div className="text-[12px] text-ink-3 mb-4">
              Add an inventory item — keep it as a draft or publish it to the marketplace.
            </div>
            <Link href="/supplier/inventory/new">
              <Button variant="primary">
                <PlusIcon size={16} /> Add item
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onAdjust={setAdjustItem}
                onHistory={setHistoryItem}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </div>

      {adjustItem && (
        <StockAdjustDialog
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onAdjusted={load}
        />
      )}
      {historyItem && (
        <StockHistoryDrawer
          productId={historyItem.id}
          productName={historyItem.name}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}
