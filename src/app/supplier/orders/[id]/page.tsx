"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackIcon, ShieldIcon, TruckIcon, CheckIcon, PackageIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { ordersApi } from "@/lib/api";
import type { OrderDetail, OrderStatus } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

const statusConfig: Record<string, { label: string; variant: "ok" | "warn" | "danger" | "default" }> = {
  placed: { label: "New order", variant: "default" },
  confirmed: { label: "Confirmed", variant: "default" },
  shipped: { label: "Shipped", variant: "warn" },
  in_transit: { label: "In transit", variant: "warn" },
  delivered: { label: "Delivered", variant: "ok" },
  completed: { label: "Completed", variant: "ok" },
  disputed: { label: "Disputed", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

const actionForStatus: Record<
  string,
  {
    label: string;
    nextStatus: OrderStatus;
    variant: "primary" | "default" | "accent";
    icon?: ComponentType<{ size?: number }>;
  } | null
> = {
  placed: { label: "Confirm order", nextStatus: "confirmed", variant: "primary", icon: CheckIcon },
  confirmed: {
    label: "Mark packed & ready to ship",
    nextStatus: "shipped",
    variant: "primary",
    icon: PackageIcon,
  },
  shipped: { label: "Mark in transit", nextStatus: "in_transit", variant: "default", icon: TruckIcon },
  in_transit: { label: "Mark delivered", nextStatus: "delivered", variant: "default", icon: TruckIcon },
  delivered: null,
  completed: null,
  disputed: null,
  cancelled: null,
};

export default function SupplierOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [localTracking, setLocalTracking] = useState("");
  const [localCourier, setLocalCourier] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAwbInput, setShowAwbInput] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await ordersApi.get(orderId);
        if (cancelled) return;
        setDetail(res);
        setLocalTracking(res.order.trackingNumber || "");
        setLocalCourier(res.order.courierService || "");
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
  const cfg = statusConfig[order?.status || ""] ?? { label: order?.status || "", variant: "default" as const };
  const action = actionForStatus[order?.status || ""];
  const needsAwb = order?.status === "confirmed";

  const buyerName = useMemo(
    () => detail?.buyer?.name || detail?.order.buyerId.slice(0, 8) || "Buyer",
    [detail]
  );

  async function handleAction() {
    if (!order || !action) return;

    if (needsAwb && showAwbInput) {
      if (!localTracking.trim() || !localCourier.trim()) {
        toast.error("Please enter tracking number and courier name.");
        return;
      }
    }

    if (needsAwb && !showAwbInput) {
      setShowAwbInput(true);
      return;
    }

    setSaving(true);
    try {
      await ordersApi.updateStatus(order.id, {
        status: action.nextStatus,
        trackingNumber: action.nextStatus === "shipped" ? localTracking : undefined,
        courierService: action.nextStatus === "shipped" ? localCourier : undefined,
      });

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              order: {
                ...prev.order,
                status: action.nextStatus,
                trackingNumber: action.nextStatus === "shipped" ? localTracking : prev.order.trackingNumber,
                courierService: action.nextStatus === "shipped" ? localCourier : prev.order.courierService,
              },
            }
          : prev
      );

      setShowAwbInput(false);
      toast.success("Order status updated.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not update order status."));
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
        <Chip variant={cfg.variant}>{cfg.label}</Chip>

        {!(["completed", "cancelled"] as string[]).includes(order.status) && (
          <Card variant="dark" className="!p-4">
            <div className="flex items-center gap-2.5">
              <ShieldIcon size={16} className="opacity-60 flex-shrink-0" />
              <div className="mono text-[10px] opacity-50 tracking-[0.08em]">ESCROW HOLDS</div>
              <div className="mono text-[16px] font-semibold ml-auto">{formatPrice(amount)}</div>
            </div>
            <div className="mt-2 text-xs opacity-60 leading-[1.4]">Payment releases after buyer confirmation.</div>
          </Card>
        )}

        {order.status === "completed" && (
          <Card variant="accent" className="!p-3.5 flex items-center gap-2.5">
            <CheckIcon size={16} className="text-accent-ink flex-shrink-0" />
            <div className="text-xs text-accent-ink font-medium">{formatPrice(amount)} released</div>
          </Card>
        )}

        {action && (
          <div className="flex flex-col gap-2.5">
            {needsAwb && showAwbInput && (
              <div className="flex flex-col gap-2">
                <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">SHIPMENT DETAILS</div>
                <input
                  value={localCourier}
                  onChange={(e) => setLocalCourier(e.target.value)}
                  placeholder="Courier service"
                  className="h-11 rounded-[10px] border border-line bg-paper-2 px-3 text-[13px] outline-none focus:border-ink transition-colors"
                />
                <input
                  value={localTracking}
                  onChange={(e) => setLocalTracking(e.target.value)}
                  placeholder="Tracking number"
                  className="h-11 rounded-[10px] border border-line bg-paper-2 px-3 text-[13px] mono outline-none focus:border-ink transition-colors"
                />
              </div>
            )}
            <Button variant={action.variant} block loading={saving} onClick={handleAction}>
              {action.icon && <action.icon size={15} />}
              {needsAwb && !showAwbInput ? "Enter shipment details" : action.label}
            </Button>
            {needsAwb && showAwbInput && (
              <button onClick={() => setShowAwbInput(false)} className="text-[12px] text-ink-3 text-center py-1">
                Cancel
              </button>
            )}
          </div>
        )}

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">BUYER</div>
          <div className="flex items-center gap-3 p-3.5 border border-line rounded-[12px]">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">{buyerName}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">{detail.buyer?.email || "Buyer details"}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">SHIP TO</div>
          <Card className="!p-3.5">
            {detail.shippingAddress ? (
              <div className="text-[11px] text-ink-3 leading-[1.4]">
                {detail.shippingAddress.line1}
                {detail.shippingAddress.line2 ? `, ${detail.shippingAddress.line2}` : ""}
                {`, ${detail.shippingAddress.city}, ${detail.shippingAddress.state} — ${detail.shippingAddress.postalCode}`}
              </div>
            ) : (
              <div className="text-[11px] text-ink-3">No shipping address attached</div>
            )}
          </Card>
        </div>

        {localTracking && !["placed", "confirmed"].includes(order.status) && (
          <div>
            <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">TRACKING</div>
            <Card className="!p-3.5">
              <div className="flex items-center gap-3">
                <TruckIcon size={16} className="text-ink-3 flex-shrink-0" />
                <div>
                  <div className="text-[12px] font-medium">{localCourier || order.courierService}</div>
                  <div className="mono text-[11px] text-ink-3 mt-0.5">{localTracking}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="pt-2 border-t border-line">
          <div className="flex justify-between text-[15px] font-semibold">
            <span>Order total</span>
            <span className="mono">{formatPrice(amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
