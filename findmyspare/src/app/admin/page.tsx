"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { ArrowRightIcon } from "@/lib/icons";
import { adminApi } from "@/lib/api/admin";
import type { AdminSupplierRow } from "@/lib/api/admin";
import { Chip } from "@/components/ui/Chip";

type Range = "7d" | "30d" | "90d";
type Series = Awaited<ReturnType<typeof adminApi.metrics>>["series"];

interface Stats {
  pendingSuppliers: number;
  totalUsers: number;
  totalSuppliers: number;
  totalBuyers: number;
  totalProducts: number;
  totalInquiries: number;
  activeBanners: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<AdminSupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("7d");
  const [series, setSeries] = useState<Series>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statRes, pendRes] = await Promise.allSettled([
          adminApi.stats(),
          adminApi.listSuppliers({ status: "pending" }),
        ]);
        if (cancelled) return;
        if (statRes.status === "fulfilled") setStats(statRes.value);
        if (pendRes.status === "fulfilled") setPending(pendRes.value.suppliers);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    adminApi
      .metrics(range)
      .then((r) => setSeries(r.series))
      .catch(() => setSeries([]));
  }, [range]);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Admin overview" />
      <div className="px-5 pb-12 max-w-6xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Pending suppliers" value={stats?.pendingSuppliers} href="/admin/suppliers?status=pending" highlight />
          <StatCard label="Total users" value={stats?.totalUsers} href="/admin/users" />
          <StatCard label="Suppliers" value={stats?.totalSuppliers} href="/admin/suppliers" />
          <StatCard label="Buyers" value={stats?.totalBuyers} href="/admin/users?role=buyer" />
          <StatCard label="Products" value={stats?.totalProducts} href="/admin/products" />
          <StatCard label="Inquiries" value={stats?.totalInquiries} href="/admin/inquiries" />
          <StatCard label="Active banners" value={stats?.activeBanners} href="/admin/banners" />
        </div>

        {/* Metrics */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="serif text-[20px]">Activity</div>
            <div className="flex gap-1 bg-paper-2 p-1 rounded-[10px]">
              {(["7d", "30d", "90d"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-colors ${range === r ? "bg-paper text-ink shadow-sm" : "text-ink-3 hover:text-ink"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Sparkline
              label="New signups"
              data={series.map((d) => d.buyerSignups + d.supplierSignups)}
              total={series.reduce((s, d) => s + d.buyerSignups + d.supplierSignups, 0)}
            />
            <Sparkline
              label="Inquiries"
              data={series.map((d) => d.inquiries)}
              total={series.reduce((s, d) => s + d.inquiries, 0)}
            />
            <Sparkline
              label="Messages"
              data={series.map((d) => d.messages)}
              total={series.reduce((s, d) => s + d.messages, 0)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <div className="serif text-[20px]">Pending verifications</div>
            <Link
              href="/admin/suppliers"
              className="text-[12px] text-accent-ink hover:underline flex items-center gap-1"
            >
              All suppliers <ArrowRightIcon size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="text-[13px] text-ink-3 py-6 text-center">Loading…</div>
          ) : pending.length === 0 ? (
            <Card className="text-center !p-6">
              <div className="text-[13px] font-medium">No pending suppliers</div>
              <div className="text-[11px] text-ink-3 mt-1">All caught up.</div>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {pending.map((s) => (
                <Link key={s.id} href={`/admin/suppliers/${s.id}`}>
                  <Card className="!p-4 flex items-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{s.businessName || s.name}</div>
                      <div className="text-[11px] text-ink-3 mt-0.5">{s.name} · {s.email}</div>
                    </div>
                    <Chip variant="warn">Pending</Chip>
                    <ArrowRightIcon size={16} className="text-ink-3" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkline({
  label,
  data,
  total,
}: {
  label: string;
  data: number[];
  total: number;
}) {
  const path = useMemo(() => buildPath(data), [data]);
  return (
    <Card className="!p-4">
      <div className="mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        {label}
      </div>
      <div className="serif text-[28px] mt-1">{total.toLocaleString("en-IN")}</div>
      <svg viewBox="0 0 100 30" className="mt-2 w-full h-10" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-[color:var(--accent)]" />
      </svg>
    </Card>
  );
}

function buildPath(data: number[]): string {
  if (data.length === 0) return "M0,30 L100,30";
  const max = Math.max(1, ...data);
  const n = data.length;
  const step = 100 / Math.max(1, n - 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = 30 - (v / max) * 28;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number | undefined;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <Card
        className={`!p-4 cursor-pointer hover:border-accent/40 transition-colors ${
          highlight && (value ?? 0) > 0 ? "!border-accent" : ""
        }`}
      >
        <div className="mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{label}</div>
        <div className="serif text-[28px] mt-1">
          {value === undefined ? "—" : value.toLocaleString("en-IN")}
        </div>
      </Card>
    </Link>
  );
}
