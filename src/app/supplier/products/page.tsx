"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PlusIcon } from "@/lib/icons";
import { productsApi } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await productsApi.mine();
      setProducts(res.products);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePause(p: ProductSummary) {
    const next = p.status === "active" ? "paused" : "active";
    try {
      await productsApi.update(p.id, { status: next });
      toast.success(`Marked ${next}`);
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Update failed"));
    }
  }

  async function remove(p: ProductSummary) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await productsApi.remove(p.id);
      toast.success("Deleted");
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Delete failed"));
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="My Products"
        rightAction={
          <Link href="/supplier/products/new">
            <Button variant="primary" className="!h-9 !text-[12px]">
              <PlusIcon size={14} /> Add
            </Button>
          </Link>
        }
      />

      <div className="px-5 pb-8">
        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : products.length === 0 ? (
          <Card className="text-center !p-8">
            <div className="text-[14px] font-medium mb-1">No products yet</div>
            <div className="text-[12px] text-ink-3 mb-4">Add your first part to start receiving enquiries.</div>
            <Link href="/supplier/products/new">
              <Button variant="primary">
                <PlusIcon size={16} /> Add product
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((p) => (
              <Card key={p.id} className="!p-4 flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-[10px] flex-shrink-0 overflow-hidden"
                    style={{ background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)" }}
                  >
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium leading-tight">{p.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">
                      {p.category || "—"} {p.partNumber ? `· ${p.partNumber}` : ""}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="mono text-[14px] font-semibold">{formatPrice(parseFloat(p.price))}</span>
                      <span className="text-[10px] text-ink-3">· {p.stockQuantity} in stock</span>
                    </div>
                  </div>
                  <Chip
                    variant={p.status === "active" ? "ok" : p.status === "paused" ? "warn" : "default"}
                  >
                    {p.status}
                  </Chip>
                </div>
                <div className="flex gap-2 mt-1">
                  <Link href={`/supplier/products/${p.id}/edit`} className="flex-1">
                    <Button variant="default" block className="!h-9 !text-[12px]">Edit</Button>
                  </Link>
                  <Button
                    variant="default"
                    className="!h-9 !text-[12px] flex-1"
                    onClick={() => togglePause(p)}
                  >
                    {p.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    variant="default"
                    className="!h-9 !text-[12px] !text-danger"
                    onClick={() => remove(p)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
