"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EscrowTimeline } from "@/components/features/EscrowTimeline";
import { ordersApi } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";
import { statusMeta, buildTimeline } from "@/lib/order-status";
import { formatPrice } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function BuyerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await ordersApi.get(params.id);
      setData(res);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load order"));
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function complete() {
    if (!confirm("Confirm you received this order in good condition? This releases payment to the supplier.")) return;
    setBusy(true);
    try {
      await ordersApi.updateStatus(params.id, { status: "completed" });
      toast.success("Order completed — payment released");
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to complete"));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error}</div>;
  if (!data) return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;

  const { order, items, escrow, supplier, shippingAddress, dispute } = data;
  const meta = statusMeta(order.status);
  const canAct = order.status === "delivered";

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title={`Order #${order.id.slice(0, 8)}`} backHref="/buyer/orders" />
      <div className="px-5 pb-8 space-y-4">
        {/* Status header */}
        <Card className="!p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-ink-3">Status</div>
            <Chip variant={meta.variant} size="md" dot>{meta.label}</Chip>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-ink-3">Total</div>
            <div className="mono text-[18px] font-bold">{formatPrice(parseFloat(order.totalAmount))}</div>
          </div>
        </Card>

        {/* Items */}
        <div>
          <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider mb-2">Items</div>
          <Card className="!p-0 divide-y divide-line">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 p-3.5">
                <div
                  className="w-12 h-12 rounded-[10px] flex-shrink-0 overflow-hidden bg-paper-3"
                  style={{ background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)" }}
                >
                  {it.productImage?.[0] && <img src={it.productImage[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{it.productName || "Item"}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">Qty {it.quantity} · {formatPrice(parseFloat(it.unitPrice))}</div>
                </div>
                <div className="mono text-[13px] font-semibold">{formatPrice(parseFloat(it.subtotal))}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Supplier */}
        <Card className="!p-4">
          <div className="text-[11px] text-ink-3">Supplier</div>
          <div className="text-[14px] font-medium">{supplier?.businessName || supplier?.name || "—"}</div>
        </Card>

        {/* Tracking */}
        {order.trackingNumber && (
          <Card className="!p-4">
            <div className="text-[11px] text-ink-3">Tracking</div>
            <div className="text-[14px] font-medium">{order.courierService || "Courier"} · {order.trackingNumber}</div>
            {order.estimatedDelivery && (
              <div className="text-[11px] text-ink-3 mt-0.5">
                Est. delivery {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </div>
            )}
          </Card>
        )}

        {/* Shipping address */}
        {shippingAddress && (
          <Card className="!p-4">
            <div className="text-[11px] text-ink-3 mb-1">Delivering to</div>
            <div className="text-[13px] leading-snug">
              {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </div>
          </Card>
        )}

        {/* Timeline */}
        <div>
          <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider mb-3">Progress</div>
          <Card className="!p-4">
            <EscrowTimeline steps={buildTimeline(order.status)} />
          </Card>
        </div>

        {/* Escrow */}
        {escrow && (
          <Card className="!p-4 flex items-center justify-between">
            <div className="text-[12px] text-ink-2">Escrow {escrow.status.replace(/_/g, " ")}</div>
            <div className="mono text-[14px] font-semibold">{formatPrice(parseFloat(escrow.amount))}</div>
          </Card>
        )}

        {/* Actions */}
        {canAct && (
          <div className="flex gap-2">
            <Button variant="primary" block onClick={complete} loading={busy}>
              Mark completed
            </Button>
            <Link href={`/buyer/orders/${order.id}/dispute`} className="flex-1">
              <Button variant="default" block>Raise dispute</Button>
            </Link>
          </div>
        )}
        {dispute && (
          <Link href={`/disputes/${dispute.id}`}>
            <Button variant="default" block>View dispute</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
