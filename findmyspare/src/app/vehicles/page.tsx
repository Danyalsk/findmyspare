"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { IconTile, INDUSTRY_STYLE } from "@/components/net/NetIcon";
import { useTaxonomy } from "@/components/net/useTaxonomy";
import { machineApi } from "@/lib/api/v3";
import { vehiclesApi, type RcResult, type Vehicle } from "@/lib/api/v2";
import { useVehicleStore } from "@/lib/vehicle-store";
import { BrandLogo } from "@/lib/brand-logos";
import { Sheet, Skel, EmptyState, StatusChip, Field, inputCls } from "@/components/shop/ui";
import { LogoMark } from "@/components/brand/Logo";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

function VehiclesInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const select = useVehicleStore((s) => s.select);
  const industries = useTaxonomy();
  const [list, setList] = useState<Vehicle[] | null>(null);
  const [open, setOpen] = useState(sp.get("add") === "1");
  const [mode, setMode] = useState<"plate" | "machine">("plate");
  const [m, setM] = useState({ industrySlug: "", machineType: "", makeName: "", modelName: "", serialNo: "", nickname: "" });
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
  async function addMachine() {
    setBusy(true); setErr("");
    try {
      const r = await machineApi.add({ ...m, machineType: m.machineType || undefined, serialNo: m.serialNo || undefined, nickname: m.nickname || undefined });
      toast.success("Machine added. Its service record starts now.");
      setOpen(false); setM({ industrySlug: "", machineType: "", makeName: "", modelName: "", serialNo: "", nickname: "" });
      router.push(`/vehicles/${r.vehicle.id}`);
    } catch (e) { setErr(getErrorMessage(e, "Couldn't add machine")); setBusy(false); }
  }
  const mInd = industries?.find((i) => i.slug === m.industrySlug);
  const mType = mInd?.machineTypes.find((t) => t.slug === m.machineType);

  async function decide(accessId: string, grant: boolean) {
    try { await vehiclesApi.decideAccess(accessId, grant); toast.success(grant ? "Garage allowed to update your Passport" : "Request declined"); load(); }
    catch (e) { toast.error(getErrorMessage(e, "Something went wrong")); }
  }

  const pending = (list ?? []).flatMap((v) => (v.pendingAccess ?? []).map((a) => ({ ...a, v })));

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">My machines</h1>
          <p className="text-[15px] text-ink-2 mt-1">Car, bike, pump, AC, genset or tractor: each gets a Passport with every service, part and warranty, verified by whoever did the work.</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-12 px-5 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold fms-press">+ Add</button>
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
          : !list.length ? <div className="md:col-span-2"><EmptyState title="Add your first vehicle or machine" body="Vehicles by number plate; pumps, ACs, gensets and anything else by brand and serial. You'll see parts that fit and keep its service record." action={<button onClick={() => setOpen(true)} className="h-12 px-6 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Add one</button>} /></div>
          : list.map((v) => (
            <div key={v.id} className="card overflow-hidden">
              <Link href={`/vehicles/${v.id}`} className="block p-5 relative">
                <LogoMark size={140} color="var(--paper-2)" className="absolute -right-8 -top-8" />
                <div className="relative flex items-start gap-4">
                  {v.regNo ? <BrandLogo name={v.makeName} size={52} /> : (() => { const st = INDUSTRY_STYLE[v.industrySlug ?? "industrial"] ?? INDUSTRY_STYLE.industrial!; return <IconTile name={st.icon} tint={st.tint} ink={st.ink} size={52} />; })()}
                  <div className="min-w-0">
                    {v.regNo ? <span className="reg-plate text-[13px]">{v.regNoDisplay}</span> : <span className="inline-flex h-6 px-2.5 items-center rounded-[8px] bg-paper-2 mono text-[12px] font-bold text-ink-2">{v.regNoDisplay}</span>}
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
                {v.regNo
                  ? <button onClick={() => { select({ make: v.makeName, model: v.modelName, variant: v.variantName, year: v.year, regNoDisplay: v.regNoDisplay, vehicleId: v.id }); router.push("/search?industry=automotive"); }} className="h-12 text-[color:var(--accent)] hover:bg-paper-2">Shop parts that fit</button>
                  : <Link href={`/i/${v.industrySlug ?? "industrial"}${v.machineType ? `?type=${v.machineType}` : ""}`} className="h-12 flex items-center justify-center text-[color:var(--accent)] hover:bg-paper-2">Shop parts</Link>}
                <Link href={`/fix?vehicleId=${v.id}`} className="h-12 flex items-center justify-center hover:bg-paper-2">Book service →</Link>
              </div>
            </div>
          ))}
      </div>

      <Sheet open={open} onClose={() => { setOpen(false); setRc(null); setErr(""); }} title="Add a vehicle or machine">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-paper-2 mb-5" role="tablist">
          {([["plate", "Vehicle (number plate)"], ["machine", "Other machine"]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={mode === k} onClick={() => { setMode(k); setErr(""); }} className={clsx("h-10 rounded-[11px] text-[13.5px] font-extrabold", mode === k ? "bg-paper shadow-[var(--shadow-card)] text-ink" : "text-ink-3")}>{l}</button>
          ))}
        </div>
        {mode === "machine" ? (
          <div>
            <Field label="What is it?" group>
              <div className="grid grid-cols-5 gap-2">
                {(industries ?? []).filter((i) => i.slug !== "automotive").map((i) => (
                  <button key={i.slug} onClick={() => setM({ ...m, industrySlug: i.slug, machineType: "" })} aria-pressed={m.industrySlug === i.slug} className="flex flex-col items-center gap-1">
                    <span className={clsx("rounded-full p-0.5 border-2", m.industrySlug === i.slug ? "border-[color:var(--accent)]" : "border-transparent")}><IconTile name={i.icon} tint={i.tint} ink={i.ink} size={46} /></span>
                    <span className="text-[11px] font-bold text-ink-2 text-center leading-tight">{INDUSTRY_STYLE[i.slug]?.short}</span>
                  </button>
                ))}
              </div>
            </Field>
            {mInd && (
              <div className="mt-4 space-y-4 fms-fade-up">
                <Field label="Type" group>
                  <div className="flex gap-2 flex-wrap">{mInd.machineTypes.map((t) => <button key={t.id} className="chip" data-on={m.machineType === t.slug} onClick={() => setM({ ...m, machineType: t.slug })}>{t.name}</button>)}</div>
                </Field>
                {!!mType?.brands.length && <div className="flex gap-2 flex-wrap" role="group" aria-label="Popular brands">{mType.brands.map((b) => <button key={b} className="chip" data-on={m.makeName === b} onClick={() => setM({ ...m, makeName: b })}>{b}</button>)}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brand"><input className={inputCls} value={m.makeName} onChange={(e) => setM({ ...m, makeName: e.target.value })} placeholder="Crompton" /></Field>
                  <Field label="Model"><input className={inputCls} value={m.modelName} onChange={(e) => setM({ ...m, modelName: e.target.value })} placeholder="1 HP openwell" /></Field>
                </div>
                <Field label="Serial no. (optional)" hint="On the name plate. Helps the technician and keeps warranties traceable."><input className={`${inputCls} mono uppercase`} value={m.serialNo} onChange={(e) => setM({ ...m, serialNo: e.target.value.toUpperCase() })} placeholder="SN 2203 4471" /></Field>
                <Field label="Nickname (optional)"><input className={inputCls} value={m.nickname} onChange={(e) => setM({ ...m, nickname: e.target.value })} placeholder="e.g. Borewell pump" /></Field>
              </div>
            )}
            {err && <div className="mt-3 rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3">{err}</div>}
            <button onClick={addMachine} disabled={!m.industrySlug || !m.makeName.trim() || !m.modelName.trim() || busy} className="mt-5 w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">Add machine</button>
          </div>
        ) : (<>
        <Field label="Registration number" group hint="Prototype: details come from a mock RC lookup. Any valid-looking plate works.">
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
        </>)}
      </Sheet>
    </div>
  );
}

export default function VehiclesPage() {
  return <Suspense><VehiclesInner /></Suspense>;
}
