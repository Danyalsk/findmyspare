"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { garageApi, inr, type Invoice } from "@/lib/api/v2";
import { StatusChip, Skel, EmptyState } from "@/components/shop/ui";

export default function InvoicesPage() {
  const [list, setList] = useState<Invoice[] | null>(null);
  const [tab, setTab] = useState<"all" | "unpaid" | "paid">("all");
  useEffect(() => { garageApi.invoices().then((r) => setList(r.invoices)).catch(() => setList([])); }, []);
  const shown = useMemo(() => (list ?? []).filter((i) => tab === "all" || i.status === tab), [list, tab]);
  const due = (list ?? []).filter((i) => i.status === "unpaid").reduce((s, i) => s + parseFloat(i.total), 0);
  const got = (list ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + parseFloat(i.total), 0);
  return (
    <div className="max-w-[960px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link href="/workshop" className="text-[13px] font-bold text-ink-3">← Workshop</Link>
      <h1 className="text-[28px] font-extrabold tracking-tight mt-2">Invoices</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 max-w-[480px]">
        <div className="card p-4"><div className="text-[12px] font-bold text-ink-3">To collect</div><div className="text-[20px] font-extrabold text-[color:var(--amber)]">{inr(due)}</div></div>
        <div className="card p-4"><div className="text-[12px] font-bold text-ink-3">Collected</div><div className="text-[20px] font-extrabold text-[color:var(--success)]">{inr(got)}</div></div>
      </div>
      <div className="mt-5 flex gap-2">{(["all", "unpaid", "paid"] as const).map((t) => <button key={t} className="chip capitalize" data-on={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="mt-4 card divide-y divide-line">
        {!list ? <div className="p-5"><Skel className="h-12" /></div> : !shown.length ? <EmptyState title="No invoices yet" body="Generate one from any approved job card." /> : shown.map((i) => (
          <Link key={i.id} href={`/workshop/invoices/${i.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper-2">
            <div className="flex-1 min-w-0"><div className="text-[14.5px] font-extrabold mono">{i.number}</div><div className="text-[12.5px] text-ink-3 font-semibold">{i.vehicle.regNo || i.vehicle.label} · {i.customer.name ?? "Customer"} · {format(new Date(i.issuedAt), "d MMM")}</div></div>
            <StatusChip tone={i.status === "paid" ? "green" : "amber"}>{i.status}</StatusChip>
            <span className="price w-24 text-right">{inr(i.total)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
