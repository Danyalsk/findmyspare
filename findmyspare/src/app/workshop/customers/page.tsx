"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { garageApi, inr } from "@/lib/api/v2";
import { Skel, EmptyState } from "@/components/shop/ui";

type Row = Awaited<ReturnType<typeof garageApi.customers>>["customers"][number];

export default function CustomersPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { garageApi.customers().then((r) => setRows(r.customers)).catch(() => setRows([])); }, []);
  return (
    <div className="max-w-[960px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link href="/workshop" className="text-[13px] font-bold text-ink-3">← Workshop</Link>
      <h1 className="text-[28px] font-extrabold tracking-tight mt-2">Customers & vehicles</h1>
      <div className="mt-5 card divide-y divide-line">
        {!rows ? <div className="p-5"><Skel className="h-12" /></div> : !rows.length ? <EmptyState title="No customers yet" /> : rows.map((r) => (
          <div key={r.vehicle_id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
            <span className="reg-plate text-[12px]">{r.reg_no_display}</span>
            <div className="flex-1 min-w-[160px]"><div className="text-[14.5px] font-extrabold">{r.customer_name ?? "Walk-in"} · {r.make_name} {r.model_name}</div><div className="text-[12.5px] text-ink-3 font-semibold">{r.visits} visit{r.visits > 1 ? "s" : ""} · last {format(new Date(r.last_visit), "d MMM yyyy")}{r.customer_phone ? ` · ${r.customer_phone}` : ""}</div></div>
            <span className="price">{inr(r.spent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
