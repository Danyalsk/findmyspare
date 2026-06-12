"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StockBadge } from "@/components/features/StockBadge";
import { inventoryApi } from "@/lib/api";
import type { InventoryItem } from "@/lib/types";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";

export interface InventoryItemCardProps {
  item: InventoryItem;
  onAdjust: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
  onChanged: () => void;
}

export function InventoryItemCard({ item, onAdjust, onHistory, onChanged }: InventoryItemCardProps) {
  const [busy, setBusy] = useState(false);
  const isDraft = item.status === "draft";

  async function publish() {
    setBusy(true);
    try {
      await inventoryApi.publish(item.id);
      toast.success("Published to marketplace");
      onChanged();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Publish failed"));
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    if (!confirm(`Delist "${item.name}"? Buyers will no longer see it.`)) return;
    setBusy(true);
    try {
      await inventoryApi.unpublish(item.id);
      toast.success("Moved to drafts");
      onChanged();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Unpublish failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="!p-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-[10px] flex-shrink-0 overflow-hidden"
          style={{ background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)" }}
        >
          {item.images?.[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium leading-tight">{item.name}</div>
          <div className="text-[11px] text-ink-3 mt-0.5">
            {item.category || "—"} {item.partNumber ? `· ${item.partNumber}` : ""}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="mono text-[14px] font-semibold">{formatPrice(parseFloat(item.price))}</span>
          </div>
        </div>
        <StockBadge status={item.status} stockQuantity={item.stockQuantity} lowStockThreshold={item.lowStockThreshold} />
      </div>

      <div className="flex flex-wrap gap-2 mt-1">
        <Button variant="default" className="!h-9 !text-[12px] flex-1" onClick={() => onAdjust(item)}>
          Adjust
        </Button>
        {isDraft ? (
          <>
            <Button variant="primary" className="!h-9 !text-[12px] flex-1" onClick={publish} loading={busy}>
              Publish
            </Button>
            <Link href={`/supplier/products/${item.id}/edit?publish=1`} className="flex-1">
              <Button variant="default" block className="!h-9 !text-[12px]">Review</Button>
            </Link>
          </>
        ) : (
          <>
            <Button variant="default" className="!h-9 !text-[12px] flex-1" onClick={unpublish} loading={busy}>
              Unpublish
            </Button>
            <Link href={`/supplier/products/${item.id}/edit`} className="flex-1">
              <Button variant="default" block className="!h-9 !text-[12px]">Edit</Button>
            </Link>
          </>
        )}
        <Button variant="default" className="!h-9 !text-[12px]" onClick={() => onHistory(item)}>
          History
        </Button>
      </div>
    </Card>
  );
}
