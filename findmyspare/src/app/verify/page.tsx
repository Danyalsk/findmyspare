"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFrame } from "@/components/shop/PublicFrame";
import { LogoMark } from "@/components/brand/Logo";
import { inputCls } from "@/components/shop/ui";

export default function VerifyLanding() {
  const router = useRouter();
  const [code, setCode] = useState("");
  return (
    <PublicFrame badge="Invoice verification">
      <div className="card p-6 md:p-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-[20px] bg-[color:var(--success-wash)] flex items-center justify-center"><LogoMark size={34} color="var(--success)" /></div>
        <h1 className="text-[26px] md:text-[32px] font-extrabold tracking-tight mt-4">Is this garage bill genuine?</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-[520px] mx-auto">Every FindMySpare invoice has a code under its QR. Enter it to check the bill is real, unaltered since it was issued, and whether it&apos;s paid. Useful for fleets, employers and insurers.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) router.push(`/verify/${encodeURIComponent(code.trim().toUpperCase())}`); }} className="mt-6 flex gap-2 max-w-[440px] mx-auto">
          <input className={`${inputCls} mono uppercase tracking-wider text-center`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="FMS-XXXX-XXXX" aria-label="Verification code" />
          <button className="h-12 px-6 rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">Verify</button>
        </form>
      </div>
    </PublicFrame>
  );
}
