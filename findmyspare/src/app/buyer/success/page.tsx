"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/lib/icons";

function SuccessInner() {
  const orderId = useSearchParams().get("order");

  return (
    <div className="min-h-dvh bg-paper-3 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white mb-5">
        <CheckIcon size={40} />
      </div>
      <div className="display text-[26px] text-ink leading-tight">Order placed!</div>
      <p className="text-[13px] text-ink-3 mt-2 max-w-xs">
        Your payment is held in escrow. We&apos;ve notified the supplier — you can track progress in your orders.
      </p>

      <div className="flex flex-col gap-2.5 mt-7 w-full max-w-xs">
        {orderId ? (
          <Link href={`/buyer/orders/${orderId}`}>
            <Button variant="primary" block size="lg">Track order</Button>
          </Link>
        ) : (
          <Link href="/buyer/orders">
            <Button variant="primary" block size="lg">View orders</Button>
          </Link>
        )}
        <Link href="/search">
          <Button variant="ghost" block size="lg">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper-3" />}>
      <SuccessInner />
    </Suspense>
  );
}
