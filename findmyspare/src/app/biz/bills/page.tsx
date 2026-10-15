"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi } from "@/lib/api/v3";
import { EmptyState, Skel, StatusChip } from "@/components/shop/ui";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, PAY_MODE, Page, PageHead, SellerOnly, btnSmall, dateTime, num, useApi } from "@/components/biz/kit";

export default function BillsList() {
  const { isSeller, today } = useBiz();
  const r = useApi(isSeller ? "bills" : null, () => bizApi.bills());
  if (!isSeller) return <Page><PageHead title="Bills" back="/biz" /><SellerOnly what="Counter billing" /></Page>;

  const bills = r.data?.bills ?? [];
  return (
    <Page>
      <PageHead
        title="Bills"
        sub={`Today ${inr(today.sales_today)} · ${today.bills_today} bill${today.bills_today === 1 ? "" : "s"} · This month ${inr(today.sales_month)}`}
        back="/biz"
        action={<Link href="/biz/bill" className={clsx(btnSmall, "bg-[color:var(--accent)] text-white h-10")}><BI.plus size={16} /> New bill</Link>}
      />
      {r.error ? <ErrorCard message={r.error} onRetry={r.reload} /> : !r.data ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skel key={i} className="h-16" />)}</div>
      ) : !bills.length ? (
        <EmptyState title="No bills yet" body="Make your first counter bill. It updates stock and, for udhaar, your khata." action={<Link href="/biz/bill" className="h-11 px-5 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">New bill</Link>} />
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {bills.map((b) => (
            <li key={b.id}>
              <Link href={`/biz/bills/${b.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-2">
                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] font-extrabold truncate">{b.customerName || b.customerPhone || "Walk-in"}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{b.number} · {b.lines.length} item{b.lines.length === 1 ? "" : "s"} · {dateTime(b.createdAt)}</span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="block text-[15px] font-extrabold tabular-nums">{inr(num(b.total))}</span>
                  <StatusChip tone={b.paymentMode === "credit" ? "amber" : "grey"} className="mt-0.5">{PAY_MODE[b.paymentMode]}</StatusChip>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
