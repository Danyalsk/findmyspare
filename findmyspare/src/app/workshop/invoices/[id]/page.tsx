"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { garageApi, inr, type Garage, type Invoice } from "@/lib/api/v2";
import { InvoiceDoc } from "@/components/shop/InvoiceDoc";
import { QR } from "@/components/shop/QR";
import { Skel } from "@/components/shop/ui";
import { useOrigin } from "@/lib/use-mounted";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function WorkshopInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [garage, setGarage] = useState<Garage | null>(null);
  const origin = useOrigin();
  const load = useCallback(() => garageApi.getInvoice(id).then((r) => { setInv(r.invoice); setGarage(r.garage); }).catch((e) => toast.error(getErrorMessage(e, "Couldn't load invoice"))), [id]);
  useEffect(() => { load(); }, [load]);

  if (!inv) return <div className="max-w-[900px] mx-auto px-4 py-8"><Skel className="h-[600px]" /></div>;
  const payUrl = `${origin}/pay/invoice/${inv.payToken}`;
  const upi = garage?.upiId ? `upi://pay?pa=${encodeURIComponent(garage.upiId)}&pn=${encodeURIComponent(garage.name)}&am=${inv.total}&cu=INR&tn=${encodeURIComponent(inv.number)}` : null;

  async function markPaid(method: "cash" | "upi" | "card") {
    try { const r = await garageApi.markPaid(inv!.id, method); setInv(r.invoice); toast.success("Marked as paid"); }
    catch (e) { toast.error(getErrorMessage(e, "Couldn't update")); }
  }

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 md:py-8 grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div>
          <div className="flex items-center justify-between no-print mb-3">
            <Link href={`/workshop/jobs/${inv.jobCardId}`} className="text-[13px] font-bold text-ink-3">← Job card</Link>
            <button onClick={() => window.print()} className="h-10 px-4 rounded-[12px] bg-paper border border-line-2 text-[13.5px] font-extrabold">Print / PDF</button>
          </div>
          <InvoiceDoc inv={inv} origin={origin} />
        </div>
        <aside className="space-y-4 no-print lg:sticky lg:top-[88px]">
          {inv.status === "unpaid" ? (
            <>
              <div className="card p-5">
                <div className="text-[16px] font-extrabold">Collect {inr(inv.total)}</div>
                {upi && <div className="mt-3 flex items-center gap-3"><div className="rounded-[12px] border border-line p-2"><QR value={upi} size={96} /></div><div className="text-[12.5px] text-ink-3">Customer scans to pay<br /><b className="text-ink mono">{garage?.upiId}</b></div></div>}
                <div className="mt-4 grid grid-cols-3 gap-2">{(["cash", "upi", "card"] as const).map((m) => <button key={m} onClick={() => markPaid(m)} className="h-10 rounded-[10px] border border-line-2 text-[13px] font-extrabold uppercase">{m}</button>)}</div>
                <p className="mt-2 text-[12px] text-ink-3">Tap how they paid at the counter.</p>
              </div>
              <div className="card p-5">
                <div className="text-[16px] font-extrabold">Or send a payment link</div>
                <div className="mt-2 mono text-[12px] break-all bg-paper-2 rounded-[10px] p-2.5">{payUrl}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={`https://wa.me/${(inv.customer.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Invoice ${inv.number} for ${inv.vehicle.regNo}: ${inr(inv.total)}. Pay securely: ${payUrl}`)}`} target="_blank" rel="noopener noreferrer" className="h-10 rounded-[10px] bg-[#25D366] text-white text-[13px] font-extrabold flex items-center justify-center">WhatsApp</a>
                  <Link href={`/pay/invoice/${inv.payToken}`} target="_blank" className="h-10 rounded-[10px] border border-line-2 text-[13px] font-extrabold flex items-center justify-center">Open</Link>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-5 bg-[color:var(--success-wash)]"><div className="text-[16px] font-extrabold text-[color:var(--success)]">✓ Paid</div><div className="text-[13px] text-ink-2 mt-1">Recorded in the customer&apos;s service history with every part&apos;s warranty.</div></div>
          )}
          <Link href={`/verify/${inv.verifyCode}`} target="_blank" className="card p-4 flex items-center justify-between"><span className="text-[14px] font-extrabold">Check verification page</span><span className="mono text-[12px] text-ink-3">{inv.verifyCode}</span></Link>
        </aside>
      </div>
    </div>
  );
}
