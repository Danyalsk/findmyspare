"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { garageApi, vehiclesApi, type RcResult } from "@/lib/api/v2";
import { machineApi } from "@/lib/api/v3";
import { BrandLogo } from "@/lib/brand-logos";
import { Field, inputCls, StatusChip } from "@/components/shop/ui";
import { useMyGarage } from "@/components/shop/AppShell";
import { IndustryPicker, useIndustries } from "@/components/service/IndustryPicker";
import type { ServiceGarage } from "@/components/service/GarageForm";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const COMPLAINTS = ["General service", "Brake noise", "AC not cooling", "Clutch slipping", "Battery / starting", "Suspension noise", "Accident repair"];
const MACHINE_COMPLAINTS = ["Not starting", "No output / low output", "Noise / vibration", "Overheating", "Leak", "Tripping / shock", "Burnt smell", "Routine service"];

type Mode = "plate" | "machine";

function ComplaintField({ value, onChange, presets }: { value: string; onChange: (v: string) => void; presets: string[] }) {
  return (
    <Field label="Customer complaint" group>
      <div className="flex flex-wrap gap-2 mb-2">{presets.map((c) => <button key={c} type="button" className="chip !h-8 !text-[12.5px]" data-on={value.includes(c)} onClick={() => onChange(value ? (value.includes(c) ? value : `${value}, ${c}`) : c)}>{c}</button>)}</div>
      <textarea className={`${inputCls} !h-24 py-3`} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Complaint details" />
    </Field>
  );
}

