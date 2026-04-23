"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckIcon, ShieldIcon } from "@/lib/icons";
import { EscrowTimeline, EscrowStep } from "@/components/features/EscrowTimeline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const steps: EscrowStep[] = [
  { label: "Order placed", timestamp: "Just now", state: "done" },
  { label: "Escrow funded", timestamp: "Just now", description: "Payment safely deposited into escrow vault.", state: "active" },
  { label: "Supplier ships order", state: "pending" },
  { label: "Delivered & inspected", state: "pending" },
  { label: "Funds released", state: "pending" },
];

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "new";
  const displayId = orderId.replace("ord-", "").toUpperCase().slice(0, 8);

  return (
    <div className="flex-1 px-5 pt-12 pb-5 max-w-[400px] mx-auto w-full">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
        <CheckIcon size={32} className="text-paper" />
      </div>

      <h1 className="serif text-[36px] leading-[1.05] text-center">You&apos;re all set!</h1>
      <p className="text-ink-3 text-sm text-center mt-2 leading-[1.5]">
        Your order has been placed and payment is securely held in escrow.
      </p>

      {/* Order summary */}
      <Card className="!p-3.5 mt-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="mono text-[10px] text-ink-3 tracking-[0.1em]">ORDER ID</div>
            <div className="mono text-sm font-semibold mt-0.5">ORD-{displayId}</div>
          </div>
        </div>
      </Card>

      {/* Escrow status */}
      <Card variant="accent" className="!p-3.5 mt-3">
        <div className="flex gap-2.5 items-center">
          <ShieldIcon size={18} className="text-accent-ink flex-shrink-0" />
          <div className="text-xs text-accent-ink leading-[1.4]">
            <span className="font-semibold">Payment safely held</span> until you confirm delivery and fitment.
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="mt-6">
        <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-3">ESCROW TIMELINE</div>
        <EscrowTimeline steps={steps} />
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-2.5">
        <Link href={`/buyer/orders/${orderId}`}>
          <Button variant="primary" block>Track order</Button>
        </Link>
        <Link href="/buyer">
          <Button variant="default" block>Continue browsing</Button>
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Suspense fallback={<div className="flex-1" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
