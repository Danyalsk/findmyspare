"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { publicApi, inr } from "@/lib/api/v2";
import { PublicFrame } from "@/components/shop/PublicFrame";
import { Skel, EmptyState, VerifiedBadge, StatusChip } from "@/components/shop/ui";
import { LogoMark } from "@/components/brand/Logo";

type Shared = Awaited<ReturnType<typeof publicApi.passport>>;

export default function SharedHistoryPage() {
  const { token } = useParams<{ token: string }>();
  const [d, setD] = useState<Shared | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { publicApi.passport(token).then(setD).catch((e) => setErr(e.message)); }, [token]);

  if (err) return <PublicFrame><EmptyState title="This history isn't shared any more" body="The owner may have turned the link off." /></PublicFrame>;
  if (!d) return <PublicFrame><Skel className="h-96" /></PublicFrame>;

  return (
    <PublicFrame badge="Verified service history">
      <div className="rounded-[24px] bg-ink text-white p-6 md:p-8 relative overflow-hidden">
        <span className="absolute inset-x-0 top-0 h-2 bg-[color:var(--brand)]" />
        <LogoMark size={240} color="rgba(255,255,255,.05)" className="absolute -right-12 -bottom-20" />
        <div className="relative">
          <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-white/55">FindMySpare Verified History</div>
          <span className="reg-plate text-[18px] mt-3">{d.vehicle.regNoDisplay}</span>
          <div className="mt-3 text-[22px] font-extrabold capitalize">{d.vehicle.label}</div>
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-[480px]">
            {[["Services", d.stats.services], ["Parts fitted", d.stats.partsFitted], ["Warranties", d.stats.activeWarranties]].map(([l, n]) => <div key={l as string} className="rounded-[14px] bg-white/[0.07] p-3"><div className="text-[22px] font-extrabold">{n}</div><div className="text-[12px] text-white/55 font-bold">{l}</div></div>)}
          </div>
        </div>
      </div>
      <p className="mt-4 text-[13px] text-ink-3">Every entry below was recorded by the garage that did the work, with the owner&apos;s consent. Records can&apos;t be edited after invoicing.</p>

      {d.sections.services && (
        <section className="mt-5">
          <h2 className="text-[18px] font-extrabold mb-3">Service timeline</h2>
          <div className="space-y-3">
            {d.services.length ? d.services.map((s) => (
              <div key={s.jobCardId} className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div><div className="text-[12.5px] font-bold text-ink-3">{format(new Date(s.date), "d MMM yyyy")}{d.sections.odometer && s.odometerKm ? ` · ${s.odometerKm.toLocaleString("en-IN")} km` : ""}</div><div className="text-[16px] font-extrabold">{s.garageName}{s.garageCity ? `, ${s.garageCity}` : ""}</div></div>
                  <VerifiedBadge label="Garage-verified" />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{s.items.map((i, k) => <span key={k} className="chip !h-7 !text-[12px]">{i.brand ? `${i.brand} ` : ""}{i.name}</span>)}</div>
                {s.invoice && <div className="mt-3 text-[13px] flex items-center gap-3"><span className="font-bold">Invoice {s.invoice.number} · {inr(s.invoice.total)}</span><Link href={`/verify/${s.invoice.verifyCode}`} className="font-extrabold text-[color:var(--accent)]">Verify ↗</Link></div>}
              </div>
            )) : <div className="card p-5 text-ink-3">No services recorded yet.</div>}
          </div>
        </section>
      )}
      {d.sections.parts && d.parts.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[18px] font-extrabold mb-3">Parts fitted</h2>
          <div className="card divide-y divide-line">{d.parts.map((p, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div><div className="text-[14.5px] font-extrabold">{p.brand ? `${p.brand} ` : ""}{p.name}</div><div className="text-[12.5px] text-ink-3 font-semibold">{format(new Date(p.fittedAt), "d MMM yyyy")} · {p.garageName}</div></div>
              <div className="flex gap-2">{p.warrantyActive && <StatusChip tone="green">Under warranty</StatusChip>}{p.fitConfirmed && <StatusChip tone="blue">Owner-confirmed fit</StatusChip>}</div>
            </div>
          ))}</div>
        </section>
      )}
      {d.sections.odometer && d.odometer.length > 1 && (
        <section className="mt-6">
          <h2 className="text-[18px] font-extrabold mb-3">Odometer readings</h2>
          <div className="card p-5 flex gap-6 overflow-x-auto">{d.odometer.map((o, i) => <div key={i} className="flex-shrink-0"><div className="text-[18px] font-extrabold">{o.km.toLocaleString("en-IN")} km</div><div className="text-[12px] text-ink-3 font-semibold">{format(new Date(o.at), "MMM yyyy")} · {o.source}</div></div>)}</div>
        </section>
      )}
    </PublicFrame>
  );
}
