"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { vehiclesApi, type RcResult, type Vehicle } from "@/lib/api/v2";
import { useVehicleStore } from "@/lib/vehicle-store";
import { BrandLogo } from "@/lib/brand-logos";
import { Sheet, Skel, EmptyState, StatusChip, Field, inputCls } from "@/components/shop/ui";
import { LogoMark } from "@/components/brand/Logo";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function VehiclesPage() {
  const router = useRouter();
  const select = useVehicleStore((s) => s.select);
  const [list, setList] = useState<Vehicle[] | null>(null);
  const [open, setOpen] = useState(false);
  const [reg, setReg] = useState("");
  const [rc, setRc] = useState<RcResult | null>(null);
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(() => vehiclesApi.mine().then((r) => setList(r.vehicles)).catch(() => setList([])), []);
  useEffect(() => { load(); }, [load]);

  async function lookup() {
    setBusy(true); setErr(""); setRc(null);
    try { setRc((await vehiclesApi.lookup(reg)).vehicle); }
    catch (e) { setErr(getErrorMessage(e, "Lookup failed")); }
    finally { setBusy(false); }
  }
  async function add() {
    setBusy(true);
    try {
      const r = await vehiclesApi.add({ regNo: reg, nickname: nickname || undefined });
      toast.success(r.claimed ? "Vehicle linked. Its service history is now yours." : "Vehicle added to your garage");
      setOpen(false); setReg(""); setRc(null); setNickname("");
      router.push(`/vehicles/${r.vehicle.id}`);
    } catch (e) { setErr(getErrorMessage(e, "Couldn't add vehicle")); setBusy(false); }
  }
  async function decide(accessId: string, grant: boolean) {
    try { await vehiclesApi.decideAccess(accessId, grant); toast.success(grant ? "Garage allowed to update your Passport" : "Request declined"); load(); }
    catch (e) { toast.error(getErrorMessage(e, "Something went wrong")); }
  }

  const pending = (list ?? []).flatMap((v) => (v.pendingAccess ?? []).map((a) => ({ ...a, v })));

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">My vehicles</h1>
          <p className="text-[15px] text-ink-2 mt-1">Each vehicle has a Passport: every service, part and warranty, verified by the garage that did the work.</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-12 px-5 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold fms-press">+ Add vehicle</button>
      </div>

      {pending.map((p) => (
        <div key={p.id} className="mt-5 card p-5 border-2 border-[color:var(--amber)] bg-[color:var(--amber-wash)] flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[15px] font-extrabold">{p.garageName}{p.garageCity ? `, ${p.garageCity}` : ""} wants to add service records to {p.v.regNoDisplay}</div>
            <div className="text-[13px] text-ink-2 mt-0.5">They&apos;ll be able to record job cards, parts fitted and invoices. You can revoke this anytime.</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => decide(p.id, false)} className="h-10 px-4 rounded-[12px] bg-paper border border-line-2 font-bold">Decline</button>
            <button onClick={() => decide(p.id, true)} className="h-10 px-4 rounded-[12px] bg-[color:var(--success)] text-white font-extrabold">Allow</button>
          </div>
        </div>
      ))}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {!list ? [0, 1].map((i) => <Skel key={i} className="h-48" />)
          : !list.length ? <div className="md:col-span-2"><EmptyState title="Add your first vehicle" body="Enter your number plate. We fetch the model so you only see parts that fit, and start its service record." action={<button onClick={() => setOpen(true)} className="h-12 px-6 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Add by number plate</button>} /></div>
          : list.map((v) => (
            <div key={v.id} className="card overflow-hidden">
              <Link href={`/vehicles/${v.id}`} className="block p-5 relative">
                <LogoMark size={140} color="var(--paper-2)" className="absolute -right-8 -top-8" />
                <div className="relative flex items-start gap-4">
                  <BrandLogo name={v.makeName} size={52} />
                  <div className="min-w-0">
                    <span className="reg-plate text-[13px]">{v.regNoDisplay}</span>
                    <div className="mt-2 text-[18px] font-extrabold tracking-tight">{v.nickname || `${v.makeName} ${v.modelName}`}</div>
                    <div className="text-[13px] text-ink-3 font-semibold">{v.label}</div>
                  </div>
                </div>
                <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
                  {[["Services", v.stats?.services ?? 0], ["Parts fitted", v.stats?.parts ?? 0], ["Warranties", v.stats?.warranties ?? 0]].map(([l, n]) => (
                    <div key={l} className="rounded-[12px] bg-paper-2 py-2.5"><div className="text-[20px] font-extrabold">{n}</div><div className="text-[11.5px] font-bold text-ink-3">{l}</div></div>
                  ))}
                </div>
              </Link>
              <div className="border-t border-line grid grid-cols-2 divide-x divide-line text-[13.5px] font-extrabold">
                <button onClick={() => { select({ make: v.makeName, model: v.modelName, variant: v.variantName, year: v.year, regNoDisplay: v.regNoDisplay, vehicleId: v.id }); router.push("/search"); }} className="h-12 text-[color:var(--accent)] hover:bg-paper-2">Shop parts that fit</button>
                <Link href={`/vehicles/${v.id}`} className="h-12 flex items-center justify-center hover:bg-paper-2">Open Passport →</Link>
              </div>
            </div>
          ))}
      </div>

      <Sheet open={open} onClose={() => { setOpen(false); setRc(null); setErr(""); }} title="Add a vehicle">
        <Field label="Registration number" hint="Prototype: details come from a mock RC lookup. Any valid-looking plate works.">
          <div className="flex gap-2">
            <input className={`${inputCls} mono uppercase tracking-wider`} value={reg} onChange={(e) => { setReg(e.target.value.toUpperCase()); setRc(null); }} placeholder="MH 12 AB 3456" aria-label="Registration number" />
            <button onClick={lookup} disabled={reg.replace(/\s/g, "").length < 6 || busy} className="h-12 px-5 rounded-[12px] bg-ink text-paper font-extrabold disabled:opacity-40">Find</button>
          </div>
        </Field>
        {err && <div className="mt-3 rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3">{err}</div>}
        {rc && (
          <div className="mt-5 fms-fade-up">
            <div className="rounded-[16px] border-2 border-[color:var(--success)] p-4 flex items-center gap-4">
              <BrandLogo name={rc.makeName} size={48} />
              <div className="flex-1">
                <span className="reg-plate text-[12px]">{rc.regNoDisplay}</span>
                <div className="text-[17px] font-extrabold mt-1.5">{rc.makeName} {rc.modelName} {rc.variantName}</div>
                <div className="text-[13px] text-ink-3 font-semibold capitalize">{rc.year} · {rc.fuel} · {rc.segment}</div>
              </div>
              <StatusChip tone={rc.source === "fms-record" ? "green" : "grey"}>{rc.source === "fms-record" ? "Has FMS history" : "Mock RC"}</StatusChip>
            </div>
            <div className="mt-4"><Field label="Nickname (optional)"><input className={inputCls} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Daily Swift" /></Field></div>
            <button onClick={add} disabled={busy} className="mt-5 w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-50">This is my vehicle, add it</button>
            <p className="text-[12px] text-ink-3 mt-2 text-center">In production we confirm ownership with an OTP to the RC-linked mobile.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
