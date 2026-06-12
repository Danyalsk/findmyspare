"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

type Flag = Awaited<ReturnType<typeof adminApi.listFlags>>["items"][number];
type Status = "open" | "reviewed" | "actioned" | "dismissed";

export default function ModerationPage() {
  const [status, setStatus] = useState<Status>("open");
  const [items, setItems] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.listFlags({ status });
      setItems(res.items);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load moderation queue"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function action(id: string, type: "hide" | "dismiss") {
    try {
      await adminApi.actionFlag(id, type);
      toast.success(type === "hide" ? "Content hidden" : "Flag dismissed");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Action failed"));
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Moderation</h1>
          <p className="text-[13px] text-ink-3 mt-0.5">
            User-reported content awaiting review.
          </p>
        </div>
        <div className="flex gap-1 bg-paper-2 p-1 rounded-[10px]">
          {(["open", "reviewed", "actioned", "dismissed"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-colors ${status === s ? "bg-paper text-ink shadow-sm" : "text-ink-3 hover:text-ink"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Card variant="accent" className="!p-3 mb-4 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      {loading ? (
        <div className="text-[13px] text-ink-3">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-[13px] text-ink-3 py-10 text-center bg-paper rounded-[14px] border border-line">
          No items in this queue.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((f) => (
            <li key={f.id} className="rounded-[14px] bg-paper border border-line p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold mono tracking-wider uppercase text-[color:var(--accent-ink)]">
                      {f.contentType}
                    </span>
                    <span className="text-[11px] text-ink-3 mono">
                      {f.contentId.slice(0, 8)}…
                    </span>
                    <span className="text-[11px] text-ink-3">
                      {new Date(f.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[14px] text-ink mb-1">{f.reason}</div>
                  <div className="text-[11px] text-ink-3">
                    Reporter: {f.reporterId?.slice(0, 8) || "(deleted)"}
                  </div>
                </div>
                {status === "open" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="secondary" onClick={() => action(f.id, "dismiss")}>
                      Dismiss
                    </Button>
                    <Button variant="primary" onClick={() => action(f.id, "hide")}>
                      Hide content
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
