"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { garageApi, vehiclesApi, type RcResult } from "@/lib/api/v2";
import { BrandLogo } from "@/lib/brand-logos";
import { Field, inputCls, StatusChip } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const COMPLAINTS = ["General service", "Brake noise", "AC not cooling", "Clutch slipping", "Battery / starting", "Suspension noise", "Accident repair"];

export default function NewJobPage() {
  const router = useRouter();
  const [reg, setReg] = useState("");
  const [rc, setRc] = useState<RcResult | null>(null);
  const [f, setF] = useState({ customerName: "", customerPhone: "", odometerKm: "", complaint: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function lookup() {
    setErr(""); setRc(null);
    try { setRc((await vehiclesApi.lookup(reg)).vehicle); } catch (e) { setErr(getErrorMessage(e, "Lookup failed")); }
  }
  async function create() {
    setBusy(true);
    try {
      const { job } = await garageApi.openJob({ regNo: reg, customerName: f.customerName || undefined, customerPhone: f.customerPhone || undefined, odometerKm: f.odometerKm ? Number(f.odometerKm) : undefined, complaint: f.complaint || undefined });
      toast.success(`Job ${job.number} opened`);
      router.push(`/workshop/jobs/${job.id}`);
    } catch (e) { setErr(getErrorMessage(e, "Couldn't open job")); setBusy(false); }
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">New job card</h1>
      <p className="text-[14.5px] text-ink-2 mt-1">Check the vehicle in. The owner gets a request to link this service to their Vehicle Passport.</p>
      <div className="card p-5 md:p-6 mt-6 space-y-5">
        <Field label="Registration number">
          <div className="flex gap-2">
            <input className={`${inputCls} mono uppercase tracking-wider`} value={reg} onChange={(e) => { setReg(e.target.value.toUpperCase()); setRc(null); }} onBlur={() => reg.length >= 6 && !rc && lookup()} placeholder="MH 12 AB 3456" aria-label="Registration number" />
            <button onClick={lookup} className="h-12 px-5 rounded-[12px] bg-ink text-paper font-extrabold">Find</button>
          </div>
        </Field>
        {rc && (
          <div className="rounded-[16px] bg-paper-2 p-4 flex items-center gap-4 fms-fade-up">
            <BrandLogo name={rc.makeName} size={44} />
            <div className="flex-1"><div className="text-[16px] font-extrabold">{rc.makeName} {rc.modelName} {rc.variantName}</div><div className="text-[13px] text-ink-3 font-semibold capitalize">{rc.year} · {rc.fuel}</div></div>
            <StatusChip tone={rc.source === "fms-record" ? "green" : "grey"}>{rc.source === "fms-record" ? "Has Passport" : "Mock RC"}</StatusChip>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer name"><input className={inputCls} value={f.customerName} onChange={(e) => setF({ ...f, customerName: e.target.value })} /></Field>
          <Field label="Customer mobile"><input className={inputCls} inputMode="tel" value={f.customerPhone} onChange={(e) => setF({ ...f, customerPhone: e.target.value })} placeholder="+91" /></Field>
          <Field label="Odometer (km)"><input className={inputCls} inputMode="numeric" value={f.odometerKm} onChange={(e) => setF({ ...f, odometerKm: e.target.value.replace(/\D/g, "") })} /></Field>
        </div>
        <Field label="Customer complaint">
          <div className="flex flex-wrap gap-2 mb-2">{COMPLAINTS.map((c) => <button key={c} className="chip !h-8 !text-[12.5px]" data-on={f.complaint.includes(c)} onClick={() => setF({ ...f, complaint: f.complaint ? (f.complaint.includes(c) ? f.complaint : `${f.complaint}, ${c}`) : c })}>{c}</button>)}</div>
          <textarea className={`${inputCls} !h-24 py-3`} value={f.complaint} onChange={(e) => setF({ ...f, complaint: e.target.value })} />
        </Field>
        {err && <div className="rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3">{err}</div>}
        <button disabled={reg.replace(/\s/g, "").length < 6 || busy} onClick={create} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">{busy ? "Opening…" : "Open job card"}</button>
      </div>
    </div>
  );
}
