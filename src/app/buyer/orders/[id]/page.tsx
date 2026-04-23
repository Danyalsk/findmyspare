"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackIcon, ShieldIcon, CheckIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { EscrowTimeline, EscrowStep } from "@/components/features/EscrowTimeline";
import { formatPrice } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { ordersApi } from "@/lib/api";
import type { OrderDetail, OrderStatus } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

function statusChipVariant(s: string): "ok" | "warn" | "danger" | "default" {
  if (s === "completed") return "ok";
  if (["disputed", "cancelled"].includes(s)) return "danger";
  if (["shipped", "in_transit"].includes(s)) return "warn";
  return "default";
}

function statusIndex(status: OrderStatus) {
  const steps: OrderStatus[] = [
    "placed",
    "confirmed",
    "shipped",
    "in_transit",
    "delivered",
    "completed",
  ];
  return steps.indexOf(status);
}

function formatTs(value?: string | null) {
  if (!value) return undefined;
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTimeline(order: OrderDetail["order"]): EscrowStep[] {
  if (order.status === "cancelled") {
    return [
      { label: "Order placed", timestamp: formatTs(order.createdAt), state: "done" },
      { label: "Cancelled", timestamp: formatTs(order.closedAt), state: "active", description: "Escrow refunded." },
    ];
  }

  if (order.status === "disputed") {
    return [
      { label: "Order placed", timestamp: formatTs(order.createdAt), state: "done" },
      { label: "Dispute raised", timestamp: formatTs(order.updatedAt), state: "active", description: "We are reviewing your issue." },
    ];
  }

  const idx = statusIndex(order.status);
  const shippedDetail =
    order.trackingNumber && order.courierService
      ? `Tracking: ${order.trackingNumber} · ${order.courierService}`
      : undefined;

  return [
    {
      label: "Order placed",
      timestamp: formatTs(order.createdAt),
      state: idx >= 0 ? "done" : "pending",
    },
    {
      label: "Supplier confirmed",
      state: idx > 0 ? "done" : idx === 0 ? "active" : "pending",
    },
    {
      label: "Dispatched",
      timestamp: idx >= 2 ? formatTs(order.updatedAt) : undefined,
      state: idx > 2 ? "done" : idx === 2 ? "active" : "pending",
      description: idx === 2 ? shippedDetail : undefined,
    },
    {
      label: "In transit",
      state: idx > 3 ? "done" : idx === 3 ? "active" : "pending",
      description: idx === 3 ? shippedDetail : undefined,
    },
    {
      label: "Delivered",
      timestamp: formatTs(order.deliveredAt),
      state: idx > 4 ? "done" : idx === 4 ? "active" : "pending",
      description: idx === 4 ? "Confirm fitment to release escrow." : undefined,
    },
    {
      label: "Escrow released",
      timestamp: formatTs(order.closedAt),
      state: idx >= 5 ? "done" : "pending",
    },
  ];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await ordersApi.get(orderId);
        if (!cancelled) setDetail(res);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load order"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const order = detail?.order;
  const amount = parseFloat(order?.totalAmount || "0");
  const steps = useMemo(() => (order ? buildTimeline(order) : []), [order]);

  const canConfirm = order?.status === "delivered";
  const canDispute = order?.status === "delivered";

  async function handleConfirmFitment() {
    if (!order) return;
    setSaving(true);
    try {
      await ordersApi.updateStatus(order.id, { status: "completed" });
      setDetail((prev) => (prev ? { ...prev, order: { ...prev.order, status: "completed", closedAt: new Date().toISOString() } } : prev));
      toast.success("Fitment confirmed. Escrow released.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not confirm fitment."));
    } finally {
      setSaving(false);
    }
  }

  async function handleRaiseDispute() {
    if (!order) return;
    if (!disputeReason.trim()) {
      toast.error("Please describe the issue first.");
      return;
    }

    setSaving(true);
    try {
      await ordersApi.updateStatus(order.id, { status: "disputed" });
      setDetail((prev) => (prev ? { ...prev, order: { ...prev.order, status: "disputed" } } : prev));
      setShowDispute(false);
      toast.info("Dispute raised successfully.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not raise dispute."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading order...</div>;
  }

  if (error || !detail || !order) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error || "Order not found"}</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="serif text-[22px] leading-[1.05] truncate">{detail.items[0]?.productName || "Order"}</div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.08em] mt-0.5">{order.id.toUpperCase().slice(0, 10)}</div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4 pb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <Chip variant={statusChipVariant(order.status)}>
            {order.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Chip>
          {order.trackingNumber && !["completed", "cancelled"].includes(order.status) && (
            <span className="mono text-[10px] text-ink-3 tracking-[0.06em]">
              {order.courierService} · {order.trackingNumber}
            </span>
          )}
        </div>

        {!(["completed", "cancelled", "disputed"] as string[]).includes(order.status) && (
          <Card variant="dark" className="!p-4">
            <div className="flex items-center gap-2.5">
              <ShieldIcon size={16} className="opacity-60 flex-shrink-0" />
              <div className="mono text-[10px] opacity-50 tracking-[0.08em]">ESCROW HOLDS</div>
              <div className="mono text-[16px] font-semibold ml-auto">{formatPrice(amount)}</div>
            </div>
            {canConfirm && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs opacity-70 leading-[1.4] mb-3">
                  Confirm fitment to release {formatPrice(amount)} to supplier.
                </div>
                <Button variant="accent" block loading={saving} onClick={handleConfirmFitment}>
                  <CheckIcon size={15} /> Confirm fitment & release
                </Button>
              </div>
            )}
          </Card>
        )}

        {order.status === "completed" && (
          <Card variant="accent" className="!p-3.5 flex items-center gap-2.5">
            <CheckIcon size={16} className="text-accent-ink flex-shrink-0" />
            <div className="text-xs text-accent-ink font-medium">Payment released to supplier</div>
          </Card>
        )}

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-3">SHIPMENT PROGRESS</div>
          <EscrowTimeline steps={steps} />
        </div>

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">SUPPLIER</div>
          <div className="flex items-center gap-3 p-3.5 border border-line rounded-[12px]">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">{detail.supplier?.businessName || detail.supplier?.name || "Supplier"}</div>
              {detail.items[0]?.partNumber && (
                <div className="mono text-[10px] text-ink-3 mt-0.5">{detail.items[0]?.partNumber}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">DELIVERY ADDRESS</div>
          <Card className="!p-3.5">
            {detail.shippingAddress ? (
              <>
                <div className="text-[13px] font-medium">{detail.shippingAddress.label || "Address"}</div>
                <div className="text-[11px] text-ink-3 mt-0.5 leading-[1.4]">
                  {detail.shippingAddress.line1}
                  {detail.shippingAddress.line2 ? `, ${detail.shippingAddress.line2}` : ""}
                  {`, ${detail.shippingAddress.city}, ${detail.shippingAddress.state} — ${detail.shippingAddress.postalCode}`}
                </div>
              </>
            ) : (
              <div className="text-[11px] text-ink-3">No shipping address attached</div>
            )}
          </Card>
        </div>

        <div className="pt-2 border-t border-line space-y-2">
          {detail.items.map((item) => (
            <div key={item.id} className="flex justify-between text-[13px]">
              <span className="text-ink-3">{item.productName || "Item"} ×{item.quantity}</span>
              <span className="mono">{formatPrice(parseFloat(item.unitPrice || "0") * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-line">
            <span>Total</span>
            <span className="mono">{formatPrice(amount)}</span>
          </div>
        </div>

        {canDispute && (
          showDispute ? (
            <div className="border border-danger/30 rounded-[14px] p-4 flex flex-col gap-3">
              <div className="text-[13px] font-medium text-danger">Raise a dispute</div>
              <div className="text-[11px] text-ink-3 leading-[1.4]">Describe your issue before submitting.</div>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Wrong part, damage, or other issue"
                className="w-full rounded-[10px] border border-line bg-paper-2 px-3 py-2.5 text-[12px] resize-none outline-none focus:border-ink transition-colors"
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="default" className="flex-1 !h-9 !text-[12px]" onClick={() => setShowDispute(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1 !h-9 !text-[12px] !border-danger !text-danger"
                  loading={saving}
                  onClick={handleRaiseDispute}
                >
                  Submit dispute
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDispute(true)}
              className="text-[12px] text-ink-3 hover:text-danger transition-colors text-center py-1"
            >
              Problem with this order? Raise a dispute
            </button>
          )
        )}
      </div>
    </div>
  );
}
