"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { OrderCard } from "@/components/features/OrderCard";
import { FilterPills } from "@/components/features/FilterPills";
import { ordersApi } from "@/lib/api";
import type { OrderListItem, OrderStatus } from "@/lib/types";
import { statusMeta } from "@/lib/order-status";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const GROUPS: Record<string, OrderStatus[]> = {
  Active: ["placed", "confirmed", "shipped", "in_transit", "delivered"],
  Completed: ["completed"],
  Cancelled: ["cancelled", "disputed"],
};
const FILTERS = ["All", "Active", "Completed", "Cancelled"] as const;
type FilterLabel = (typeof FILTERS)[number];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterLabel>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ordersApi.list({ limit: 50 });
        if (!cancelled) setOrders(res.orders);
      } catch (e: unknown) {
        if (!cancelled) toast.error(getErrorMessage(e, "Failed to load orders"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (filter === "All") return orders;
    const allowed = GROUPS[filter];
    return orders.filter((o) => allowed.includes(o.status));
  }, [orders, filter]);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="My orders" backHref="/buyer" />
      <div className="px-5 pb-8 space-y-4">
        <FilterPills
          filters={FILTERS.map((f) => ({ label: f, active: f === filter }))}
          onToggle={(label) => setFilter(label as FilterLabel)}
        />

        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : visible.length === 0 ? (
          <Card className="text-center !p-8">
            <div className="text-[14px] font-medium mb-1">No orders here</div>
            <div className="text-[12px] text-ink-3">When you place an order it shows up here.</div>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {visible.map((o) => {
              const meta = statusMeta(o.status);
              return (
                <OrderCard
                  key={o.id}
                  orderId={`#${o.id.slice(0, 8)}`}
                  name={o.primaryItemName || "Order"}
                  status={meta.label}
                  statusVariant={meta.variant}
                  supplier={o.supplierName || "Supplier"}
                  date={fmtDate(o.createdAt)}
                  href={`/buyer/orders/${o.id}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
