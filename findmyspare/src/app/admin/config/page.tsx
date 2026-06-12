"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";

type Cfg = Awaited<ReturnType<typeof adminApi.getConfig>>["config"];

export default function ConfigPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    adminApi
      .getConfig()
      .then((r) => setCfg(r.config))
      .catch((e) => setError(getErrorMessage(e, "Could not load config")));
  }, [user, router]);

  async function save() {
    if (!cfg) return;
    setSaving(true);
    setError("");
    setOk(false);
    try {
      await adminApi.updateConfig({
        maintenanceMode: cfg.maintenanceMode,
        waitlistOnly: cfg.waitlistOnly,
        signupsOpen: cfg.signupsOpen,
        bannerText: cfg.bannerText ?? "",
      });
      setOk(true);
    } catch (e) {
      setError(getErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  if (!user || user.role !== "super_admin") return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-[24px] font-semibold tracking-tight mb-1">Platform config</h1>
      <p className="text-[13px] text-ink-3 mb-6">
        Super-admin controls. Changes apply immediately to all users.
      </p>

      {error && (
        <Card variant="accent" className="!p-3 mb-4 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}
      {ok && (
        <Card variant="accent" className="!p-3 mb-4">
          <span className="text-sm text-ink">Config saved.</span>
        </Card>
      )}

      {!cfg ? (
        <div className="text-[13px] text-ink-3">Loading…</div>
      ) : (
        <div className="space-y-4">
          <Toggle
            label="Maintenance mode"
            description="Public routes return 503. Admin login still works."
            value={cfg.maintenanceMode}
            onChange={(v) => setCfg({ ...cfg, maintenanceMode: v })}
          />
          <Toggle
            label="Signups open"
            description="Disable to stop new buyer/supplier registrations."
            value={cfg.signupsOpen}
            onChange={(v) => setCfg({ ...cfg, signupsOpen: v })}
          />
          <div>
            <label className="block text-[11px] font-bold mono tracking-wider uppercase text-ink-3 mb-1.5">
              Site banner text
            </label>
            <input
              type="text"
              value={cfg.bannerText ?? ""}
              onChange={(e) => setCfg({ ...cfg, bannerText: e.target.value })}
              placeholder="Shown at the top of every page (leave blank to hide)."
              className="w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-[14px] bg-paper border border-line">
      <div className="flex-1">
        <div className="text-[14px] font-semibold text-ink">{label}</div>
        <div className="text-[12px] text-ink-3 mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[color:var(--accent)]" : "bg-paper-3"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-paper transition-transform ${value ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
