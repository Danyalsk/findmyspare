"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/lib/icons";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/constants";
import { ordersApi } from "@/lib/api";
import type { OrderListItem, OrderStatus } from "@/lib/types";
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

const tabs = ["All", "Action needed", "Completed"];
const actionNeededStatuses: OrderStatus[] = ["placed", "confirmed", "disputed"];
const completedStatuses: OrderStatus[] = ["completed", "cancelled"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function SupplierOrdersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await ordersApi.list({ limit: 50 });
        if (!cancelled) setOrders(res.orders);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load orders"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === 1) return orders.filter((o) => actionNeededStatuses.includes(o.status));
    if (activeTab === 2) return orders.filter((o) => completedStatuses.includes(o.status));
    return orders;
  }, [orders, activeTab]);

  const actionCount = orders.filter((o) => actionNeededStatuses.includes(o.status)).length;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-5">
        <div className="serif text-[28px] leading-[1.05]">Orders</div>
        <div className="text-[11px] text-ink-3 mt-1">{actionCount} need action</div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex bg-paper-2 rounded-[12px] p-[3px] border border-line">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className={`flex-1 text-[12px] font-medium py-2.5 rounded-[10px] transition-all ${
                activeTab === i ? "bg-paper text-ink shadow-sm" : "text-ink-3 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading orders...</div>
      ) : error ? (
        <div className="px-5 pt-16 text-center text-[13px] text-danger">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="px-5 pt-16 text-center">
          <div className="text-[13px] text-ink-3">No orders here yet.</div>
        </div>
      ) : (
        <div className="px-5 pt-[18px] pb-5 flex flex-col gap-2.5">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status] ?? { label: order.status, variant: "default" as const };
            return (
              <Link key={order.id} href={`/supplier/orders/${order.id}`}>
                <Card className="!p-3.5 flex gap-3 items-start hover:border-ink/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium truncate max-w-[200px]">
                        {order.primaryItemName || "Order"}
                      </span>
                      <Chip variant={cfg.variant}>{cfg.label}</Chip>
                    </div>
                    <div className="text-[11px] text-ink-3 mt-0.5">
                      {order.buyerName || "Buyer"} · {formatDate(order.createdAt)}
                    </div>
                    <div className="mono text-[12px] font-semibold mt-1.5">
                      {formatPrice(parseFloat(order.totalAmount || "0"))}
                    </div>
                  </div>
                  <ArrowRightIcon size={16} className="text-ink-3 flex-shrink-0 mt-1" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
