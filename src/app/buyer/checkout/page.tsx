"use client";

import Link from "next/link";
import { BackIcon, ShieldIcon, CheckIcon, WalletIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/* ═══════════════════════════════════════════════════════
   Checkout — redesigned with escrow-first flow
   Step progress, order summary, payment method
   ═══════════════════════════════════════════════════════ */

const steps = [
  { label: "Review", done: true },
  { label: "Payment", done: false, active: true },
  { label: "Confirm", done: false },
];

export default function CheckoutPage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* Header */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <Link
          href="/buyer/cart"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="serif text-[24px] leading-[1.05]">Checkout</div>
      </div>

      {/* Step progress */}
      <div className="px-5 pt-5 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${
                s.done
                  ? "bg-ink text-paper"
                  : s.active
                  ? "bg-accent text-paper"
                  : "bg-paper-2 border border-line text-ink-3"
              }`}
            >
              {s.done ? <CheckIcon size={14} /> : i + 1}
            </div>
            <span className={`text-[11px] ${s.active ? "font-medium text-ink" : "text-ink-3"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-line ml-1" />
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pt-5 flex-1 space-y-4">
        {/* Order summary dark card */}
        <Card variant="dark" className="!p-4">
          <div className="mono text-[10px] opacity-50 tracking-[0.1em]">ORDER SUMMARY</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="opacity-70">OEM Brake pad set ×1</span>
              <span className="mono">₹3,200</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="opacity-70">Brake caliper LH ×1</span>
              <span className="mono">₹5,400</span>
            </div>
            <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="mono">₹8,600</span>
            </div>
          </div>
        </Card>

        {/* Payment methods */}
        <div className="mono text-[10px] text-ink-3 tracking-[0.12em] pt-2">
          PAYMENT METHOD
        </div>
        <div className="space-y-2">
          <Card className="!p-3.5 flex items-center gap-3 cursor-pointer border-[1.5px] !border-ink">
            <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center">
              <WalletIcon size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium">UPI</div>
              <div className="text-[11px] text-ink-3">Google Pay, PhonePe, Paytm</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-ink" />
          </Card>

          <Card className="!p-3.5 flex items-center gap-3 cursor-pointer opacity-60">
            <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center">
              <WalletIcon size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium">Debit / Credit card</div>
              <div className="text-[11px] text-ink-3">Visa, Mastercard, RuPay</div>
            </div>
            <div className="w-4 h-4 rounded-full border border-line" />
          </Card>

          <Card className="!p-3.5 flex items-center gap-3 cursor-pointer opacity-60">
            <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center">
              <WalletIcon size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium">Net banking</div>
              <div className="text-[11px] text-ink-3">All major banks</div>
            </div>
            <div className="w-4 h-4 rounded-full border border-line" />
          </Card>
        </div>

        {/* Escrow explanation */}
        <Card variant="accent" className="!p-3">
          <div className="flex gap-2.5 items-start">
            <ShieldIcon size={18} className="text-accent-ink flex-shrink-0 mt-0.5" />
            <div className="text-xs text-accent-ink leading-[1.4]">
              <span className="font-semibold">Secure escrow.</span> ₹8,600 will be held safely until you confirm delivery and fitment.
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 py-3.5 border-t border-line">
        <Link href="/buyer/payment">
          <Button variant="primary" block>
            Fund escrow · ₹8,600
          </Button>
        </Link>
      </div>
    </div>
  );
}
