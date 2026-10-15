"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { MachineId } from "@/components/service/MachineId";
import { useRouter, useSearchParams } from "next/navigation";
import { inquiriesApi } from "@/lib/api";
import { vehiclesApi, type Vehicle } from "@/lib/api/v2";
import { useVehicleStore } from "@/lib/vehicle-store";
import { useCatalog } from "@/components/shop/VehiclePicker";
import { Field, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const SUGGEST = ["Front brake pads", "Clutch plate kit", "Headlight assembly", "Side mirror", "Battery", "AC compressor", "Shock absorber", "Radiator"];

function NewRequest() {
  const router = useRouter();
  const sp = useSearchParams();
  const selected = useVehicleStore((s) => s.selected);
  const makes = useCatalog();
  const [mine, setMine] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [make, setMake] = useState(selected?.make ?? "");
  const [model, setModel] = useState(selected?.model ?? "");
  const [year, setYear] = useState(selected?.year ? String(selected.year) : "");
  const [part, setPart] = useState(sp.get("part") ?? "");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    vehiclesApi.mine().then((r) => {
      setMine(r.vehicles);
      const pick = r.vehicles.find((v) => v.id === selected?.vehicleId) ?? (!selected ? r.vehicles[0] : undefined);
      if (pick) pickVehicle(pick);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickVehicle(v: Vehicle) {
    setVehicleId(v.id); setMake(v.makeName); setModel(v.modelName); setYear(v.year ? String(v.year) : "");
  }

  const models = useMemo(() => makes.find((m) => m.name === make)?.models ?? [], [makes, make]);
  const valid = make && model && year && part.trim().length >= 2;

  async function submit() {
    setBusy(true);
    try {
      const { inquiry } = await inquiriesApi.create({ partName: part.trim(), make, model, year, description: notes || undefined, vehicleId: vehicleId ?? undefined });
      toast.success("Request sent to verified sellers");
      router.push(`/buyer/requests/${inquiry.id}`);
    } catch (e) { toast.error(getErrorMessage(e, "Couldn't post request")); setBusy(false); }
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">Get quotes for any part</h1>
      <p className="text-[15px] text-ink-2 mt-1">Tell us what you need. Verified sellers who stock it will quote, and you pick the best.</p>

      <div className="card p-5 md:p-6 mt-6 space-y-6">
        <div>
          <div className="text-[15px] font-extrabold mb-3">1 · Vehicle</div>
          {mine.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {mine.map((v) => (
                <button key={v.id} onClick={() => pickVehicle(v)} className="chip !h-auto py-2" data-on={vehicleId === v.id}>
                  <MachineId display={v.regNoDisplay} regNo={v.regNo} size={11} />{v.modelName}
                </button>
              ))}
              <button className="chip" data-on={!vehicleId} onClick={() => setVehicleId(null)}>Other vehicle</button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Make">
              <select className={inputCls} value={make} disabled={!!vehicleId} onChange={(e) => { setMake(e.target.value); setModel(""); }}>
                <option value="">Select</option>{makes.map((m) => <option key={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Model">
              <select className={inputCls} value={model} disabled={!!vehicleId || !make} onChange={(e) => setModel(e.target.value)}>
                <option value="">Select</option>{models.map((m) => <option key={m.id}>{m.name}</option>)}{model && !models.some((m) => m.name === model) && <option>{model}</option>}
              </select>
            </Field>
            <Field label="Year"><input className={inputCls} inputMode="numeric" maxLength={4} value={year} disabled={!!vehicleId} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} placeholder="2019" /></Field>
          </div>
        </div>

        <div>
          <div className="text-[15px] font-extrabold mb-3">2 · Part</div>
          <input className={inputCls} value={part} onChange={(e) => setPart(e.target.value)} placeholder="e.g. Front brake pads, right headlight…" aria-label="Part name" />
          <div className="flex gap-2 flex-wrap mt-3">{SUGGEST.map((s) => <button key={s} className="chip !h-8 !text-[12.5px]" data-on={part === s} onClick={() => setPart(s)}>{s}</button>)}</div>
          <textarea className={`${inputCls} !h-24 py-3 mt-3`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Part number, side (left/right), genuine only, needed by…" aria-label="Notes" />
        </div>

        <button disabled={!valid || busy} onClick={submit} className="w-full h-[54px] rounded-[14px] bg-[color:var(--accent)] text-white text-[16px] font-extrabold disabled:opacity-40 fms-press">
          {busy ? "Sending…" : "Send to verified sellers"}
        </button>
        <p className="text-[12.5px] text-ink-3 text-center">Free. No obligation. Pay only when you accept a quote. Money stays in escrow until delivery.</p>
      </div>
    </div>
  );
}

export default function NewRequestPage() {
  return <Suspense><NewRequest /></Suspense>;
}
