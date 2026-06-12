"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon, PackageIcon, TruckIcon, ShieldIcon, BoltIcon, ArrowRightIcon } from "@/lib/icons";
import { SupplierKpiCard } from "@/components/features/SupplierKpiCard";
import { TaskCard } from "@/components/features/TaskCard";
import { InquiryListItem } from "@/components/features/InquiryListItem";
import { useAuthStore } from "@/lib/store";
import { inquiriesApi, inventoryApi, ordersApi, supplierApi } from "@/lib/api";
import type { Inquiry, InventorySummary, OrderListItem, SupplierDashboard } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";

const INQUIRY_LIMIT = 50;

const emptyDashboard: SupplierDashboard = {
  pendingOrderCount: 0,
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
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
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
        const [dashboardRes, ordersRes, inquiryRes, inventoryRes] = await Promise.all([
          supplierApi.dashboard(),
          ordersApi.list({ limit: 20 }),
          inquiriesApi.listActive({ limit: INQUIRY_LIMIT }),
          inventoryApi.summary().catch(() => null),
        ]);

        if (cancelled) return;
        setDashboard(dashboardRes);
        setOrders(ordersRes.orders);
        setInquiries(inquiryRes.inquiries);
        setInventory(inventoryRes);
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden bg-paper-3 pb-24 md:pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden bg-paper rounded-b-[24px] shadow-[var(--shadow-card)]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(500px 220px at 0% 0%, rgba(252,128,25,0.14) 0%, rgba(252,128,25,0) 60%)",
          }}
        />
        <div className="relative px-5 pt-6 pb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase truncate">
              {businessName}
            </div>
            <div className="display text-[28px] leading-tight text-ink mt-1">
              Hi, {firstName} 👋
            </div>
            <p className="text-[12px] text-ink-3 mt-1">
              Here&apos;s what&apos;s happening in your shop today.
            </p>
          </div>
          <Link href="/supplier/orders" className="relative flex-shrink-0" aria-label="Notifications">
            <div className="w-11 h-11 rounded-full bg-paper-2 flex items-center justify-center text-ink hover:bg-paper-3 transition-colors">
              <BellIcon size={20} />
            </div>
            {dashboard.openInquiries > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-discount text-white text-[10px] font-bold px-1 shadow-sm">
                {dashboard.openInquiries > 9 ? "9+" : dashboard.openInquiries}
              </span>
            )}
          </Link>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 px-3.5 py-2.5 rounded-[12px] bg-danger-wash text-[12px] font-medium text-[color:var(--danger)]">
          {error}
        </div>
      )}

      {/* ── KPI grid ────────────────────────────── */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-2.5">
        <SupplierKpiCard
          label="ACTIVE ORDERS"
          value={String(dashboard.pendingOrderCount)}
          sublabel="In progress with you"
        />
        <SupplierKpiCard
          label="ACTIVE QUOTES"
          value={String(dashboard.activeBids)}
          sublabel="Awaiting buyer response"
        />
        <SupplierKpiCard
          label="OPEN INQUIRIES"
          value={String(dashboard.openInquiries)}
          sublabel="Matching your inventory"
        />
        <Link href="/supplier/inventory?lowStock=true">
          <SupplierKpiCard
            label="LOW STOCK"
            value={String(inventory?.lowStock ?? 0)}
            sublabel={inventory && inventory.outOfStock > 0 ? `${inventory.outOfStock} out of stock` : "Items to restock"}
          />
        </Link>
      </div>

      {/* ── Performance card ───────────────────── */}
      <div className="px-5 pt-5">
        <div className="bg-paper rounded-[20px] p-5 shadow-[var(--shadow-card)] relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[color:var(--accent)]/10"
          />
          <div className="relative">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
                  This week
                </div>
                <div className="display text-[20px] text-ink leading-tight mt-0.5">
                  Performance snapshot
                </div>
              </div>
              <div className="px-3 h-8 rounded-full bg-success-wash text-[color:var(--success)] text-[11px] font-bold flex items-center gap-1">
                <ArrowRightIcon size={12} className="-rotate-45" /> +18% vs last
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="grid grid-cols-7 gap-1.5 items-end h-20 mb-3">
              {[40, 65, 50, 80, 90, 70, 100].map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-[6px] bg-[color:var(--accent)]"
                    style={{ height: `${v}%`, opacity: 0.55 + v / 250 }}
                  />
                  <span className="text-[9px] font-bold text-ink-3">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-line">
              <div>
                <div className="display text-[18px] text-ink leading-none">42</div>
                <div className="text-[10px] font-bold text-ink-3 mt-1 uppercase tracking-wider">
                  Quotes placed
                </div>
              </div>
              <div>
                <div className="display text-[18px] text-ink leading-none">28</div>
                <div className="text-[10px] font-bold text-ink-3 mt-1 uppercase tracking-wider">
                  Won deals
                </div>
              </div>
              <div>
                <div className="display text-[18px] text-[color:var(--accent)] leading-none">67%</div>
                <div className="text-[10px] font-bold text-ink-3 mt-1 uppercase tracking-wider">
                  Win rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ──────────────────────── */}
      <div className="px-5 pt-5">
        <div className="display text-[18px] text-ink leading-tight mb-3">
          Quick actions
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: "Add item",   href: "/supplier/inventory/new", icon: PackageIcon, tint: "#FFE8D6" },
            { label: "Leads",       href: "/supplier/leads",        icon: BoltIcon,    tint: "#FFF3C4" },
            { label: "Orders",      href: "/supplier/orders",       icon: TruckIcon,   tint: "#D8F4DE" },
            { label: "Messages",    href: "/messages",              icon: BellIcon,    tint: "#CFEEFF" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-center gap-2 p-3 rounded-[14px] bg-paper shadow-[var(--shadow-sm)] fms-press"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[color:var(--accent-ink)]"
                style={{ background: a.tint }}
              >
                <a.icon size={18} />
              </div>
              <span className="text-[11px] font-bold text-ink text-center leading-tight">
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Tasks ──────────────────────────────── */}
      <div className="px-5 pt-6">
        <div className="display text-[18px] text-ink leading-tight mb-3">
          Tasks for today
        </div>
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskCard key={task.title} {...task} />
          ))}
        </div>
      </div>

      {/* ── Live inquiries ─────────────────────── */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {liveConnected && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--accent)] opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    liveConnected ? "bg-[color:var(--accent)]" : "bg-ink-3/40"
                  }`}
                />
              </span>
              <div className="display text-[18px] text-ink leading-tight">
                Live inquiries
                {inquiries.length > 0 && (
                  <span className="ml-1.5 text-[color:var(--accent-ink)]">
                    ({inquiries.length})
                  </span>
                )}
              </div>
            </div>
            <div className="text-[11px] text-ink-3 mt-0.5 font-semibold">
              Buyers posting requests in real time
            </div>
          </div>
          <Link
            href="/supplier/leads"
            className="text-[12px] font-bold text-[color:var(--accent-ink)] hover:underline flex items-center gap-1"
          >
            See all <ArrowRightIcon size={12} />
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {inquiriesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[130px] rounded-[18px] fms-shimmer" />
            ))
          ) : inquiries.length === 0 ? (
            <div className="py-10 px-5 text-center bg-paper rounded-[18px] shadow-[var(--shadow-card)]">
              <div className="w-14 h-14 rounded-full bg-accent-wash mx-auto mb-3 flex items-center justify-center text-[color:var(--accent-ink)]">
                <BoltIcon size={22} />
              </div>
              <div className="display text-[15px] text-ink mb-1">
                Waiting for buyers
              </div>
              <div className="text-[12px] text-ink-3">
                New requests will appear here instantly — no refresh needed.
              </div>
            </div>
          ) : (
            inquiries.slice(0, 6).map((inq) => (
              <InquiryListItem key={inq.id} inquiry={inq} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
