"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { inventoryApi } from "@/lib/api";
import type { InventoryItem, StockAdjustReason } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass =
  "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

const ADD_REASONS: { value: StockAdjustReason; label: string }[] = [
  { value: "received", label: "Stock received" },
  { value: "returned", label: "Customer return" },
  { value: "correction", label: "Correction" },
];
const REMOVE_REASONS: { value: StockAdjustReason; label: string }[] = [
  { value: "damaged", label: "Damaged / lost" },
  { value: "correction", label: "Correction" },
];

export interface StockAdjustDialogProps {
  item: InventoryItem;
  onClose: () => void;
  onAdjusted: () => void;
}

export function StockAdjustDialog({ item, onClose, onAdjusted }: StockAdjustDialogProps) {
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState<StockAdjustReason>("received");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons = direction === "add" ? ADD_REASONS : REMOVE_REASONS;
  const delta = direction === "add" ? amount : -amount;
  const resulting = item.stockQuantity + delta;
  const invalid = amount < 1 || resulting < 0;

  function switchDirection(next: "add" | "remove") {
    setDirection(next);
    setReason(next === "add" ? "received" : "damaged");
  }

  async function submit() {
    if (invalid) return;
    setSubmitting(true);
    try {
      await inventoryApi.adjust(item.id, { delta, reason, note: note.trim() || undefined });
      toast.success(`Stock updated to ${resulting}`);
      onAdjusted();
      onClose();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Adjustment failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-paper rounded-t-[24px] sm:rounded-[20px] shadow-[var(--shadow-card)] p-5 max-h-[90vh] overflow-y-auto">
        <div className="display text-[18px] text-ink leading-tight">Adjust stock</div>
        <div className="text-[12px] text-ink-3 mt-0.5 mb-4 truncate">{item.name}</div>

        {/* Direction toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(["add", "remove"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => switchDirection(d)}
              className={`h-10 rounded-[12px] text-[13px] font-bold border transition-all ${
                direction === d
                  ? d === "add"
                    ? "bg-success-wash text-[color:var(--success)] border-[color:var(--success)]/30"
                    : "bg-danger-wash text-[color:var(--danger)] border-[color:var(--danger)]/30"
                  : "bg-paper-2 text-ink-3 border-line"
              }`}
            >
              {d === "add" ? "Add stock" : "Remove stock"}
            </button>
          ))}
        </div>

        {/* Amount stepper */}
        <label className={labelClass}>Quantity</label>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            className="w-11 h-11 rounded-[12px] bg-paper-2 border border-line text-ink text-lg font-bold"
          >
            −
          </button>
          <input
            className={fieldClass + " text-center !h-11 flex-1"}
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value || "1", 10)))}
          />
          <button
            type="button"
            onClick={() => setAmount((a) => a + 1)}
            className="w-11 h-11 rounded-[12px] bg-paper-2 border border-line text-ink text-lg font-bold"
          >
            +
          </button>
        </div>

        {/* Reason */}
        <label className={labelClass}>Reason</label>
        <select
          className={fieldClass + " mb-4"}
          value={reason}
          onChange={(e) => setReason(e.target.value as StockAdjustReason)}
        >
          {reasons.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Note */}
        <label className={labelClass}>Note (optional)</label>
        <input
          className={fieldClass + " mb-4"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. PO #4821"
        />

        <div className="flex items-center justify-between px-1 mb-4">
          <span className="text-[12px] text-ink-3">New stock level</span>
          <span className={`mono text-[16px] font-bold ${resulting < 0 ? "text-danger" : "text-ink"}`}>
            {item.stockQuantity} → {resulting}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="default" block onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" block onClick={submit} loading={submitting} disabled={invalid}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
