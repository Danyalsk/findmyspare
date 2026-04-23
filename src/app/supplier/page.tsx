"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon, PackageIcon, TruckIcon, ShieldIcon } from "@/lib/icons";
import { SupplierKpiCard } from "@/components/features/SupplierKpiCard";
import { TaskCard } from "@/components/features/TaskCard";
import { InquiryListItem } from "@/components/features/InquiryListItem";
import { useAuthStore } from "@/lib/store";
import { formatPriceCompact } from "@/lib/constants";
import { inquiriesApi, ordersApi, supplierApi } from "@/lib/api";
import type { Inquiry, OrderListItem, SupplierDashboard } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";

const INQUIRY_LIMIT = 50;

const emptyDashboard: SupplierDashboard = {
  pendingEscrow: 0,
  pendingOrderCount: 0,
  releasedThisWeek: 0,
  releasedChange: 0,
  activeBids: 0,
  openInquiries: 0,
};

function buildTasks(orders: OrderListItem[]) {
  const placed = orders.filter((o) => o.status === "placed").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const disputed = orders.filter((o) => o.status === "disputed").length;

  return [
    {
      icon: PackageIcon,
      title: placed > 0 ? `${placed} new order${placed > 1 ? "s" : ""}` : "No new orders",
      subtitle: "Confirm and prepare for dispatch",
      tag: placed > 0 ? "URGENT" : undefined,
      tagVariant: "danger" as const,
      href: "/supplier/orders",
    },
    {
      icon: TruckIcon,
      title: confirmed > 0 ? `${confirmed} ready to ship` : "No pending shipments",
      subtitle: "Update tracking for confirmed orders",
      tag: confirmed > 0 ? "TODAY" : undefined,
      tagVariant: "warn" as const,
      href: "/supplier/orders",
    },
    {
      icon: ShieldIcon,
      title: disputed > 0 ? `${disputed} dispute${disputed > 1 ? "s" : ""}` : "No open disputes",
      subtitle: "Respond quickly to maintain trust",
      tag: disputed > 0 ? "DISPUTE" : undefined,
      tagVariant: "danger" as const,
      href: "/supplier/orders",
    },
  ];
}

export default function SupplierDashboardPage() {
  const { user } = useAuthStore();
  const businessName = user?.businessName ?? user?.name ?? "Your Shop";
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const [dashboard, setDashboard] = useState<SupplierDashboard>(emptyDashboard);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [error, setError] = useState("");

  const refreshInquiries = useCallback(async () => {
    try {
      const res = await inquiriesApi.listActive({ limit: INQUIRY_LIMIT });
      setInquiries(res.inquiries);
    } catch {
      /* silent — surface via initial-load error only */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      try {
        const [dashboardRes, ordersRes, inquiryRes] = await Promise.all([
          supplierApi.dashboard(),
          ordersApi.list({ limit: 20 }),
          inquiriesApi.listActive({ limit: INQUIRY_LIMIT }),
        ]);

        if (cancelled) return;
        setDashboard(dashboardRes);
        setOrders(ordersRes.orders);
        setInquiries(inquiryRes.inquiries);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        if (!cancelled) setInquiriesLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    function onInquiryCreated(inq: Inquiry) {
      setInquiries((prev) => {
        if (prev.some((l) => l.id === inq.id)) return prev;
        return [inq, ...prev];
      });
      toast.success(`New inquiry: ${inq.partName}`);
    }

    function onConnect() {
      setLiveConnected(true);
      refreshInquiries();
    }
    function onDisconnect() {
      setLiveConnected(false);
    }

    setLiveConnected(socket.connected);
    socket.on("inquiry:created", onInquiryCreated);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    function onVisibility() {
      if (document.visibilityState === "visible") refreshInquiries();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      socket.off("inquiry:created", onInquiryCreated);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshInquiries]);

  const tasks = buildTasks(orders);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] uppercase truncate max-w-[220px]">{businessName}</div>
          <div className="serif text-[28px] leading-[1.05] mt-1">Hello, {firstName}</div>
        </div>
        <Link href="/supplier/orders" className="relative">
          <div className="w-10 h-10 rounded-[12px] bg-paper-2 border border-line flex items-center justify-center">
            <BellIcon size={20} />
          </div>
          {dashboard.openInquiries > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-danger text-paper text-[10px] font-semibold px-1">
              {dashboard.openInquiries > 9 ? "9+" : dashboard.openInquiries}
            </span>
          )}
        </Link>
      </div>

      {error && <div className="px-5 pt-3 text-[12px] text-danger">{error}</div>}

      <div className="px-5 pt-5 grid grid-cols-2 gap-2.5">
        <SupplierKpiCard
          label="PENDING ESCROW"
          value={formatPriceCompact(dashboard.pendingEscrow)}
          sublabel={`${dashboard.pendingOrderCount} orders in escrow`}
        />
        <SupplierKpiCard
          label="RELEASED THIS WEEK"
          value={formatPriceCompact(dashboard.releasedThisWeek)}
          sublabel={`↑ ${dashboard.releasedChange}% vs last week`}
          sparkline={[12, 18, 14, 22, 28, 25, 30]}
        />
        <SupplierKpiCard
          label="ACTIVE BIDS"
          value={String(dashboard.activeBids)}
          sublabel="Awaiting buyer response"
        />
        <SupplierKpiCard
          label="OPEN INQUIRIES"
          value={String(dashboard.openInquiries)}
          sublabel="Matching your inventory"
        />
      </div>

      <div className="px-5 pt-[22px]">
        <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">TASKS FOR TODAY</div>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.title} {...task} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-[22px] pb-5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {liveConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  liveConnected ? "bg-accent" : "bg-ink-3/40"
                }`}
              />
            </span>
            <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
              LIVE INQUIRIES
              {inquiries.length > 0 && (
                <span className="ml-1.5 text-ink-2">({inquiries.length})</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {inquiriesLoading ? (
            <div className="py-8 text-center text-[12px] text-ink-3">Loading inquiries...</div>
          ) : inquiries.length === 0 ? (
            <div className="py-8 px-4 text-center bg-paper-2 border border-dashed border-line rounded-[var(--radius)]">
              <div className="text-[13px] text-ink-2 font-medium">No open inquiries</div>
              <div className="text-[11px] text-ink-3 mt-1">New buyer requests will appear here in real time.</div>
            </div>
          ) : (
            inquiries.map((inq) => <InquiryListItem key={inq.id} inquiry={inq} />)
          )}
        </div>
      </div>
    </div>
  );
}
