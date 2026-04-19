"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   Payment Processing — minimal trust-focused layout
   Auto-redirects to success after simulated processing
   ═══════════════════════════════════════════════════════ */

export default function PaymentPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => router.push("/buyer/success"), 400);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-[280px]">
        {/* Animated shield */}
        <div className="w-16 h-16 rounded-full bg-accent-wash flex items-center justify-center mx-auto mb-6">
          <ShieldIcon size={32} className="text-accent-ink" />
        </div>

        <h2 className="serif text-[28px] leading-[1.1]">
          Processing your<br />secure payment
        </h2>

        <p className="text-sm text-ink-3 mt-3 leading-[1.5]">
          ₹8,600 is being transferred to the FindMySpare escrow vault. Do not close this page.
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-full h-1.5 bg-paper-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mono text-[11px] text-ink-3 mt-3 tracking-[0.08em]">
          {progress < 100 ? "VERIFYING PAYMENT…" : "PAYMENT CONFIRMED ✓"}
        </div>

        {/* Trust assurance */}
        <div className="mt-10 flex items-center gap-2 justify-center text-ink-3 text-[11px]">
          <span className="mono tracking-[0.06em]">
            256-BIT SSL · PCI-DSS · ESCROW
          </span>
        </div>
      </div>
    </div>
  );
}
