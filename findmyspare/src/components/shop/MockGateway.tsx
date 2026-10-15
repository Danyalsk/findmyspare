"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { inr, type PayMethod } from "@/lib/api/v2";
import { LogoMark } from "@/components/brand/Logo";

export const PAY_METHODS: { id: PayMethod; label: string; sub: string }[] = [
  { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm, BHIM" },
  { id: "card", label: "Credit / debit card", sub: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Netbanking", sub: "All major banks" },
  { id: "cod", label: "Pay on delivery", sub: "Cash or UPI to the courier" },
];

/** Shared "gateway" panel used by checkout and invoice payment. */
export function MockGateway({ amount, onPay, busy, methods = PAY_METHODS, error }: { amount: string; onPay: (m: PayMethod, fail: boolean) => void; busy: boolean; methods?: typeof PAY_METHODS; error?: string }) {
  const [method, setMethod] = useState<PayMethod>("upi");
  const [vpa, setVpa] = useState("arjun@okicici");
  const [fail, setFail] = useState(false);
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 bg-ink text-white flex items-center justify-between">
        <div className="flex items-center gap-2"><LogoMark size={22} /><span className="font-extrabold">FMS Pay</span></div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[color:var(--amber)] text-white px-2 py-1 rounded-[6px]">Test mode · no real money</span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between"><span className="text-[14px] font-bold text-ink-3">Amount</span><span className="price text-[26px]">{inr(amount, { decimals: true })}</span></div>
        <div className="mt-4 space-y-2" role="radiogroup" aria-label="Payment method">
          {methods.map((m) => (
            <button key={m.id} role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)} className={clsx("w-full flex items-center gap-3 p-3.5 rounded-[14px] border-2 text-left transition-colors", method === m.id ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)]" : "border-line hover:border-line-2")}>
              <span className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center", method === m.id ? "border-[color:var(--accent)]" : "border-line-2")}>{method === m.id && <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--accent)]" />}</span>
              <span className="flex-1"><span className="block text-[15px] font-extrabold">{m.label}</span><span className="block text-[12.5px] text-ink-3 font-semibold">{m.sub}</span></span>
            </button>
          ))}
        </div>
        {method === "upi" && (
          <div className="mt-4">
            <div className="flex gap-2">{["GPay", "PhonePe", "Paytm"].map((a) => <span key={a} className="chip !h-9">{a}</span>)}</div>
            <input value={vpa} onChange={(e) => setVpa(e.target.value)} className="mt-3 w-full h-12 px-4 rounded-[12px] bg-paper-2 text-[15px] font-semibold outline-none focus:bg-paper focus:ring-2 focus:ring-[color:var(--accent)]" aria-label="UPI ID" />
          </div>
        )}
        {method === "card" && <div className="mt-4 mono text-[13px] text-ink-3 rounded-[12px] bg-paper-2 p-3">Test card 4111 1111 1111 1111 · 12/30 · CVV 123</div>}
        <label className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-ink-3 cursor-pointer select-none">
          <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} className="w-4 h-4 accent-[color:var(--accent)]" />
          Simulate a declined payment
        </label>
        {error && <div className="mt-3 rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3">{error}</div>}
        <button disabled={busy} onClick={() => onPay(method, fail)} className="mt-4 w-full h-[54px] rounded-[14px] bg-[color:var(--accent)] text-white text-[16px] font-extrabold disabled:opacity-60 fms-press">
          {busy ? "Processing…" : method === "cod" ? "Place order" : `Pay ${inr(amount)}`}
        </button>
        <p className="mt-3 text-[12px] text-ink-3 text-center">Swap in Razorpay/Cashfree by replacing <span className="mono">completeMockPayment</span> on the server.</p>
      </div>
    </div>
  );
}