export default function NewJobPage() {
  const router = useRouter();
  const { garage } = useMyGarage();
  const industries = useIndustries();
  const serves = (garage as ServiceGarage | null | undefined)?.industrySlugs;
  const [modeChoice, setModeChoice] = useState<Mode | null>(null);
  // Workshops that don't service vehicles start on "Other machine".
  const mode: Mode = modeChoice ?? (serves?.length && !serves.includes("automotive") ? "machine" : "plate");

  // Plate flow
  const [reg, setReg] = useState("");
  const [rc, setRc] = useState<RcResult | null>(null);
  const [f, setF] = useState({ customerName: "", customerPhone: "", odometerKm: "", complaint: "" });
  // Machine flow
  const [indChoice, setIndChoice] = useState<string | null>(null);
  const [m, setM] = useState({ machineType: "", makeName: "", modelName: "", serialNo: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const machineIndustries = industries?.filter((i) => i.slug !== "automotive") ?? null;
  const industrySlug = indChoice ?? (serves?.find((s) => s !== "automotive") ?? null);
  const industry = industries?.find((i) => i.slug === industrySlug);
  const type = industry?.machineTypes.find((t) => t.name === m.machineType);

  async function lookup() {
    setErr(""); setRc(null);
    try { setRc((await vehiclesApi.lookup(reg)).vehicle); } catch (e) { setErr(getErrorMessage(e, "Lookup failed")); }
  }
  const opt = (s: string) => s.trim() || undefined;
  async function create() {
    setBusy(true); setErr("");
    try {
      const { job } = mode === "plate"
        ? await garageApi.openJob({ regNo: reg, customerName: opt(f.customerName), customerPhone: opt(f.customerPhone), odometerKm: f.odometerKm ? Number(f.odometerKm) : undefined, complaint: opt(f.complaint) })
        : await machineApi.openJob({ industrySlug: industrySlug!, machineType: opt(m.machineType), makeName: m.makeName.trim(), modelName: m.modelName.trim(), serialNo: opt(m.serialNo), customerName: opt(f.customerName), customerPhone: opt(f.customerPhone), complaint: opt(f.complaint) });
      toast.success(`Job ${job.number} opened`);
      router.push(`/workshop/jobs/${job.id}`);
    } catch (e) { setErr(getErrorMessage(e, "Couldn't open job")); setBusy(false); }
  }

  const canCreate = mode === "plate"
    ? reg.replace(/\s/g, "").length >= 6
    : !!industrySlug && m.makeName.trim().length >= 1 && m.modelName.trim().length >= 1;

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">New job card</h1>
      <p className="text-[14.5px] text-ink-2 mt-1">Check the vehicle or machine in. Its service history builds up with every job.</p>

      <div role="tablist" aria-label="What's coming in" className="mt-5 grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-paper-2">
        {([["plate", "Vehicle with number plate"], ["machine", "Other machine"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={mode === k} onClick={() => { setModeChoice(k); setErr(""); }}
            className={clsx("h-11 rounded-[11px] text-[13.5px] font-extrabold transition-colors", mode === k ? "bg-paper text-ink shadow-[var(--shadow-card)]" : "text-ink-3")}>
            {l}
          </button>
        ))}
      </div>

      <div className="card p-5 md:p-6 mt-4 space-y-5">
        {mode === "plate" ? (
          <>
            <Field label="Registration number" group>
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
          </>
        ) : (
          <>
            <Field label="Industry" group>
              <IndustryPicker single industries={machineIndustries} value={industrySlug ? [industrySlug] : []} label="Industry"
                onChange={([s]) => { setIndChoice(s ?? null); setM({ ...m, machineType: "", makeName: "" }); }} />
            </Field>
            {industry && (
              <Field label="Machine type" group>
                <div className="flex flex-wrap gap-2">
                  {industry.machineTypes.map((t) => (
                    <button key={t.id} type="button" className="chip !h-9 !text-[13px]" data-on={m.machineType === t.name} onClick={() => setM({ ...m, machineType: m.machineType === t.name ? "" : t.name, makeName: "" })}>{t.name}</button>
                  ))}
                  {!industry.machineTypes.length && <span className="text-[13px] text-ink-3">No machine types listed yet. Fill brand and model below.</span>}
                </div>
              </Field>
            )}
            {industry && (
              <Field label="Brand" group>
                {!!type?.brands.length && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {type.brands.map((b) => <button key={b} type="button" className="chip !h-8 !text-[12.5px]" data-on={m.makeName === b} onClick={() => setM({ ...m, makeName: b })}>{b}</button>)}
                  </div>
                )}
                <input className={inputCls} value={m.makeName} onChange={(e) => setM({ ...m, makeName: e.target.value })} placeholder={type?.brands.length ? "Or type another brand" : "Kirloskar, Crompton, LG…"} aria-label="Brand" />
              </Field>
            )}
            {industry && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Model"><input className={inputCls} value={m.modelName} onChange={(e) => setM({ ...m, modelName: e.target.value })} placeholder="e.g. KDS 1.0 HP" /></Field>
                <Field label="Serial no. (optional)" hint="From the name plate"><input className={`${inputCls} mono uppercase`} value={m.serialNo} onChange={(e) => setM({ ...m, serialNo: e.target.value.toUpperCase() })} /></Field>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer name"><input className={inputCls} value={f.customerName} onChange={(e) => setF({ ...f, customerName: e.target.value })} /></Field>
          <Field label="Customer mobile"><input className={inputCls} inputMode="tel" value={f.customerPhone} onChange={(e) => setF({ ...f, customerPhone: e.target.value })} placeholder="+91" /></Field>
          {mode === "plate" && <Field label="Odometer (km)"><input className={inputCls} inputMode="numeric" value={f.odometerKm} onChange={(e) => setF({ ...f, odometerKm: e.target.value.replace(/\D/g, "") })} /></Field>}
        </div>
        <ComplaintField value={f.complaint} onChange={(complaint) => setF({ ...f, complaint })} presets={mode === "plate" ? COMPLAINTS : MACHINE_COMPLAINTS} />
        {err && <div className="rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3">{err}</div>}
        <button disabled={!canCreate || busy} onClick={create} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40 fms-press">{busy ? "Opening…" : "Open job card"}</button>
      </div>
    </div>
  );
}
