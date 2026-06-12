"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon } from "@/lib/icons";
import { adminApi, type AdminSupplierRow } from "@/lib/api/admin";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import type { VerificationStatus } from "@/lib/types";

const FILTERS: Array<{ label: string; value: VerificationStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const chipVariant = (s: VerificationStatus): "ok" | "warn" | "danger" | "default" =>
  s === "approved" ? "ok" : s === "pending" ? "warn" : s === "rejected" ? "danger" : "default";

export default function AdminAllSuppliersPage() {
  const [filter, setFilter] = useState<VerificationStatus | "all">("all");
  const [rows, setRows] = useState<AdminSupplierRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.listSuppliers(
          filter === "all" ? undefined : { status: filter }
        );
        if (!cancelled) setRows(res.suppliers);
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
      <TopBar title="All suppliers" backHref="/admin" />
      <div className="px-5 pb-8 max-w-3xl w-full mx-auto">
        <div className="flex gap-2 flex-wrap mb-4">
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
          <div className="text-[13px] text-ink-3 text-center py-12">No suppliers in this view.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((s) => (
              <Link key={s.id} href={`/admin/suppliers/${s.id}`}>
                <Card className="!p-4 flex items-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{s.businessName || s.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">{s.name} · {s.email}</div>
                  </div>
                  <Chip variant={chipVariant(s.verificationStatus)}>{s.verificationStatus}</Chip>
                  <ArrowRightIcon size={16} className="text-ink-3" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
