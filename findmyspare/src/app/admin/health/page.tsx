"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

type Health = Awaited<ReturnType<typeof adminApi.health>>;

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function HealthPage() {
  const [h, setH] = useState<Health | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setH(await adminApi.health());
      setError("");
    } catch (e) {
      setError(getErrorMessage(e, "Could not load health"));
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-semibold tracking-tight mb-1">System health</h1>
      <p className="text-[13px] text-ink-3 mb-6">Live status. Auto-refreshes every 10s.</p>

      {error && (
        <Card variant="accent" className="!p-3 mb-4 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      {!h ? (
        <div className="text-[13px] text-ink-3">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <HealthCard
            label="Database"
            value={h.db.ok ? "Healthy" : "Degraded"}
            tone={h.db.ok ? "good" : "bad"}
            detail={h.db.error || "Connection OK"}
          />
          <HealthCard
            label="Active sessions"
            value={String(h.activeSessions)}
            tone="neutral"
            detail="Users with valid refresh tokens"
          />
          <HealthCard
            label="API uptime"
            value={formatUptime(h.uptime)}
            tone="neutral"
            detail={`Since last restart`}
          />
          <HealthCard
            label="Last check"
            value={new Date(h.timestamp).toLocaleTimeString()}
            tone="neutral"
            detail={new Date(h.timestamp).toLocaleDateString()}
          />
        </div>
      )}
    </div>
  );
}

function HealthCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "bad" | "neutral";
}) {
  const dotColor =
    tone === "good"
      ? "bg-[color:var(--accent)]"
      : tone === "bad"
      ? "bg-[color:var(--danger)]"
      : "bg-ink-3";
  return (
    <div className="rounded-[14px] bg-paper border border-line p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-[11px] mono tracking-wider uppercase text-ink-3">
          {label}
        </span>
      </div>
      <div className="text-[24px] font-semibold tracking-tight">{value}</div>
      <div className="text-[12px] text-ink-3 mt-1">{detail}</div>
    </div>
  );
}
