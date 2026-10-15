"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api/index";
import type { Garage } from "@/lib/api/v2";
import { Field, inputCls } from "@/components/shop/ui";
import { IndustryPicker, useIndustries } from "./IndustryPicker";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

/** Garage as the backend returns it (industrySlugs isn't in the v2 type yet). */
export type ServiceGarage = Garage & { industrySlugs?: string[] | null };

type Body = { name: string; gstin?: string; phone?: string; addressLine?: string; city?: string; state?: string; pincode?: string; upiId?: string; invoicePrefix?: string; industrySlugs?: string[] };
/** POST /garage with the industries the workshop services (create or update). */
export const saveGarage = (body: Body) => fetchApi<{ garage: ServiceGarage }>("/garage", { method: "POST", body: JSON.stringify(body) });

const KEYS = ["name", "gstin", "phone", "addressLine", "city", "state", "pincode", "upiId", "invoicePrefix"] as const;

/** Create / edit the workshop profile, including "Industries you service". */
export function GarageForm({ initial, submitLabel, onDone }: { initial?: ServiceGarage | null; submitLabel: string; onDone: (g: ServiceGarage) => void }) {
  const [f, setF] = useState(() => Object.fromEntries(KEYS.map((k) => [k, (initial?.[k] as string | null | undefined) ?? (k === "invoicePrefix" ? "INV" : "")])) as Record<(typeof KEYS)[number], string>);
  const [inds, setInds] = useState<string[]>(initial?.industrySlugs?.length ? initial.industrySlugs : initial ? ["automotive"] : []);
  const [busy, setBusy] = useState(false);
  const industries = useIndustries();
  const set = (k: (typeof KEYS)[number]) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setBusy(true);
    try {
      const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v.trim())) as unknown as Body;
      const { garage } = await saveGarage({ ...body, industrySlugs: inds });
      onDone(garage);
    } catch (e) { toast.error(getErrorMessage(e, "Couldn't save")); }
    finally { setBusy(false); }
  }

  return (
    <div className="card p-5 md:p-6 grid grid-cols-2 gap-4">
      <div className="col-span-2"><Field label="Workshop name"><input className={inputCls} value={f.name} onChange={set("name")} placeholder="Sharma Auto Works · Imran Motor Rewinding" /></Field></div>
      <div className="col-span-2">
        <Field label="Industries you service" hint="You'll see nearby repair requests for these, and get the right inspection checklist on every job." group>
          <IndustryPicker industries={industries} value={inds} onChange={setInds} label="Industries you service" />
        </Field>
      </div>
      <Field label="GSTIN (optional)"><input className={`${inputCls} mono uppercase`} value={f.gstin} onChange={set("gstin")} placeholder="27ABCDE1234F1Z5" /></Field>
      <Field label="Phone"><input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+91 …" /></Field>
      <div className="col-span-2"><Field label="Address"><input className={inputCls} value={f.addressLine} onChange={set("addressLine")} /></Field></div>
      <Field label="City"><input className={inputCls} value={f.city} onChange={set("city")} /></Field>
      <Field label="State"><input className={inputCls} value={f.state} onChange={set("state")} /></Field>
      <Field label="PIN"><input className={inputCls} value={f.pincode} onChange={set("pincode")} /></Field>
      <Field label="UPI ID for collections"><input className={inputCls} value={f.upiId} onChange={set("upiId")} placeholder="shop@okicici" /></Field>
      <div className="col-span-2 sm:col-span-1"><Field label="Invoice prefix" hint="Invoices are numbered PREFIX-YYYY-0001"><input className={`${inputCls} mono uppercase`} maxLength={10} value={f.invoicePrefix} onChange={set("invoicePrefix")} /></Field></div>
      <div className="col-span-2">
        <button disabled={f.name.trim().length < 2 || !inds.length || busy} onClick={save} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40 fms-press">{busy ? "Saving…" : submitLabel}</button>
        {!inds.length && <p className="mt-2 text-[12.5px] text-ink-3 text-center">Pick at least one industry.</p>}
      </div>
    </div>
  );
}
