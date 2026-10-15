"use client";

import { format } from "date-fns";
import { LogoMark } from "@/components/brand/Logo";
import { inr, type Invoice } from "@/lib/api/v2";
import { QR } from "./QR";
import { hasPlate } from "@/components/service/MachineId";

type Doc = Pick<Invoice, "number" | "issuedAt" | "seller" | "customer" | "vehicle" | "lines" | "taxable" | "cgst" | "sgst" | "total" | "verifyCode" | "status" | "paidAt" | "paymentMethod"> & { contentHash?: string };

/** A4-friendly GST tax invoice with verification QR (prints cleanly). */
export function InvoiceDoc({ inv, origin }: { inv: Doc; origin: string }) {
  const verifyUrl = `${origin}/verify/${inv.verifyCode}`;
  return (
    <article className="bg-white text-[#1B1E24] rounded-[18px] shadow-[var(--shadow-card)] overflow-hidden print:shadow-none print:rounded-none" aria-label={`Invoice ${inv.number}`}>
      <div className="h-2 bg-[#E5461B]" />
      <div className="p-6 md:p-8">
        <header className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[22px] font-extrabold tracking-tight">{inv.seller.name}</div>
            {inv.seller.address && <div className="text-[13px] text-[#5B6170] max-w-[320px]">{inv.seller.address}</div>}
            <div className="text-[13px] text-[#5B6170]">{inv.seller.phone}{inv.seller.gstin ? <> · GSTIN <span className="font-mono">{inv.seller.gstin}</span></> : null}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#5B6170]">Tax invoice</div>
            <div className="text-[18px] font-extrabold font-mono">{inv.number}</div>
            <div className="text-[13px] text-[#5B6170]">{format(new Date(inv.issuedAt), "d MMM yyyy, h:mm a")}</div>
          </div>
        </header>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-[13.5px]">
          <div className="rounded-[12px] bg-[#F6F6F8] p-4"><div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B6170]">Billed to</div><div className="font-bold mt-1">{inv.customer.name ?? "Customer"}</div>{inv.customer.phone && <div className="text-[#5B6170]">{inv.customer.phone}</div>}</div>
          <div className="rounded-[12px] bg-[#F6F6F8] p-4"><div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B6170]">{hasPlate(inv.vehicle.regNo) ? "Vehicle" : "Machine"}</div>{inv.vehicle.regNo && inv.vehicle.regNo !== "Machine" && <div className="font-bold mt-1 font-mono">{inv.vehicle.regNo}</div>}<div className="text-[#5B6170]">{inv.vehicle.label}{inv.vehicle.odometerKm ? ` · ${inv.vehicle.odometerKm.toLocaleString("en-IN")} km` : ""}</div></div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-[13px] min-w-[560px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-[#5B6170] border-b border-[#E9E9EE]">
              <th className="py-2 pr-2">Item</th><th className="py-2 px-2">HSN/SAC</th><th className="py-2 px-2 text-right">Qty</th><th className="py-2 px-2 text-right">Rate</th><th className="py-2 px-2 text-right">Taxable</th><th className="py-2 px-2 text-right">GST</th><th className="py-2 pl-2 text-right">Amount</th>
            </tr></thead>
            <tbody>
              {inv.lines.map((l, i) => (
                <tr key={i} className="border-b border-[#E9E9EE] align-top">
                  <td className="py-2.5 pr-2"><div className="font-bold">{l.brand ? `${l.brand} ` : ""}{l.name}</div>{l.partNumber && <div className="text-[11.5px] text-[#5B6170] font-mono">#{l.partNumber}</div>}</td>
                  <td className="py-2.5 px-2 font-mono">{l.hsnSac ?? "—"}</td>
                  <td className="py-2.5 px-2 text-right">{l.quantity}</td>
                  <td className="py-2.5 px-2 text-right">{inr(l.unitPrice, { decimals: true })}</td>
                  <td className="py-2.5 px-2 text-right">{inr(l.taxable, { decimals: true })}</td>
                  <td className="py-2.5 px-2 text-right">{l.gstRate}%</td>
                  <td className="py-2.5 pl-2 text-right font-bold">{inr(l.total, { decimals: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="rounded-[12px] border border-[#D6D7DE] p-2.5"><QR value={verifyUrl} size={104} /></div>
            <div className="text-[12.5px]">
              <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#E7F5EF] text-[#0B7A53] font-extrabold"><LogoMark size={14} color="currentColor" /> FMS Verified invoice</div>
              <div className="mt-2 text-[#5B6170]">Scan or visit <b className="text-[#1B1E24]">findmyspare.com/verify</b></div>
              <div className="font-mono font-bold text-[15px] mt-0.5">{inv.verifyCode}</div>
              {inv.contentHash && <div className="font-mono text-[10.5px] text-[#8A909C] mt-1">fingerprint {inv.contentHash.slice(0, 16)}…</div>}
            </div>
          </div>
          <dl className="min-w-[240px] text-[13.5px] space-y-1.5">
            <div className="flex justify-between"><dt className="text-[#5B6170]">Taxable value</dt><dd className="font-bold">{inr(inv.taxable, { decimals: true })}</dd></div>
            <div className="flex justify-between"><dt className="text-[#5B6170]">CGST</dt><dd className="font-bold">{inr(inv.cgst, { decimals: true })}</dd></div>
            <div className="flex justify-between"><dt className="text-[#5B6170]">SGST</dt><dd className="font-bold">{inr(inv.sgst, { decimals: true })}</dd></div>
            <div className="flex justify-between text-[18px] border-t border-[#D6D7DE] pt-2"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{inr(inv.total, { decimals: true })}</dd></div>
            <div className="pt-1 text-right">
              {inv.status === "paid"
                ? <span className="inline-block rotate-[-4deg] border-2 border-[#0B7A53] text-[#0B7A53] font-extrabold uppercase tracking-wider px-3 py-1 rounded-[8px]">Paid{inv.paymentMethod ? ` · ${inv.paymentMethod}` : ""}{inv.paidAt ? ` · ${format(new Date(inv.paidAt), "d MMM")}` : ""}</span>
                : <span className="inline-block border-2 border-[#9A6700] text-[#9A6700] font-extrabold uppercase tracking-wider px-3 py-1 rounded-[8px]">Payment due</span>}
            </div>
          </dl>
        </div>
        <footer className="mt-6 pt-4 border-t border-[#E9E9EE] text-[11.5px] text-[#8A909C] flex items-center justify-between gap-3 flex-wrap">
          <span>Prices exclusive of GST; intra-state supply (CGST + SGST). Computer-generated invoice.</span>
          <span className="inline-flex items-center gap-1.5 font-bold"><LogoMark size={14} /> Powered by FindMySpare Workshop</span>
        </footer>
      </div>
    </article>
  );
}
