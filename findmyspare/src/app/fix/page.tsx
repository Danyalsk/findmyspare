"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { Field, inputCls, Skel } from "@/components/shop/ui";
import { IconTile, INDUSTRY_STYLE } from "@/components/net/NetIcon";
import { useTaxonomy } from "@/components/net/useTaxonomy";
import { useAuthStore } from "@/lib/store";
import { vehiclesApi, type Vehicle } from "@/lib/api/v2";
import { fixApi } from "@/lib/api/v3";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

// Quick symptoms per industry so people don't have to type much.
const SYMPTOMS: Record<string, string[]> = {
  automotive: ["Won’t start", "Brake noise", "AC not cooling", "Warning light on", "Oil leak", "Battery dead", "General service"],
  pumps: ["No water / low flow", "Motor hums, doesn’t run", "Trips the starter", "Very noisy", "Leaking", "Needs rewinding"],
  electrical: ["Motor not starting", "Overheating", "Burning smell", "Tripping", "Needs rewinding", "Panel fault"],
  appliances: ["Not cooling", "Not starting", "Water leaking", "Strange noise", "Error code on display", "Gas refill"],
  power: ["Battery backup low", "Inverter beeping", "Genset won’t start", "Smoke / black exhaust", "Low voltage", "Solar not charging"],
  agriculture: ["Won’t start", "Hydraulics weak", "Clutch slipping", "PTO problem", "Oil leak", "Service due"],
  industrial: ["Breakdown, line stopped", "Abnormal vibration", "Overheating", "Air/oil leak", "Preventive maintenance"],
  construction: ["Hydraulic leak", "Engine problem", "Undercarriage worn", "Electrical fault", "Service due"],
  electronics: ["Screen broken", "Not charging", "Battery drains fast", "Water damage", "No display", "Speaker/mic issue"],
  marine: ["Engine won’t start", "Overheating", "Propeller damage", "Fuel problem", "Service due"],
};
const WHEN = ["Today", "Tomorrow morning", "Tomorrow evening", "This week"];

function FixInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const industries = useTaxonomy();
  const [machines, setMachines] = useState<Vehicle[] | null>(null);
  const [vehicleId, setVehicleId] = useState(sp.get("vehicleId") ?? "");
  const [industry, setIndustry] = useState(sp.get("industry") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [city, setCity] = useState(user?.city ?? "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [when, setWhen] = useState("Today");
  const [busy, setBusy] = useState(false);

  useEffect(() => { vehiclesApi.mine().then((r) => setMachines(r.vehicles)).catch(() => setMachines([])); }, []);

  const machine = machines?.find((m) => m.id === vehicleId);
  const activeIndustry = machine ? machine.industrySlug ?? "automotive" : industry;
  const ind = industries?.find((i) => i.slug === activeIndustry);
  const mt = ind?.machineTypes.find((m) => m.slug === (machine?.machineType ?? type));
  const symptoms = SYMPTOMS[activeIndustry] ?? SYMPTOMS.industrial!;
  const problem = [...picked, notes.trim()].filter(Boolean).join(". ");
  const ready = !!activeIndustry && problem.length >= 5 && city.trim().length >= 2;

  const pickMachine = (m: Vehicle | null) => {
    setVehicleId(m?.id ?? "");
    setPicked([]);
    if (m) { setIndustry(m.industrySlug ?? "automotive"); setType(m.machineType ?? ""); }
  };
  const toggleSymptom = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  async function submit() {
    setBusy(true);
    try {
      const r = await fixApi.create({
        industrySlug: activeIndustry, vehicleId: vehicleId || undefined,
        machineType: machine ? undefined : type || undefined, brand: machine ? undefined : brand || undefined, model: machine ? undefined : model || undefined,
        problem, city: city.trim(), address: address.trim() || undefined, phone: phone.trim() || undefined, preferredTime: when,
      });
      toast.success(r.notified ? `Sent to ${r.notified} technician${r.notified > 1 ? "s" : ""} near you` : "Request posted. We’ll alert technicians as they join.");
      router.push("/fix/requests");
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't send your request"));
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight">Fix it</h1>
          <p className="text-[15px] text-ink-2 mt-1 font-medium">Tell us what’s wrong. Verified technicians near you who fix this get it instantly.</p>
        </div>
        <Link href="/fix/requests" className="h-10 px-4 inline-flex items-center rounded-[12px] bg-paper-2 text-[13.5px] font-extrabold hover:bg-paper-3">My requests</Link>
      </div>

      {/* 1. What */}
      <section className="mt-7">
        <h2 className="text-[17px] font-extrabold">1. What needs fixing?</h2>
        {!!machines?.length && (
          <div className="mt-3 flex gap-3 overflow-x-auto scroll-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {machines.map((m) => {
              const st = INDUSTRY_STYLE[m.industrySlug ?? "automotive"] ?? INDUSTRY_STYLE.automotive!;
              const on = vehicleId === m.id;
              return (
                <button key={m.id} onClick={() => pickMachine(on ? null : m)} aria-pressed={on}
                  className={clsx("flex-shrink-0 w-[220px] text-left rounded-[16px] border-2 p-3 flex items-center gap-3 fms-press", on ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)]" : "border-line hover:border-line-2")}>
                  <IconTile name={st.icon} tint={st.tint} ink={st.ink} size={44} />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-extrabold truncate">{m.nickname || `${m.makeName} ${m.modelName}`}</span>
                    <span className="block text-[12px] text-ink-3 font-semibold truncate">{m.regNoDisplay}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {!machine && (
          <>
            {!!machines?.length && <div className="mt-4 text-[13px] font-bold text-ink-3">Or pick the kind of machine</div>}
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-4">
              {(industries ?? []).map((i) => (
                <button key={i.slug} onClick={() => { setIndustry(i.slug); setType(""); setBrand(""); setPicked([]); }} aria-pressed={industry === i.slug} className="flex flex-col items-center gap-1.5">
                  <span className={clsx("rounded-full p-1 border-2 transition-colors", industry === i.slug ? "border-[color:var(--accent)]" : "border-transparent")}>
                    <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={60} />
                  </span>
                  <span className={clsx("text-[12px] font-bold text-center leading-tight", industry === i.slug ? "text-[color:var(--accent)]" : "text-ink-2")}>{INDUSTRY_STYLE[i.slug]?.short ?? i.name}</span>
                </button>
              ))}
              {!industries && Array.from({ length: 10 }).map((_, i) => <Skel key={i} className="w-[60px] h-[60px] !rounded-full mx-auto" />)}
            </div>
          </>
        )}
      </section>

      {/* 2. Which machine */}
      {ind && !machine && (
        <section className="mt-8 fms-fade-up">
          <h2 className="text-[17px] font-extrabold">2. Which {ind.name.toLowerCase().split(" ")[0]}?</h2>
          <div className="mt-3 flex gap-2 flex-wrap" role="group" aria-label="Machine type">
            {ind.machineTypes.map((m) => <button key={m.id} className="chip" data-on={type === m.slug} onClick={() => { setType(type === m.slug ? "" : m.slug); setBrand(""); }}>{m.name}</button>)}
          </div>
          {!!mt?.brands.length && (
            <div className="mt-3 flex gap-2 flex-wrap" role="group" aria-label="Brand">
              {mt.brands.map((b) => <button key={b} className="chip" data-on={brand === b} onClick={() => setBrand(brand === b ? "" : b)}>{b}</button>)}
            </div>
          )}
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <Field label="Brand"><input className={inputCls} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Crompton" /></Field>
            <Field label="Model / capacity (optional)"><input className={inputCls} value={model} onChange={(e) => setModel(e.target.value)} placeholder={mt?.attributes[0] ? `e.g. ${mt.attributes.map((a) => a.label).join(", ")}` : "e.g. 1 HP"} /></Field>
          </div>
        </section>
      )}

      {/* 3. Problem */}
      {activeIndustry && (
        <section className="mt-8 fms-fade-up">
          <h2 className="text-[17px] font-extrabold">{machine ? "2" : "3"}. What’s the problem?</h2>
          <div className="mt-3 flex gap-2 flex-wrap" role="group" aria-label="Common problems">
            {symptoms.map((s) => <button key={s} className="chip" data-on={picked.includes(s)} onClick={() => toggleSymptom(s)}>{s}</button>)}
          </div>
          <textarea className={`${inputCls} h-28 py-3 mt-3 resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else? e.g. Runs but no water comes up, trips after 2 minutes." aria-label="Describe the problem" />
        </section>
      )}

      {/* 4. Where & when */}
      {activeIndustry && (
        <section className="mt-8 fms-fade-up">
          <h2 className="text-[17px] font-extrabold">{machine ? "3" : "4"}. Where and when?</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <Field label="City"><input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pune" /></Field>
            <Field label="Phone" hint="Shared only with the technician who accepts"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="98xxxxxxxx" /></Field>
            <div className="sm:col-span-2"><Field label="Area / address (optional)" hint="Shared only after a technician accepts"><input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kalyani Nagar, near…" /></Field></div>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap" role="group" aria-label="Preferred time">
            {WHEN.map((w) => <button key={w} className="chip" data-on={when === w} onClick={() => setWhen(w)}>{w}</button>)}
          </div>
        </section>
      )}

      {/* Sticky submit */}
      <div className="fixed inset-x-0 bottom-[62px] md:bottom-0 z-[80] bg-paper/95 backdrop-blur border-t border-line no-print">
        <div className="max-w-[860px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 text-[13px] text-ink-3 font-semibold truncate">
            {ind ? <><span className="text-ink font-extrabold">{machine ? machine.nickname || `${machine.makeName} ${machine.modelName}` : [mt?.name, brand].filter(Boolean).join(" · ") || ind.name}</span>{city ? ` · ${city}` : ""}</> : "Pick what needs fixing"}
          </div>
          <button onClick={submit} disabled={!ready || busy} className="h-12 px-6 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40 fms-press flex-shrink-0">
            {busy ? "Sending…" : "Find a technician"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FixPage() {
  return <Suspense><FixInner /></Suspense>;
}
