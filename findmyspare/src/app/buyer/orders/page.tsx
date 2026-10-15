"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ordersApi } from "@/lib/api";
import { inr } from "@/lib/api/v2";
import type { OrderListItem } from "@/lib/types";
import { StatusChip, EmptyState, Skel, PartThumb } from "@/components/shop/ui";

const TABS = ["All", "Active", "Completed", "Cancelled"] as const;
const ACTIVE = ["placed", "confirmed", "shipped", "in_transit", "delivered"];

function chip(o: OrderListItem) {
  if (o.paymentStatus === "pending") return <StatusChip tone="amber">Awaiting payment</StatusChip>;
  switch (o.status) {
    case "placed": return <StatusChip tone="brand">Placed</StatusChip>;
    case "confirmed": return <StatusChip tone="brand">Packing</StatusChip>;
    case "shipped": case "in_transit": return <StatusChip tone="blue">On the way</StatusChip>;
    case "delivered": return <StatusChip tone="green">Delivered · confirm fit</StatusChip>;
    case "completed": return <StatusChip tone="grey">Completed</StatusChip>;
    case "disputed": return <StatusChip tone="red">Issue raised</StatusChip>;
    default: return <StatusChip tone="grey">{o.status}</StatusChip>;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[] | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  useEffect(() => { ordersApi.list({ limit: 50 }).then((r) => setOrders(r.orders)).catch(() => setOrders([])); }, []);
  const list = useMemo(() => (orders ?? []).filter((o) =>
    tab === "All" ? true : tab === "Active" ? ACTIVE.includes(o.status) : tab === "Completed" ? o.status === "completed" : ["cancelled", "disputed"].includes(o.status)
  ), [orders, tab]);

  return (
    <div className="max-w-[880px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">Your orders</h1>
      <div className="mt-4 flex gap-2">{TABS.map((t) => <button key={t} className="chip" data-on={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="mt-6 space-y-3">
        {!orders ? Array.from({ length: 3 }).map((_, i) => <Skel key={i} className="h-24" />)
          : !list.length ? <EmptyState title="No orders here yet" body="Your parts orders and quote orders show up here." action={<Link href="/search" className="font-extrabold text-[color:var(--accent)]">Browse parts →</Link>} />
          : list.map((o) => (
            <Link key={o.id} href={`/buyer/orders/${o.id}`} className="card p-4 flex items-center gap-4 hover:shadow-[var(--shadow-lifted)] transition-shadow">
              <PartThumb size="sm" className="w-14 h-14 rounded-[12px] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold truncate">{o.primaryItemName ?? (o.source === "quote" || o.source === "job" ? "Quoted part" : "Order")}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">{o.supplierName} · {format(new Date(o.createdAt), "d MMM")} · #{o.id.slice(0, 6).toUpperCase()}</div>
                <div className="mt-1.5">{chip(o)}</div>
              </div>
              <span className="price text-[15px]">{inr(o.totalAmount)}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
