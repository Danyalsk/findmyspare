"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { notificationsApi } from "@/lib/api";
import type { AppNotification } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await notificationsApi.list({ limit: 50 });
      setItems(res.notifications);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed"));
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Notifications"
        backHref="/profile"
        rightAction={
          items.some((n) => !n.isRead) ? (
            <button onClick={markAll} className="text-[12px] font-bold text-[color:var(--accent-ink)]">Mark all read</button>
          ) : undefined
        }
      />
      <div className="px-5 pb-12 max-w-xl w-full mx-auto space-y-2">
        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : items.length === 0 ? (
          <Card className="text-center !p-8">
            <div className="text-[14px] font-medium mb-1">No notifications</div>
            <div className="text-[12px] text-ink-3">Order updates and messages will show up here.</div>
          </Card>
        ) : (
          items.map((n) => (
            <Card key={n.id} className={`!p-4 ${n.isRead ? "" : "border-l-2 border-l-[color:var(--accent)]"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-semibold text-ink">{n.title}</div>
                <div className="text-[10px] text-ink-3 shrink-0">{timeAgo(n.createdAt)}</div>
              </div>
              <div className="text-[12px] text-ink-2 mt-0.5">{n.message}</div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
