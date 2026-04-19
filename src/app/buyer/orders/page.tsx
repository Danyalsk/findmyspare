"use client";

import Link from "next/link";
import { useState } from "react";
import { TruckIcon, ArrowRightIcon, ShieldIcon } from "@/lib/icons";
import { OrderCard } from "@/components/features/OrderCard";
import { Card } from "@/components/ui/Card";

/* ═══════════════════════════════════════════════════════
   Orders List — Screen 08
   Segmented tabs, hero transit card, order list
   ═══════════════════════════════════════════════════════ */

const tabs = ["Active · 3", "In escrow · 2", "Completed"];

const orders = [
  { orderId: "ORD-10501", name: "Front brake caliper",        status: "Preparing",  statusVariant: "warn"    as const, supplier: "Kirinyaga Parts",  date: "19 Apr", label: "CALIPER" },
  { orderId: "ORD-10482", name: "OEM Brake pad set",          status: "Completed",  statusVariant: "ok"      as const, supplier: "BestSpares India", date: "12 Apr", label: "PADS" },
  { orderId: "ORD-10392", name: "Radiator hose assembly",     status: "Disputed",   statusVariant: "danger"  as const, supplier: "Universal Auto",   date: "5 Apr",  label: "HOSE" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-5">
        <div className="serif text-[28px] leading-[1.05]">Your orders</div>
        <div className="text-[11px] text-ink-3 mt-1">3 active · 14 completed</div>
      </div>

      {/* ── Segmented control ── */}
      <div className="px-5 pt-4">
        <div className="flex bg-paper-2 rounded-[12px] p-[3px] border border-line">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className={`flex-1 text-[12px] font-medium py-2.5 rounded-[10px] transition-all ${
                activeTab === i
                  ? "bg-paper text-ink shadow-sm"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero transit card ── */}
      <div className="px-5 pt-[18px]">
        <Card variant="dark" className="!p-4 relative overflow-hidden">
          {/* Top row */}
          <div className="flex justify-between items-start">
            <div>
              <div className="mono text-[10px] opacity-50 tracking-[0.1em]">ORD-10482</div>
              <div className="text-sm font-medium mt-0.5">OEM Brake pad set</div>
            </div>
            <Link href="/buyer/orders/10482" className="opacity-80 hover:opacity-100 transition-opacity">
              <ArrowRightIcon size={18} />
            </Link>
          </div>

          {/* Route visualization */}
          <div className="mt-4 flex items-center gap-2.5">
            <div className="mono text-[10px] opacity-50">DEL</div>
            <div className="flex-1 h-0.5 bg-white/20 relative rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-accent rounded-full" style={{ width: "55%" }} />
              <div className="absolute top-1/2 -translate-y-1/2 text-paper" style={{ left: "55%", marginLeft: -8 }}>
                <TruckIcon size={16} />
              </div>
            </div>
            <div className="mono text-[10px] opacity-50">MUM</div>
          </div>

          {/* Escrow line */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
            <ShieldIcon size={14} className="opacity-60" />
            <div className="mono text-[10px] opacity-50 tracking-[0.08em]">
              ESCROW HOLDS
            </div>
            <div className="mono text-[13px] ml-auto">₹3,200</div>
          </div>
        </Card>
      </div>

      {/* ── Order list ── */}
      <div className="px-5 pt-[18px] pb-5 flex flex-col gap-2.5">
        {orders.map((o) => (
          <OrderCard
            key={o.orderId}
            orderId={o.orderId}
            name={o.name}
            status={o.status}
            statusVariant={o.statusVariant}
            supplier={o.supplier}
            date={o.date}
            href={`/buyer/orders/${o.orderId.replace("ORD-", "")}`}
            imageLabel={o.label}
          />
        ))}
      </div>
    </div>
  );
}
