"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi, inr, type Invoice, type PayMethod } from "@/lib/api/v2";
import { PublicFrame } from "@/components/shop/PublicFrame";
import { MockGateway, PAY_METHODS } from "@/components/shop/MockGateway";
import { Skel, EmptyState } from "@/components/shop/ui";
import { getErrorMessage } from "@/lib/errors";
import { usePaymentsMode } from "@/lib/use-config";
import { QR } from "@/components/shop/QR";

export default function PayInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [upiId, setUpiId] = useState<string | null>(null);
  const payments = usePaymentsMode();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => { publicApi.invoiceForPay(token).then((r) => { setInv(r.invoice); setUpiId(r.upiId); }).catch((e) => setLoadErr(getErrorMessage(e, "Invoice not found"))); }, [token]);

  async function pay(method: PayMethod, fail: boolean) {
    setBusy(true); setError("");
    try {
      const r = await publicApi.payInvoice(token, method as Exclude<PayMethod, "cod">, fail ? "failure" : "success");
      if (r.payment.status === "succeeded") setInv((i) => i && { ...i, status: "paid", paymentMethod: method, paidAt: new Date().toISOString() });
      else setError("Payment declined. Try another method.");
    } catch (e) { setError(getErrorMessage(e, "Payment failed")); }
    finally { setBusy(false); }
  }

  if (loadErr) return <PublicFrame><EmptyState title="Payment link not valid" body={loadErr} /></PublicFrame>;
  if (!inv) return <PublicFrame><Skel className="h-96" /></PublicFrame>;

  return (
    <PublicFrame badge="Secure payment">
      {inv.status === "paid" ? (
        <div className="card p-8 text-center fms-fade-up">
          <div className="mx-auto w-20 h-20 rounded-full bg-[color:var(--success)] text-white flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg></div>
          <h1 className="text-[24px] font-extrabold mt-4">Paid to {inv.seller.name}</h1>
          <p className="text-[14.5px] text-ink-2 mt-1">{inr(inv.total, { decimals: true })} for {inv.vehicle.regNo} · Invoice {inv.number}</p>
          <p className="text-[13px] text-ink-3 mt-3">This service and every part fitted are saved to the vehicle&apos;s Passport.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <div className="card p-5">
            <div className="text-[13px] font-bold text-ink-3">Invoice {inv.number}</div>
            <div className="text-[20px] font-extrabold mt-0.5">{inv.seller.name}</div>
            <div className="mt-2 flex items-center gap-2"><span className="reg-plate text-[12px]">{inv.vehicle.regNo}</span><span className="text-[13px] font-semibold text-ink-3">{inv.vehicle.label}</span></div>
            <ul className="mt-4 divide-y divide-line text-[13.5px]">{inv.lines.map((l, i) => <li key={i} className="flex justify-between py-2"><span>{l.name}</span><b>{inr(l.total, { decimals: true })}</b></li>)}</ul>
            <div className="flex justify-between border-t border-dashed border-line-2 pt-3 text-[16px]"><span className="font-extrabold">Total</span><span className="price">{inr(inv.total, { decimals: true })}</span></div>
          </div>
          {payments === "mock" ? (
            <MockGateway amount={inv.total} onPay={pay} busy={busy} error={error} methods={PAY_METHODS.filter((m) => m.id !== "cod")} />
          ) : (
            <div className="card p-6 text-center">
              {upiId ? (
                <>
                  <div className="text-[16px] font-extrabold">Pay {inr(inv.total, { decimals: true })} by UPI</div>
                  <div className="mx-auto mt-4 w-fit rounded-[14px] border border-line p-3"><QR value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(inv.seller.name)}&am=${inv.total}&cu=INR&tn=${encodeURIComponent(inv.number)}`} size={168} /></div>
                  <div className="mt-3 mono text-[14px] font-bold">{upiId}</div>
                  <a href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(inv.seller.name)}&am=${inv.total}&cu=INR&tn=${encodeURIComponent(inv.number)}`} className="mt-4 inline-flex h-12 px-6 items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold md:hidden">Open UPI app</a>
                  <p className="mt-3 text-[12.5px] text-ink-3">Paid directly to the garage. They&apos;ll mark the invoice paid.</p>
                </>
              ) : <div className="text-[15px] font-bold">Please pay at the garage. Online payments are launching soon.</div>}
            </div>
          )}
        </div>
      )}
    </PublicFrame>
  );
}
