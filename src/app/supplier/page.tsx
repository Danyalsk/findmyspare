"use client";

import Link from "next/link";
import { BellIcon, BoltIcon, ChatIcon, PackageIcon, TruckIcon, ShieldIcon } from "@/lib/icons";
import { SupplierKpiCard } from "@/components/features/SupplierKpiCard";
import { TaskCard } from "@/components/features/TaskCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   Supplier Dashboard — Screen 10
   KPIs, tasks, live request alerts
   ═══════════════════════════════════════════════════════ */

export default function SupplierDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
            KIRINYAGA PARTS LTD.
          </div>
          <div className="serif text-[28px] leading-[1.05] mt-1">Your shop</div>
        </div>
        <Link href="/messages" className="relative">
          <div className="w-10 h-10 rounded-[12px] bg-paper-2 border border-line flex items-center justify-center">
            <BellIcon size={20} />
          </div>
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-danger text-paper text-[10px] font-semibold px-1">
            3
          </span>
        </Link>
      </div>

      {/* ── KPI grid ── */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-2.5">
        <SupplierKpiCard
          label="PENDING"
          value="₹48.2K"
          sublabel="3 orders in escrow"
        />
        <SupplierKpiCard
          label="RELEASED THIS WEEK"
          value="₹1.2L"
          sublabel="↑ 18% vs last week"
          sparkline={[12, 18, 14, 22, 28, 25, 30]}
        />
      </div>

      {/* ── Tasks for today ── */}
      <div className="px-5 pt-[22px]">
        <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">
          TASKS FOR TODAY
        </div>
        <div className="flex flex-col gap-2">
          <TaskCard
            icon={ChatIcon}
            title="Respond to 3 new requests"
            subtitle="Brake calipers, alternator, timing belt"
            tag="URGENT"
            tagVariant="danger"
            href="/messages"
          />
          <TaskCard
            icon={PackageIcon}
            title="Pack order ORD-10501"
            subtitle="Front brake caliper → Maruti Swift"
            tag="TODAY"
            tagVariant="warn"
            href="/supplier/orders"
          />
          <TaskCard
            icon={TruckIcon}
            title="Confirm courier pickup"
            subtitle="2 orders scheduled for DTDC"
            href="/supplier/orders"
          />
          <TaskCard
            icon={ShieldIcon}
            title="Dispute #D-392 update"
            subtitle="Customer uploaded photos — review needed"
            tag="DISPUTE"
            tagVariant="danger"
            href="/supplier/orders"
          />
        </div>
      </div>

      {/* ── Live request alert ── */}
      <div className="px-5 pt-[22px] pb-5">
        <Card variant="accent" className="!p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2.5">
            <BoltIcon size={16} className="text-accent-ink" />
            <div className="mono text-[10px] text-accent-ink tracking-[0.1em]">
              LIVE REQUEST · MATCHES YOU
            </div>
          </div>
          <div className="font-medium text-accent-ink">
            Front brake caliper — Maruti Swift 2018
          </div>
          <div className="text-xs text-accent-ink opacity-80 mt-1 flex items-center gap-3">
            <span>Budget: ₹2K – ₹6K</span>
            <span className="mono text-[10px]">CLOSES 3H</span>
          </div>
          <Button variant="accent" block className="mt-3 !h-11 !text-[13px]">
            Submit bid
          </Button>
        </Card>
      </div>
    </div>
  );
}
