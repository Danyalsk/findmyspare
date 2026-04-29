"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { adminApi } from "@/lib/api/admin";
import type { AdminInquiryRow } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const FILTERS: Array<{ label: string; value: "all" | "open" | "responded" | "closed" }> = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Responded", value: "responded" },
  { label: "Closed", value: "closed" },
];

export default function AdminInquiriesPage() {
  const [filter, setFilter] = useState<"all" | "open" | "responded" | "closed">("all");
  const [rows, setRows] = useState<AdminInquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.listInquiries(
          filter === "all" ? undefined : { status: filter }
        );
        if (!cancelled) setRows(res.inquiries);
      } catch (e: unknown) {
        if (!cancelled) toast.error(getErrorMessage(e, "Failed to load"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="All inquiries" backHref="/admin" />
      <div className="px-5 pb-12 max-w-5xl w-full mx-auto space-y-4">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                filter === f.value
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper-2 text-ink-2 border-line hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-[13px] text-ink-3 text-center py-12">No inquiries.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((r) => (
              <Card key={r.id} className="!p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.partName}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">
                    {r.make} {r.model} · {r.year}
                  </div>
                  <div className="text-[11px] text-ink-3 mt-1">
                    Posted by{" "}
                    <Link href={`/admin/users/${r.buyerId}`} className="text-accent-ink hover:underline">
                      {r.buyerName || r.buyerEmail || "buyer"}
                    </Link>{" "}
                    · {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Chip variant={r.isActive ? "ok" : "default"}>
                    {r.isActive ? "Open" : r.status}
                  </Chip>
                  <span className="text-[10px] text-ink-3 mono">{r.bidCount} bids</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
