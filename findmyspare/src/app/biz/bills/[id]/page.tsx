"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi } from "@/lib/api/v3";
import { Skel, StatusChip } from "@/components/shop/ui";
import { LogoMark } from "@/components/brand/Logo";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, PAY_MODE, Page, PageHead, SellerOnly, btnGhost, btnPrimary, dateTime, num, useApi, waLink } from "@/components/biz/kit";

export default function BillView() {
  const { id } = useParams<{ id: string }>();
  const { isSeller } = useBiz();
  const r = useApi(isSeller && id ? `bill:${id}` : null, () => bizApi.bill(id));

  if (!isSeller) return <Page><SellerOnly what="Counter billing" /></Page>;
  if (r.error) return <Page><PageHead title="Bill" back="/biz/bills" /><ErrorCard message={r.error} onRetry={r.reload} /></Page>;
  if (!r.data) return <Page><Skel className="h-10 w-1/2 mb-4" /><Skel className="h-96" /></Page>;

  const { bill, seller } = r.data;
  const text = [
    `Namaste${bill.customerName ? " " + bill.customerName : ""}, here is your bill from ${seller.name}.`,
    `Bill ${bill.number} · ${dateTime(bill.createdAt)}`,
    ...bill.lines.map((l) => `• ${l.name} × ${l.quantity} = ${inr(l.total, { decimals: true })}`),
    `Total: ${inr(bill.total, { decimals: true })} (${PAY_MODE[bill.paymentMode]})`,
    bill.paymentMode === "credit" ? "Added to your udhaar. Please pay when convenient." : "Thank you!",
  ].join("\n");

  return (
    <Page>
      <PageHead
        title={`Bill ${bill.number}`}
        sub={dateTime(bill.createdAt)}
        back="/biz/bills"
      />

      <div className="grid grid-cols-3 sm:flex gap-2 mb-4 no-print">
        <a href={waLink(bill.customerPhone, text)} target="_blank" rel="noopener noreferrer" className={clsx(btnPrimary, "px-3 whitespace-nowrap sm:px-6")}><BI.wa size={18} /> <span className="sm:hidden">WhatsApp</span><span className="hidden sm:inline">Share on WhatsApp</span></a>
        <button onClick={() => window.print()} className={clsx(btnGhost, "px-3 whitespace-nowrap")}><BI.print size={18} /> Print</button>
        <Link href="/biz/bill" className={clsx(btnGhost, "px-3 whitespace-nowrap")}><BI.plus size={18} /> New bill</Link>
      </div>

      {/* The printable bill */}
      <article className="card p-5 md:p-8 print:shadow-none print:p-0">
        <header className="flex items-start justify-between gap-4 pb-4 border-b border-dashed border-line-2">
          <div className="min-w-0">
            <div className="text-[20px] md:text-[22px] font-extrabold tracking-tight">{seller.name}</div>
            <div className="text-[13px] text-ink-3 font-semibold">{[seller.city, seller.phone].filter(Boolean).join(" · ")}</div>
            {seller.gst && <div className="text-[12.5px] text-ink-3 font-semibold mono mt-0.5">GSTIN {seller.gst}</div>}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-3">Tax invoice</div>
            <div className="text-[15px] font-extrabold mono">{bill.number}</div>
            <div className="mt-1"><StatusChip tone={bill.paymentMode === "credit" ? "amber" : "green"}>{bill.paymentMode === "credit" ? "Udhaar" : `Paid · ${PAY_MODE[bill.paymentMode]}`}</StatusChip></div>
          </div>
        </header>

        <div className="py-3 text-[13.5px] font-semibold text-ink-2 border-b border-dashed border-line-2">
          Bill to: <span className="font-extrabold text-ink">{bill.customerName || "Walk-in customer"}</span>{bill.customerPhone && <span className="text-ink-3"> · {bill.customerPhone}</span>}
        </div>

        <table className="w-full text-[13.5px] mt-2">
          <thead>
            <tr className="text-left text-[11.5px] uppercase tracking-wider text-ink-3">
              <th className="py-2 font-extrabold">Item</th>
              <th className="py-2 font-extrabold text-right">Qty</th>
              <th className="py-2 font-extrabold text-right hidden sm:table-cell print:table-cell">Rate</th>
              <th className="py-2 font-extrabold text-right hidden sm:table-cell print:table-cell">GST</th>
              <th className="py-2 font-extrabold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {bill.lines.map((l, i) => (
              <tr key={i} className="align-top">
                <td className="py-2.5 pr-2 font-bold">{l.name}<div className="sm:hidden print:hidden text-[12px] text-ink-3 font-semibold">{inr(l.unitPrice, { decimals: true })} + {l.gstRate}% GST</div></td>
                <td className="py-2.5 text-right tabular-nums font-bold">{l.quantity}</td>
                <td className="py-2.5 text-right tabular-nums hidden sm:table-cell print:table-cell">{inr(l.unitPrice, { decimals: true })}</td>
                <td className="py-2.5 text-right tabular-nums hidden sm:table-cell print:table-cell">{l.gstRate}%</td>
                <td className="py-2.5 text-right tabular-nums font-extrabold">{inr(l.total, { decimals: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-3 pt-3 border-t border-dashed border-line-2 ml-auto max-w-[280px] space-y-1 text-[14px]">
          <div className="flex justify-between text-ink-3 font-semibold"><dt>Taxable value</dt><dd className="tabular-nums">{inr(bill.subtotal, { decimals: true })}</dd></div>
          <div className="flex justify-between text-ink-3 font-semibold"><dt>CGST</dt><dd className="tabular-nums">{inr(num(bill.tax) / 2, { decimals: true })}</dd></div>
          <div className="flex justify-between text-ink-3 font-semibold"><dt>SGST</dt><dd className="tabular-nums">{inr(num(bill.tax) / 2, { decimals: true })}</dd></div>
          <div className="flex justify-between text-[20px] font-extrabold pt-1"><dt>Total</dt><dd className="tabular-nums">{inr(bill.total, { decimals: true })}</dd></div>
        </dl>

        <footer className="mt-6 pt-4 border-t border-line flex items-center gap-2 text-[11.5px] text-ink-4 font-semibold">
          <LogoMark size={14} color="currentColor" /> Billed on FindMySpare
        </footer>
      </article>
    </Page>
  );
}
