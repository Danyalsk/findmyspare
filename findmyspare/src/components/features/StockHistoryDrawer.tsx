"use client";

import { useEffect, useState } from "react";
import { inventoryApi } from "@/lib/api";
import type { StockMovement } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

const REASON_LABEL: Record<string, string> = {
  initial: "Opening stock",
  received: "Received",
  damaged: "Damaged / lost",
  correction: "Correction",
  returned: "Customer return",
  order: "Order placed",
  order_cancelled: "Order cancelled",
};

export interface StockHistoryDrawerProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

export function StockHistoryDrawer({ productId, productName, onClose }: StockHistoryDrawerProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await inventoryApi.movements(productId, { limit: 50 });
        if (!cancelled) setMovements(res.movements);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load history"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm h-full bg-paper shadow-[var(--shadow-card)] flex flex-col">
        <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="display text-[17px] text-ink leading-tight">Stock history</div>
            <div className="text-[12px] text-ink-3 mt-0.5 truncate">{productName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink text-xl leading-none shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="text-[13px] text-ink-3 text-center py-10">Loading…</div>
          ) : error ? (
            <div className="text-[13px] text-danger text-center py-10">{error}</div>
          ) : movements.length === 0 ? (
            <div className="text-[13px] text-ink-3 text-center py-10">No movements yet.</div>
          ) : (
            <ol className="space-y-3">
              {movements.map((m) => {
                const positive = m.delta > 0;
                return (
                  <li key={m.id} className="flex items-start gap-3">
                    <div
                      className={`mono text-[13px] font-bold w-12 shrink-0 ${
                        positive ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"
                      }`}
                    >
                      {positive ? `+${m.delta}` : m.delta}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink">
                        {REASON_LABEL[m.reason] ?? m.reason}
                      </div>
                      <div className="text-[11px] text-ink-3 mt-0.5">
                        {m.previousQuantity} → {m.newQuantity}
                        {m.note ? ` · ${m.note}` : ""}
                      </div>
                      <div className="text-[10px] text-ink-3 mt-0.5">
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
