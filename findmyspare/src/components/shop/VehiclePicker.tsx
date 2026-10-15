"use client";

import { useEffect, useMemo, useState } from "react";
import { MachineId } from "@/components/service/MachineId";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store";
import { useVehicleStore } from "@/lib/vehicle-store";
import { vehiclesApi, type CatalogMake, type Vehicle } from "@/lib/api/v2";
import { BrandLogo } from "@/lib/brand-logos";
import { Sheet } from "./ui";

let catalogCache: CatalogMake[] | null = null;
export function useCatalog() {
  const [makes, setMakes] = useState<CatalogMake[]>(catalogCache ?? []);
  useEffect(() => {
    if (catalogCache) return;
    vehiclesApi.catalog().then((r) => { catalogCache = r.makes; setMakes(r.makes); }).catch(() => {});
  }, []);
  return makes;
}

/** Pick the vehicle you're shopping for: from My vehicles, or make → model → year. */
export function VehiclePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { selected, select } = useVehicleStore();
  const makes = useCatalog();
  const [mine, setMine] = useState<Vehicle[]>([]);
  const [make, setMake] = useState<CatalogMake | null>(null);
  const [modelId, setModelId] = useState<string>("");

  useEffect(() => {
    if (!open || !user || user.role !== "buyer") return;
    vehiclesApi.mine().then((r) => setMine(r.vehicles)).catch(() => {});
  }, [open, user]);

  const model = useMemo(() => make?.models.find((m) => m.id === modelId) ?? null, [make, modelId]);
  const years = useMemo(() => {
    if (!model) return [];
    const now = new Date().getFullYear();
    const from = Math.min(...model.variants.map((v) => v.yearFrom));
    const to = Math.max(...model.variants.map((v) => v.yearTo ?? now));
    return Array.from({ length: to - from + 1 }, (_, i) => to - i);
  }, [model]);

  const done = () => { setMake(null); setModelId(""); onClose(); };

  return (
    <Sheet open={open} onClose={done} title="Which vehicle are you buying for?" wide>
      {mine.length > 0 && !make && (
        <div className="mb-6">
          <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3 mb-2">My vehicles</div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {mine.map((v) => {
              const on = selected?.vehicleId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => { select({ make: v.makeName, model: v.modelName, variant: v.variantName, year: v.year, regNoDisplay: v.regNoDisplay, vehicleId: v.id }); done(); }}
                  className={clsx("text-left p-3.5 rounded-[14px] border-2 transition-colors", on ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)]" : "border-line hover:border-line-2")}
                >
                  <MachineId display={v.regNoDisplay} regNo={v.regNo} />
                  <div className="mt-2 text-[14.5px] font-extrabold">{v.nickname || `${v.makeName} ${v.modelName}`}</div>
                  <div className="text-[12.5px] text-ink-3 font-semibold">{v.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!make ? (
        <>
          <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3 mb-2">Choose make</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {makes.map((m) => (
              <button key={m.id} onClick={() => setMake(m)} className="flex flex-col items-center gap-2 py-3 rounded-[14px] border border-line hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-wash)]">
                <BrandLogo name={m.name} size={40} />
                <span className="text-[12.5px] font-bold text-center leading-tight">{m.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            {selected ? (
              <button onClick={() => { select(null); done(); }} className="text-[13.5px] font-bold text-ink-3 hover:text-ink">Show parts for all vehicles</button>
            ) : <span />}
            {user && <Link href="/vehicles" onClick={done} className="text-[13.5px] font-extrabold text-[color:var(--accent)]">+ Add your vehicle by number</Link>}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => { setMake(null); setModelId(""); }} className="text-[13px] font-bold text-ink-3 mb-3">← {make.name}</button>
          <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3 mb-2">Model</div>
          <div className="flex flex-wrap gap-2 mb-5">
            {make.models.map((m) => (
              <button key={m.id} className="chip" data-on={modelId === m.id} onClick={() => setModelId(m.id)}>
                {m.name}
                <span className="text-[11px] text-ink-4 capitalize">{m.segment}</span>
              </button>
            ))}
          </div>
          {model && (
            <>
              <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3 mb-2">Year</div>
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    className="chip"
                    onClick={() => {
                      const variant = model.variants.find((v) => v.yearFrom <= y && (v.yearTo ?? 9999) >= y);
                      select({ make: make.name, model: model.name, variant: variant?.name ?? null, year: y });
                      done();
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}
