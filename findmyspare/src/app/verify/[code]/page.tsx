"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi, type VerifyResult } from "@/lib/api/v2";
import { PublicFrame } from "@/components/shop/PublicFrame";
import { InvoiceDoc } from "@/components/shop/InvoiceDoc";
import { Skel } from "@/components/shop/ui";
import { useOrigin } from "@/lib/use-mounted";

export default function VerifyResultPage() {
  const { code } = useParams<{ code: string }>();
  const [r, setR] = useState<VerifyResult | null>(null);
  const origin = useOrigin();
  useEffect(() => { publicApi.verify(decodeURIComponent(code)).then(setR).catch(() => setR({ found: false })); }, [code]);

  return (
    <PublicFrame badge="Invoice verification">
      {!r ? <Skel className="h-80" /> : !r.found ? (
        <div className="card p-8 text-center border-2 border-[color:var(--danger)]">
          <div className="text-[44px]">⚠️</div>
          <h1 className="text-[24px] font-extrabold mt-2 text-[color:var(--danger)]">No invoice with this code</h1>
          <p className="text-[14.5px] text-ink-2 mt-1">Check the code on the bill. If it was presented as a FindMySpare invoice, treat it as <b>not verified</b>.</p>
          <Link href="/verify" className="mt-5 inline-flex h-11 px-5 items-center rounded-[12px] border border-line-2 font-extrabold">Try another code</Link>
        </div>
      ) : (
        <>
          <div className={`card p-5 md:p-6 border-2 ${r.genuine ? "border-[color:var(--success)] bg-[color:var(--success-wash)]" : "border-[color:var(--danger)] bg-[color:var(--danger-wash)]"}`}>
            <div className="flex items-center gap-4">
              <span className={`w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0 ${r.genuine ? "bg-[color:var(--success)]" : "bg-[color:var(--danger)]"}`}>
                {r.genuine ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg> : <span className="text-[26px] font-extrabold">!</span>}
              </span>
              <div>
                <h1 className={`text-[22px] md:text-[26px] font-extrabold tracking-tight ${r.genuine ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>{r.genuine ? "Genuine and unaltered" : "Altered after issue. Do not trust"}</h1>
                <p className="text-[14px] text-ink-2 font-semibold">
                  {r.genuine ? `Issued by ${r.invoice!.seller.name}${r.garageVerified ? " (Verified Garage)" : ""}. Contents match the original fingerprint.` : "The amounts or items no longer match the fingerprint recorded when this invoice was issued."}
                  {" "}Status: <b>{r.invoice!.status === "paid" ? "Paid" : "Unpaid"}</b>.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4"><InvoiceDoc inv={{ ...r.invoice!, contentHash: r.hash }} origin={origin} /></div>
        </>
      )}
    </PublicFrame>
  );
}
