"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { clsx } from "clsx";
import { vehiclesApi, inr, type Passport, type ShareSections } from "@/lib/api/v2";
import { BrandLogo } from "@/lib/brand-logos";
import { LogoMark } from "@/components/brand/Logo";
import { Sheet, Skel, StatusChip, VerifiedBadge, EmptyState } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const TABS = ["Timeline", "Parts & warranty", "Invoices", "Access"] as const;
const JOB_LABEL: Record<string, string> = { open: "Checked in", estimate_sent: "Estimate waiting for you", approved: "Approved · work starting", in_progress: "Work in progress", ready: "Ready for pickup" };

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Passport | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Timeline");
  const [shareOpen, setShareOpen] = useState(false);
  const [sections, setSections] = useState<ShareSections>({ services: true, parts: true, odometer: true, invoices: false });
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => vehiclesApi.passport(id).then((r) => { setP(r); if (r.vehicle.shareToken) setLink(`${location.origin}/h/${r.vehicle.shareToken}`); if (r.vehicle.shareSections) setSections(r.vehicle.shareSections); }).catch((e) => setError(getErrorMessage(e, "Couldn't open passport"))), [id]);
  useEffect(() => { load(); }, [load]);

  async function share() {
    try { const r = await vehiclesApi.share(id, sections); setLink(`${location.origin}/h/${r.shareToken}`); toast.success("Share link ready"); }
    catch (e) { toast.error(getErrorMessage(e, "Couldn't create link")); }
  }
  async function unshare() { await vehiclesApi.unshare(id); setLink(null); toast.success("Link turned off"); }
  async function fit(partId: string, fits: boolean) { await vehiclesApi.confirmFit(partId, fits); toast.success(fits ? "Thanks! Fit confirmed." : "Noted. We'll flag it to the seller."); load(); }
  async function decide(accessId: string, grant: boolean) { await vehiclesApi.decideAccess(accessId, grant); load(); }

  if (error) return <EmptyState title="Passport unavailable" body={error} />;
  if (!p) return <div className="max-w-[1000px] mx-auto px-4 py-8 space-y-4"><Skel className="h-56" /><Skel className="h-72" /></div>;
  const v = p.vehicle;

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link href="/vehicles" className="text-[13px] font-bold text-ink-3">← My machines</Link>

        {/* Passport card */}
        <div className="mt-3 rounded-[24px] bg-ink text-white p-6 md:p-8 relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-2 bg-[color:var(--brand)]" />
          <LogoMark size={300} color="rgba(255,255,255,.05)" className="absolute -right-16 -bottom-24" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-white/55">{v.regNo ? "Vehicle Passport" : "Machine Passport"}</div>
              {v.regNo ? <span className="reg-plate text-[20px] mt-3">{v.regNoDisplay}</span> : <span className="inline-flex mt-3 h-8 px-3 items-center rounded-[10px] bg-white/10 mono text-[15px] font-bold">{v.regNoDisplay}</span>}
              <div className="mt-3 text-[24px] font-extrabold tracking-tight">{v.nickname || `${v.makeName} ${v.modelName}`}</div>
              <div className="text-white/70 font-semibold capitalize">{v.label}</div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="rounded-[14px] bg-white p-2"><BrandLogo name={v.makeName} size={48} /></span>
              <button onClick={() => setShareOpen(true)} className="h-10 px-4 rounded-[12px] bg-white/10 hover:bg-white/15 text-[13.5px] font-extrabold">Share history</button>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[["Services", p.stats.services], ["Parts fitted", p.stats.partsFitted], ["Active warranties", p.stats.activeWarranties], ["Spent (verified)", inr(p.stats.totalSpent)]].map(([l, n]) => (
              <div key={l as string} className="rounded-[14px] bg-white/[0.07] p-3"><div className="text-[22px] font-extrabold">{n}</div><div className="text-[12px] font-bold text-white/55">{l}</div></div>
            ))}
          </div>
          {v.odometerKm && <div className="relative mt-4 text-[13px] text-white/60 font-semibold">Last recorded odometer: <b className="text-white">{v.odometerKm.toLocaleString("en-IN")} km</b></div>}
        </div>

        {/* Live jobs */}
        {p.activeJobs.map((j) => (
          <div key={j.jobCardId} className="mt-4 card p-5 flex items-center justify-between gap-4 flex-wrap border-2 border-[color:var(--accent)]">
            <div>
              <div className="text-[12px] font-extrabold uppercase tracking-wide text-[color:var(--accent)]">At the garage now</div>
              <div className="text-[16px] font-extrabold mt-0.5">{j.garageName} · {JOB_LABEL[j.status] ?? j.status}</div>
              <div className="text-[13px] text-ink-3 font-semibold">Job {j.number} · since {format(new Date(j.createdAt), "d MMM, h:mm a")}</div>
            </div>
            {j.status === "estimate_sent" && j.estimateToken && <Link href={`/e/${j.estimateToken}`} className="h-11 px-5 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">Review estimate</Link>}
          </div>
        ))}

        <div className="mt-6 flex gap-2 overflow-x-auto scroll-hidden">{TABS.map((t) => <button key={t} className="chip" data-on={tab === t} onClick={() => setTab(t)}>{t}{t === "Access" && p.access.some((a) => a.status === "pending") ? " •" : ""}</button>)}</div>

        <div className="mt-4">
          {tab === "Timeline" && (p.services.length ? (
            <ol className="relative border-l-2 border-line ml-3 space-y-5">
              {p.services.map((s) => (
                <li key={s.jobCardId} className="ml-6 relative">
                  <span className="absolute -left-[35px] top-4 w-5 h-5 rounded-full bg-[color:var(--success)] ring-4 ring-paper-3 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4"><path d="m5 12 5 5L20 7" /></svg></span>
                  <div className="card p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-[12.5px] font-bold text-ink-3">{format(new Date(s.date), "d MMM yyyy")}{s.odometerKm ? ` · ${s.odometerKm.toLocaleString("en-IN")} km` : ""}</div>
                        <div className="text-[16px] font-extrabold mt-0.5">{s.garageName}{s.garageCity ? `, ${s.garageCity}` : ""}</div>
                        {s.complaint && <div className="text-[13.5px] text-ink-2 mt-0.5">“{s.complaint}”</div>}
                      </div>
                      <VerifiedBadge label="Garage-verified" />
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-2">{s.items.map((i, k) => <li key={k} className="chip !h-7 !text-[12px]">{i.kind === "labour" ? "🔧" : "⚙️"} {i.brand ? `${i.brand} ` : ""}{i.name}</li>)}</ul>
                    {s.invoice && (
                      <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-[13.5px]">
                        <span className="font-bold">Invoice {s.invoice.number} · {inr(s.invoice.total)}</span>
                        <span className="flex items-center gap-3">
                          <StatusChip tone={s.invoice.status === "paid" ? "green" : "amber"}>{s.invoice.status === "paid" ? "Paid" : "Unpaid"}</StatusChip>
                          {s.invoice.status !== "paid" && <Link href={`/pay/invoice/${s.invoice.payToken}`} className="font-extrabold text-[color:var(--accent)]">Pay</Link>}
                          <Link href={`/verify/${s.invoice.verifyCode}`} className="font-extrabold text-[color:var(--accent)]">Verify</Link>
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : <EmptyState title="No services recorded yet" body="When a workshop on FindMySpare services this (with your OK), it appears here automatically: parts, odometer, invoice and all." />)}

          {tab === "Parts & warranty" && (p.parts.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {p.parts.map((x) => (
                <div key={x.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="text-[15.5px] font-extrabold">{x.brand ? `${x.brand} ` : ""}{x.name}</div><div className="text-[12.5px] text-ink-3 font-semibold">{x.partNumber ? `#${x.partNumber} · ` : ""}Fitted {format(new Date(x.fittedAt), "d MMM yyyy")}{x.odometerKm ? ` at ${x.odometerKm.toLocaleString("en-IN")} km` : ""}</div></div>
                    {x.warrantyActive ? <StatusChip tone="green">{x.warrantyDaysLeft}d warranty left</StatusChip> : <StatusChip tone="grey">No warranty</StatusChip>}
                  </div>
                  <div className="mt-2 text-[12.5px] text-ink-3 font-semibold">By {x.garageName}{x.sellerName ? ` · Sourced from ${x.sellerName}` : ""}</div>
                  {x.warrantyActive && (
                    <div className="mt-3 h-2 rounded-full bg-paper-2 overflow-hidden"><div className="h-full bg-[color:var(--success)]" style={{ width: `${Math.min(100, (x.warrantyDaysLeft / 365) * 100)}%` }} /></div>
                  )}
                  <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-2">
                    {x.fitConfirmed === null ? (
                      <><span className="text-[13px] font-bold">Did it fit well?</span><span className="flex gap-2"><button onClick={() => fit(x.id, true)} className="chip !h-8">👍 Yes</button><button onClick={() => fit(x.id, false)} className="chip !h-8">👎 No</button></span></>
                    ) : <span className={clsx("text-[13px] font-extrabold", x.fitConfirmed ? "text-[color:var(--success)]" : "text-[color:var(--amber)]")}>{x.fitConfirmed ? "✓ You confirmed the fit" : "Reported as not fitting"}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="Warranty wallet is empty" body="Every part a garage fits is listed here with its warranty countdown." />)}

          {tab === "Invoices" && (p.invoices.length ? (
            <div className="card divide-y divide-line">
              {p.invoices.map((i) => (
                <div key={i.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div><div className="text-[14.5px] font-extrabold">{i.number} · {i.garageName}</div><div className="text-[12.5px] text-ink-3 font-semibold mono">{format(new Date(i.issuedAt), "d MMM yyyy")} · {i.verifyCode}</div></div>
                  <div className="flex items-center gap-3"><span className="price">{inr(i.total)}</span><StatusChip tone={i.status === "paid" ? "green" : "amber"}>{i.status}</StatusChip><Link href={`/verify/${i.verifyCode}`} className="text-[13px] font-extrabold text-[color:var(--accent)]">Verify</Link></div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No invoices yet" />)}

          {tab === "Access" && (
            <div className="card divide-y divide-line">
              {p.access.length ? p.access.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div><div className="text-[14.5px] font-extrabold">{a.garageName}{a.garageCity ? `, ${a.garageCity}` : ""}</div><div className="text-[12.5px] text-ink-3 font-semibold">Requested {format(new Date(a.requestedAt), "d MMM yyyy")}</div></div>
                  <div className="flex items-center gap-2">
                    <StatusChip tone={a.status === "granted" ? "green" : a.status === "pending" ? "amber" : "grey"}>{a.status}</StatusChip>
                    {a.status !== "granted" && <button onClick={() => decide(a.id, true)} className="h-9 px-3 rounded-[10px] bg-[color:var(--success)] text-white text-[13px] font-extrabold">Allow</button>}
                    {a.status !== "revoked" && <button onClick={() => decide(a.id, false)} className="h-9 px-3 rounded-[10px] border border-line-2 text-[13px] font-bold">{a.status === "granted" ? "Revoke" : "Decline"}</button>}
                  </div>
                </div>
              )) : <div className="p-6 text-[14px] text-ink-3">No garage has asked to update this Passport yet.</div>}
              <div className="p-4 text-[12.5px] text-ink-3">You own this record. Garages can only add to it with your permission, and you choose what&apos;s shared.</div>
            </div>
          )}
        </div>
      </div>

      <Sheet open={shareOpen} onClose={() => setShareOpen(false)} title="Share verified history">
        <p className="text-[14px] text-ink-2">Selling your vehicle? A verified history builds trust with buyers. The number plate is partly masked.</p>
        <div className="mt-4 space-y-2">
          {([["services", "Service timeline"], ["parts", "Parts fitted"], ["odometer", "Odometer readings"], ["invoices", "Invoice amounts"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between p-3.5 rounded-[14px] border border-line cursor-pointer">
              <span className="text-[14.5px] font-bold">{l}</span>
              <input type="checkbox" checked={sections[k]} onChange={(e) => setSections({ ...sections, [k]: e.target.checked })} className="w-5 h-5 accent-[color:var(--accent)]" />
            </label>
          ))}
        </div>
        <button onClick={share} className="mt-5 w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">{link ? "Update link" : "Create share link"}</button>
        {link && (
          <div className="mt-4 rounded-[14px] bg-paper-2 p-3">
            <div className="mono text-[12.5px] break-all">{link}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(link); toast.success("Copied"); }} className="chip !h-8">Copy</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Verified service history for my ${v.makeName} ${v.modelName}: ${link}`)}`} target="_blank" rel="noopener noreferrer" className="chip !h-8">WhatsApp</a>
              <Link href={link.replace(location.origin, "")} target="_blank" className="chip !h-8">Preview</Link>
              <button onClick={unshare} className="chip !h-8 !text-[color:var(--danger)]">Turn off</button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
