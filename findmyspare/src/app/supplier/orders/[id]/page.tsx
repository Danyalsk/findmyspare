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
import type { OrderDetail, OrderStatus } from "@/lib/types";
import { statusMeta, buildTimeline } from "@/lib/order-status";
import { formatPrice } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass = "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

export default function SupplierOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [ship, setShip] = useState({ trackingNumber: "", courierService: "", estimatedDelivery: "" });

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

  async function transition(status: OrderStatus, extra?: Record<string, string>) {
    setBusy(true);
    try {
      await ordersApi.updateStatus(params.id, { status, ...extra });
      toast.success(`Order ${statusMeta(status).label.toLowerCase()}`);
      setShipping(false);
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Update failed"));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error}</div>;
  if (!data) return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;

  const { order, items, buyer, shippingAddress, dispute } = data;
  const meta = statusMeta(order.status);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title={`Order #${order.id.slice(0, 8)}`} backHref="/supplier/orders" />
      <div className="px-5 pb-8 space-y-4">
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
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{it.productName || "Item"}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">Qty {it.quantity} · {formatPrice(parseFloat(it.unitPrice))}</div>
                </div>
                <div className="mono text-[13px] font-semibold">{formatPrice(parseFloat(it.subtotal))}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Buyer + ship-to */}
        <Card className="!p-4">
          <div className="text-[11px] text-ink-3">Buyer</div>
          <div className="text-[14px] font-medium">{buyer?.name || "—"}</div>
          {shippingAddress && (
            <div className="text-[12px] text-ink-2 mt-2 leading-snug">
              {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              {shippingAddress.phone ? ` · ${shippingAddress.phone}` : ""}
            </div>
          )}
        </Card>

        {/* Timeline */}
        <Card className="!p-4">
          <EscrowTimeline steps={buildTimeline(order.status)} />
        </Card>

        {dispute && (
          <Link href={`/disputes/${dispute.id}`}>
            <Button variant="default" block>View &amp; respond to dispute</Button>
          </Link>
        )}

        {/* Shipping form */}
        {shipping && (
          <Card className="!p-4 space-y-3">
            <div>
              <label className={labelClass}>Courier</label>
              <input className={fieldClass} value={ship.courierService}
                onChange={(e) => setShip({ ...ship, courierService: e.target.value })} placeholder="Delhivery, BlueDart…" />
            </div>
            <div>
              <label className={labelClass}>Tracking number</label>
              <input className={fieldClass} value={ship.trackingNumber}
                onChange={(e) => setShip({ ...ship, trackingNumber: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Est. delivery</label>
              <input className={fieldClass} type="date" value={ship.estimatedDelivery}
                onChange={(e) => setShip({ ...ship, estimatedDelivery: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="default" block onClick={() => setShipping(false)}>Cancel</Button>
              <Button variant="primary" block loading={busy}
                onClick={() => transition("shipped", {
                  trackingNumber: ship.trackingNumber,
                  courierService: ship.courierService,
                  estimatedDelivery: ship.estimatedDelivery,
                })}>
                Confirm shipment
              </Button>
            </div>
          </Card>
        )}

        {/* Lifecycle actions */}
        {!shipping && (
          <div className="flex flex-col gap-2">
            {order.status === "placed" && (
              <div className="flex gap-2">
                <Button variant="primary" block loading={busy} onClick={() => transition("confirmed")}>
                  Confirm order
                </Button>
                <Button variant="default" block onClick={() => {
                  if (confirm("Cancel this order? Stock is restored and the buyer is refunded.")) transition("cancelled");
                }}>
                  Cancel
                </Button>
              </div>
            )}
            {order.status === "confirmed" && (
              <Button variant="primary" block onClick={() => setShipping(true)}>Mark shipped</Button>
            )}
            {order.status === "shipped" && (
              <Button variant="primary" block loading={busy} onClick={() => transition("in_transit")}>
                Mark in transit
              </Button>
            )}
            {order.status === "in_transit" && (
              <Button variant="primary" block loading={busy} onClick={() => transition("delivered")}>
                Mark delivered
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
