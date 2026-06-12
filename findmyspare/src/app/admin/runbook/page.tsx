"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type RunbookData } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

// Static reference — service URLs for each environment. These don't come from
// the API (the backend can't know its own public hostname reliably).
const SERVICES = [
  {
    env: "Local (dev)",
    rows: [
      ["Frontend", "http://localhost:3000"],
      ["Backend API", "http://localhost:8000"],
      ["Swagger", "http://localhost:8000/swagger"],
      ["Health", "http://localhost:8000/health"],
      ["WebSocket", "ws://localhost:8000"],
    ],
  },
  {
    env: "Production",
    rows: [
      ["Frontend", "https://findmyspare.com → www.findmyspare.com"],
      ["Backend API", "https://findmyspare-backend.onrender.com"],
      ["Swagger", "https://findmyspare-backend.onrender.com/swagger"],
      ["Health", "https://findmyspare-backend.onrender.com/health"],
      ["WebSocket", "wss://findmyspare-backend.onrender.com"],
    ],
  },
];

const DEPLOY = [
  ["Frontend host", "Vercel — project: findmyspare (auto-deploy on push to main)"],
  ["Backend host", "Render — srv-d7p75bfavr4c73c8fua0 (auto-deploy on push to master)"],
  ["Frontend repo", "github.com/Danyalsk/findmyspare (main)"],
  ["Backend repo", "github.com/Danyalsk/findmyspare-backend (master)"],
  ["Database", "Neon Postgres (ap-southeast-1) — direct connection"],
  ["DNS", "GoDaddy — apex + www → Vercel"],
];

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h ${m}m` : h ? `${h}h ${m}m` : `${m}m`;
}

export default function RunbookPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<RunbookData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    adminApi.runbook().then(setData).catch((e) => setError(getErrorMessage(e, "Could not load runbook")));
  }, [user, router]);

  if (!user || user.role !== "super_admin") return null;

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold tracking-tight mb-1">Runbook</h1>
      <p className="text-[13px] text-ink-3 mb-6">
        Live ops reference — services, environment, integrations. Secrets are masked.
        Super-admin only.
      </p>

      {error && (
        <Card variant="accent" className="!p-3 mb-4 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      {/* Services & URLs */}
      <Section title="Services & URLs">
        {SERVICES.map((s) => (
          <div key={s.env} className="mb-4 last:mb-0">
            <div className="text-[11px] font-bold mono tracking-wider uppercase text-[color:var(--accent-ink)] mb-2">
              {s.env}
            </div>
            <KV rows={s.rows} mono />
          </div>
        ))}
      </Section>

      {/* Integration status (live) */}
      {data && (
        <Section title="Integration status (live)">
          <StatusRow label="Database" ok={data.integrations.database.status === "connected"} detail={data.integrations.database.host} />
          <StatusRow label="Email (Resend)" ok={data.integrations.email_resend.configured} detail={data.integrations.email_resend.from} />
          <StatusRow label="GST verify (RapidAPI)" ok={data.integrations.gst_rapidapi.configured} detail={data.integrations.gst_rapidapi.host} />
          <StatusRow label="Storage (Vercel Blob)" ok={data.integrations.storage_blob.configured} detail={data.integrations.storage_blob.provider} />
          <StatusRow label="WhatsApp OTP" ok={data.integrations.whatsapp_otp.configured} detail={data.integrations.whatsapp_otp.note} neutral />
        </Section>
      )}

      {/* Runtime */}
      {data && (
        <Section title="Runtime (backend)">
          <KV rows={[
            ["Environment", data.runtime.nodeEnv],
            ["Port", data.runtime.port],
            ["Uptime", fmtUptime(data.runtime.uptimeSeconds)],
            ["Bun", data.runtime.bunVersion],
            ["Checked", new Date(data.runtime.timestamp).toLocaleString()],
          ]} />
        </Section>
      )}

      {/* Environment variables (masked) */}
      {data && (
        <Section title="Environment variables (backend, masked)">
          {Object.entries(data.env).map(([group, fields]) => (
            <div key={group} className="mb-4 last:mb-0">
              <div className="text-[11px] font-bold mono tracking-wider uppercase text-ink-3 mb-2">{group}</div>
              <div className="rounded-[10px] border border-line overflow-hidden">
                {Object.entries(fields).map(([k, f]) => (
                  <div key={k} className="flex items-center justify-between gap-3 px-3 py-2 border-b border-line last:border-b-0 text-[12px]">
                    <span className="mono text-ink-2">{k}</span>
                    <span className="flex items-center gap-2">
                      <span className={`mono text-[11px] ${f.set ? "text-ink" : "text-[color:var(--danger)]"}`}>
                        {f.value ?? f.hint}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${f.set ? "bg-[color:var(--accent)]" : "bg-[color:var(--danger)]"}`} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Deploy */}
      <Section title="Deploy & infrastructure">
        <KV rows={DEPLOY} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-ink mb-3">{title}</h2>
      <Card className="!p-4">{children}</Card>
    </div>
  );
}

function KV({ rows, mono }: { rows: string[][]; mono?: boolean }) {
  return (
    <div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 py-2 border-b border-line last:border-b-0 text-[13px]">
          <span className="text-ink-3 flex-shrink-0">{k}</span>
          <span className={`text-right text-ink ${mono ? "mono text-[11px] break-all" : ""}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function StatusRow({ label, ok, detail, neutral }: { label: string; ok: boolean; detail: string; neutral?: boolean }) {
  const color = neutral ? "bg-ink-3" : ok ? "bg-[color:var(--accent)]" : "bg-[color:var(--danger)]";
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-line last:border-b-0 text-[13px]">
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-ink">{label}</span>
      </span>
      <span className="mono text-[11px] text-ink-3 text-right break-all">
        {neutral ? detail : ok ? detail : "not configured"}
      </span>
    </div>
  );
}
