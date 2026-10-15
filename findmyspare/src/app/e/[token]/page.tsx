"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { clsx } from "clsx";
import { publicApi, inr, type PublicEstimate } from "@/lib/api/v2";
import { PublicFrame } from "@/components/shop/PublicFrame";
import { VerifiedBadge, Skel, EmptyState } from "@/components/shop/ui";
import { getErrorMessage } from "@/lib/errors";

export default function EstimateApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const [d, setD] = useState<PublicEstimate | null>(null);
  const [keep, setKeep] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ approved: number; declined: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    publicApi.estimate(token).then((r) => { setD(r); setKeep(new Set(r.items.filter((i) => i.approved).map((i) => i.id))); }).catch((e) => setError(getErrorMessage(e, "Estimate not found")));
  }, [token]);

  const total = useMemo(() => (d?.items ?? []).filter((i) => keep.has(i.id)).reduce((s, i) => s + parseFloat(i.total), 0), [d, keep]);
  const toggle = (id: string) => setKeep((k) => { const n = new Set(k); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  async function approve() {
    setBusy(true);
    try { setDone(await publicApi.approveEstimate(token, [...keep])); }
    catch (e) { setError(getErrorMessage(e, "Couldn't submit")); }
    finally { setBusy(false); }
  }

  if (error && !d) return <PublicFrame><EmptyState title="Estimate unavailable" body={error} /></PublicFrame>;
  if (!d) return <PublicFrame><Skel className="h-96" /></PublicFrame>;
  const answered = d.job.status !== "estimate_sent";
  const flagged = d.job.inspection.filter((p) => p.status !== "ok");

  return (
    <PublicFrame badge="Estimate · no login needed">
      <div className="card p-5 md:p-6">
        <div className="flex items-center gap-2 flex-wrap"><span className="text-[13px] font-bold text-ink-3">Estimate from</span>{d.garage.verified && <VerifiedBadge label="Verified Garage" />}</div>
        <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-tight mt-1">{d.garage.name}{d.garage.city ? `, ${d.garage.city}` : ""}</h1>
        <div className="mt-2 flex items-center gap-3 flex-wrap"><span className="reg-plate text-[14px]">{d.vehicle.regNoDisplay}</span><span className="text-[14px] font-bold text-ink-2">{d.vehicle.label}</span></div>
        {d.job.complaint && <p className="mt-3 text-[14px] text-ink-2"><b>You reported:</b> {d.job.complaint}</p>}
        {flagged.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">{flagged.map((p) => <span key={p.label} className={clsx("chip !h-8", p.status === "urgent" ? "!text-[color:var(--danger)] !border-[color:var(--danger)]" : "!text-[color:var(--amber)] !border-[color:var(--amber)]")}>{p.status === "urgent" ? "Needs attention now" : "Check soon"}: {p.label}</span>)}</div>
        )}
      </div>

      {done || answered ? (
        <div className="card p-8 mt-4 text-center fms-fade-up">
          <div className="mx-auto w-20 h-20 rounded-full bg-[color:var(--success)] text-white flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg></div>
          <div className="text-[22px] font-extrabold mt-4">{done ? "Approved. The garage can start." : "This estimate has been answered"}</div>
          {done && <p className="text-[14.5px] text-ink-2 mt-1">{done.approved} item{done.approved > 1 ? "s" : ""} approved{done.declined ? `, ${done.declined} declined` : ""}. You&apos;ll get the invoice with a payment link when the work is done.</p>}
        </div>
      ) : (
        <>
          <div className="card mt-4 divide-y divide-line">
            {d.items.map((i) => (
              <label key={i.id} className="flex items-center gap-4 px-5 py-4 cursor-pointer">
                <input type="checkbox" checked={keep.has(i.id)} onChange={() => toggle(i.id)} className="w-5 h-5 accent-[color:var(--success)]" />
                <div className="flex-1 min-w-0">
                  <div className={clsx("text-[15px] font-extrabold", !keep.has(i.id) && "line-through text-ink-4")}>{i.kind === "labour" ? "🔧 " : "⚙️ "}{i.brand ? `${i.brand} ` : ""}{i.name}</div>
                  <div className="text-[12.5px] text-ink-3 font-semibold">{i.quantity} × {inr(i.unitPrice)} + {i.gstRate}% GST{i.warrantyMonths ? ` · ${i.warrantyMonths}-month warranty` : ""}</div>
                </div>
                <span className="price">{inr(i.total)}</span>
              </label>
            ))}
          </div>
          <div className="card p-5 mt-4 sticky bottom-4">
            <div className="flex items-center justify-between"><span className="text-[15px] font-bold text-ink-2">Approved total (incl. GST)</span><span className="price text-[24px]">{inr(total, { decimals: true })}</span></div>
            {error && <div className="mt-3 text-[13px] font-bold text-[color:var(--danger)]">{error}</div>}
            <button disabled={!keep.size || busy} onClick={approve} className="mt-4 w-full h-[54px] rounded-[14px] bg-[color:var(--success)] text-white text-[16px] font-extrabold disabled:opacity-40">{busy ? "Sending…" : `Approve ${keep.size} item${keep.size === 1 ? "" : "s"}`}</button>
            <p className="mt-2 text-[12px] text-ink-3 text-center">Untick anything you don&apos;t want done. Questions? Call {d.garage.phone ?? "the garage"}.</p>
          </div>
        </>
      )}
    </PublicFrame>
  );
}
