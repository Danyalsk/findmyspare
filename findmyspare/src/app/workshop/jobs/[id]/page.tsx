"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { garageApi, inr, type InspectionPoint, type JobItem } from "@/lib/api/v2";
import { JOB_STATUS } from "@/lib/job-status";
import { Sheet, Skel, StatusChip, Field, inputCls, EmptyState } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

type Job = Awaited<ReturnType<typeof garageApi.job>>;
const STEPS = ["open", "estimate_sent", "approved", "in_progress", "ready", "invoiced", "paid"] as const;
const STEP_LABEL = ["Checked in", "Estimate sent", "Approved", "Working", "Ready", "Invoiced", "Paid"];
const CYCLE: InspectionPoint["status"][] = ["ok", "attention", "urgent"];
const blankLine = { kind: "part" as "part" | "labour", name: "", brand: "", partNumber: "", unitPrice: "", quantity: "1", gstRate: "28", warrantyMonths: "0" };

export default function JobCardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [d, setD] = useState<Job | null>(null);
  const [lineOpen, setLineOpen] = useState(false);
  const [line, setLine] = useState(blankLine);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => garageApi.job(id).then(setD).catch((e) => setError(getErrorMessage(e, "Couldn't load job"))), [id]);
  useEffect(() => { load(); }, [load]);
  // Keep quote counts / approvals fresh while the job is live.
  useEffect(() => { const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const run = async (key: string, fn: () => Promise<unknown>, ok?: string) => {
    setBusy(key);
    try { await fn(); if (ok) toast.success(ok); await load(); }
    catch (e) { toast.error(getErrorMessage(e, "Something went wrong")); }
    finally { setBusy(""); }
  };

  if (error) return <EmptyState title="Job not found" body={error} />;
  if (!d) return <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-4"><Skel className="h-32" /><Skel className="h-80" /></div>;

  const { job, vehicle, items, totals, invoice, access, ownerLinked } = d;
  const locked = ["invoiced", "paid", "cancelled"].includes(job.status);
  const stepIdx = STEPS.indexOf(job.status as (typeof STEPS)[number]);
  const estimateUrl = job.estimateToken ? `${typeof window !== "undefined" ? location.origin : ""}/e/${job.estimateToken}` : "";
  const canInvoice = ["approved", "in_progress", "ready"].includes(job.status);

  function cycleInspection(i: number) {
    if (locked) return;
    const next = job.inspection.map((p, k) => (k === i ? { ...p, status: CYCLE[(CYCLE.indexOf(p.status) + 1) % 3]! } : p));
    setD({ ...d!, job: { ...job, inspection: next } });
    garageApi.updateJob(job.id, { inspection: next }).catch(() => load());
  }

  // Optimistic: tick immediately, roll back via reload if the save fails.
  function toggleFitted(itemId: string, fitted: boolean) {
    setD((cur) => cur && { ...cur, items: cur.items.map((x) => (x.id === itemId ? { ...x, fitted } : x)) });
    garageApi.updateItem(job.id, itemId, { fitted }).catch((e) => { toast.error(getErrorMessage(e, "Couldn't save")); load(); });
  }

  async function addLine() {
    await run("line", () => garageApi.addItem(job.id, {
      kind: line.kind, name: line.name, unitPrice: line.unitPrice, quantity: Number(line.quantity) || 1, gstRate: Number(line.gstRate),
      brand: line.brand || undefined, partNumber: line.partNumber || undefined, warrantyMonths: Number(line.warrantyMonths) || 0,
    }), "Line added");
    setLine(blankLine); setLineOpen(false);
  }

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <Link href="/workshop" className="text-[13px] font-bold text-ink-3">← Workshop</Link>

        {/* Header */}
        <div className="card p-5 mt-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap"><span className="reg-plate text-[16px]">{vehicle.regNoDisplay}</span><StatusChip tone={JOB_STATUS[job.status]!.tone}>{JOB_STATUS[job.status]!.label}</StatusChip></div>
              <div className="mt-2 text-[20px] font-extrabold tracking-tight">{vehicle.label}</div>
              <div className="text-[13px] text-ink-3 font-semibold">Job {job.number} · {job.customerName ?? "Walk-in"}{job.customerPhone ? ` · ${job.customerPhone}` : ""}{job.odometerKm ? ` · ${job.odometerKm.toLocaleString("en-IN")} km` : ""}</div>
            </div>
            <div className="text-right"><div className="text-[12px] font-bold text-ink-3">Estimate (incl. GST)</div><div className="price text-[26px]">{inr(totals.total, { decimals: true })}</div></div>
          </div>
          {/* Stepper */}
          <div className="mt-5 flex items-center gap-1 overflow-x-auto scroll-hidden">
            {STEP_LABEL.map((l, i) => (
              <div key={l} className="flex items-center gap-1 flex-shrink-0">
                <span className={clsx("h-7 px-3 rounded-full text-[12px] font-extrabold inline-flex items-center", i < stepIdx ? "bg-[color:var(--success-wash)] text-[color:var(--success)]" : i === stepIdx ? "bg-[color:var(--accent)] text-white" : "bg-paper-2 text-ink-4")}>{i < stepIdx ? "✓ " : ""}{l}</span>
                {i < STEP_LABEL.length - 1 && <span className="w-3 h-[2px] bg-line-2" />}
              </div>
            ))}
          </div>
          {/* Consent */}
          <div className={clsx("mt-4 rounded-[12px] p-3 text-[13px] font-bold", access?.status === "granted" ? "bg-[color:var(--success-wash)] text-[color:var(--success)]" : "bg-[color:var(--amber-wash)] text-[color:var(--amber)]")}>
            {access?.status === "granted" ? "✓ Owner allowed this service to go into their Vehicle Passport." : ownerLinked ? "Waiting for the owner to allow Passport updates. They got a request in the app." : "Vehicle isn't linked to an owner yet. History will attach when the owner adds this plate."}
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-[1.5fr_1fr] gap-4 items-start">
          {/* Lines */}
          <div className="card">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <div className="text-[16px] font-extrabold">Parts & labour</div>
              {!locked && <button onClick={() => setLineOpen(true)} className="h-9 px-4 rounded-[10px] bg-ink text-paper text-[13px] font-extrabold">+ Add line</button>}
            </div>
            {!items.length ? <div className="p-6 text-[14px] text-ink-3">Add the parts and labour for this job. Missing a part? Add it and tap <b>Get quotes</b> to source it from verified sellers.</div> : (
              <ul className="divide-y divide-line">
                {items.map((i: JobItem) => (
                  <li key={i.id} className={clsx("px-5 py-4", !i.approved && "opacity-50")}>
                    <div className="flex items-start gap-3">
                      <span className={clsx("mt-0.5 w-7 h-7 rounded-[8px] flex items-center justify-center text-[13px] flex-shrink-0", i.kind === "part" ? "bg-[color:var(--accent-wash)]" : "bg-[color:var(--info-wash)]")}>{i.kind === "part" ? "⚙️" : "🔧"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14.5px] font-extrabold">{i.brand ? `${i.brand} ` : ""}{i.name}{!i.approved && <span className="ml-2 text-[12px] text-[color:var(--danger)]">Declined by owner</span>}</div>
                        <div className="text-[12.5px] text-ink-3 font-semibold">
                          {i.quantity} × {inr(i.unitPrice)} · GST {i.gstRate}%{i.partNumber ? ` · #${i.partNumber}` : ""}{i.warrantyMonths ? ` · ${i.warrantyMonths}m warranty` : ""}
                          {i.sellerName && <> · from <b className="text-ink-2">{i.sellerName}</b></>}
                        </div>
                        {i.kind === "part" && !locked && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {!i.inquiryId ? (
                              <button disabled={!!busy} onClick={() => run(`q${i.id}`, () => garageApi.requestQuotes(job.id, i.id), "Request sent to verified sellers")} className="h-8 px-3 rounded-[10px] border border-[color:var(--accent)] text-[color:var(--accent)] text-[12.5px] font-extrabold">Get quotes</button>
                            ) : i.order ? (
                              <Link href={`/buyer/orders/${i.order.id}`} className="h-8 px-3 inline-flex items-center rounded-[10px] bg-[color:var(--success-wash)] text-[color:var(--success)] text-[12.5px] font-extrabold">Ordered · {i.order.paymentStatus === "paid" ? i.order.status.replace("_", " ") : "awaiting payment"}</Link>
                            ) : (
                              <Link href={`/buyer/requests/${i.inquiryId}`} className="h-8 px-3 inline-flex items-center rounded-[10px] bg-[color:var(--info-wash)] text-[color:var(--info)] text-[12.5px] font-extrabold">{i.quotes ? `${i.quotes.n} quote${i.quotes.n > 1 ? "s" : ""} · best ${inr(i.quotes.best)} →` : "Waiting for quotes…"}</Link>
                            )}
                            <label className="h-8 px-3 inline-flex items-center gap-1.5 rounded-[10px] bg-paper-2 text-[12.5px] font-bold cursor-pointer">
                              <input type="checkbox" checked={i.fitted} onChange={(e) => toggleFitted(i.id, e.target.checked)} className="accent-[color:var(--success)]" /> Fitted
                            </label>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="price text-[14.5px]">{inr(i.quantity * parseFloat(i.unitPrice) * (1 + i.gstRate / 100))}</div>
                        {!locked && <button onClick={() => run(`d${i.id}`, () => garageApi.removeItem(job.id, i.id))} className="text-[12px] font-bold text-ink-4 hover:text-[color:var(--danger)] mt-1">Remove</button>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="px-5 py-4 border-t border-dashed border-line-2 text-[13.5px] space-y-1">
              <div className="flex justify-between"><span className="text-ink-3">Taxable value</span><b>{inr(totals.taxable, { decimals: true })}</b></div>
              <div className="flex justify-between"><span className="text-ink-3">CGST + SGST</span><b>{inr(parseFloat(totals.cgst) + parseFloat(totals.sgst), { decimals: true })}</b></div>
              <div className="flex justify-between text-[16px] pt-1"><span className="font-extrabold">Total (approved lines)</span><span className="price">{inr(totals.total, { decimals: true })}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Actions */}
            <div className="card p-5 space-y-2.5">
              <div className="text-[16px] font-extrabold mb-1">Next step</div>
              {invoice ? (
                <Link href={`/workshop/invoices/${invoice.id}`} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold flex items-center justify-center">View invoice {invoice.number}</Link>
              ) : (
                <>
                  {["open", "estimate_sent"].includes(job.status) && (
                    <button disabled={!items.length || !!busy} onClick={() => run("est", async () => { await garageApi.sendEstimate(job.id); setShareOpen(true); }, "Estimate ready to share")} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">
                      {job.status === "estimate_sent" ? "Re-send estimate" : "Send estimate to owner"}
                    </button>
                  )}
                  {job.status === "estimate_sent" && <button onClick={() => setShareOpen(true)} className="w-full h-11 rounded-[14px] border border-line-2 font-bold">Share link again</button>}
                  {job.status === "approved" && <button disabled={!!busy} onClick={() => run("prog", () => garageApi.updateJob(job.id, { status: "in_progress" }), "Work started")} className="w-full h-12 rounded-[14px] bg-ink text-paper font-extrabold">Start work</button>}
                  {job.status === "in_progress" && <button disabled={!!busy} onClick={() => run("ready", () => garageApi.updateJob(job.id, { status: "ready" }), "Marked ready")} className="w-full h-12 rounded-[14px] bg-ink text-paper font-extrabold">Mark ready for pickup</button>}
                  {canInvoice && (
                    <button disabled={!!busy} onClick={() => run("inv", async () => { const r = await garageApi.invoice(job.id); router.push(`/workshop/invoices/${r.invoice.id}`); }, "GST invoice issued")} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Generate GST invoice</button>
                  )}
                  {job.status === "estimate_sent" && <p className="text-[12.5px] text-ink-3">Invoicing unlocks once the owner approves the estimate.</p>}
                </>
              )}
            </div>

            {/* Inspection */}
            <div className="card p-5">
              <div className="flex items-center justify-between"><div className="text-[16px] font-extrabold">Inspection</div><span className="text-[12px] text-ink-3 font-semibold">Tap to change</span></div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {job.inspection.map((p, i) => (
                  <button key={p.label} onClick={() => cycleInspection(i)} className={clsx("h-11 px-3 rounded-[12px] text-left text-[13px] font-bold flex items-center justify-between", p.status === "ok" ? "bg-[color:var(--success-wash)] text-[color:var(--success)]" : p.status === "attention" ? "bg-[color:var(--amber-wash)] text-[color:var(--amber)]" : "bg-[color:var(--danger-wash)] text-[color:var(--danger)]")}>
                    {p.label}<span className="text-[11px] uppercase">{p.status === "ok" ? "OK" : p.status === "attention" ? "Soon" : "Now"}</span>
                  </button>
                ))}
              </div>
              {job.complaint && <div className="mt-3 text-[13px] text-ink-2"><b>Complaint:</b> {job.complaint}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Add line */}
      <Sheet open={lineOpen} onClose={() => setLineOpen(false)} title="Add a line">
        <div className="flex gap-2 mb-4">{(["part", "labour"] as const).map((k) => <button key={k} className="chip" data-on={line.kind === k} onClick={() => setLine({ ...line, kind: k, gstRate: k === "labour" ? "18" : "28" })}>{k === "part" ? "⚙️ Part" : "🔧 Labour"}</button>)}</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label={line.kind === "part" ? "Part name" : "Labour description"}><input className={inputCls} value={line.name} onChange={(e) => setLine({ ...line, name: e.target.value })} placeholder={line.kind === "part" ? "Front brake pads" : "Brake service"} /></Field></div>
          {line.kind === "part" && <><Field label="Brand"><input className={inputCls} value={line.brand} onChange={(e) => setLine({ ...line, brand: e.target.value })} /></Field><Field label="Part no."><input className={`${inputCls} mono`} value={line.partNumber} onChange={(e) => setLine({ ...line, partNumber: e.target.value })} /></Field></>}
          <Field label="Price (excl. GST)"><input className={inputCls} inputMode="decimal" value={line.unitPrice} onChange={(e) => setLine({ ...line, unitPrice: e.target.value.replace(/[^\d.]/g, "") })} placeholder="₹" /></Field>
          <Field label="Qty"><input className={inputCls} inputMode="numeric" value={line.quantity} onChange={(e) => setLine({ ...line, quantity: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="GST %"><select className={inputCls} value={line.gstRate} onChange={(e) => setLine({ ...line, gstRate: e.target.value })}>{["0", "5", "12", "18", "28"].map((r) => <option key={r}>{r}</option>)}</select></Field>
          {line.kind === "part" && <Field label="Warranty (months)"><input className={inputCls} inputMode="numeric" value={line.warrantyMonths} onChange={(e) => setLine({ ...line, warrantyMonths: e.target.value.replace(/\D/g, "") })} /></Field>}
        </div>
        <button disabled={line.name.length < 2 || !line.unitPrice || busy === "line"} onClick={addLine} className="mt-5 w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">Add to job</button>
        {line.kind === "part" && <p className="mt-3 text-[12.5px] text-ink-3 text-center">Don&apos;t have it in stock? Add it with your selling price, then tap “Get quotes”.</p>}
      </Sheet>

      {/* Share estimate */}
      <Sheet open={shareOpen} onClose={() => setShareOpen(false)} title="Share estimate with the owner">
        <p className="text-[14px] text-ink-2">The owner can approve or decline each line from their phone, with no app or login needed.</p>
        <div className="mt-4 rounded-[14px] bg-paper-2 p-3 mono text-[12.5px] break-all">{estimateUrl}</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <a href={`https://wa.me/${(job.customerPhone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Namaste ${job.customerName ?? ""}, your estimate for ${vehicle.regNoDisplay} is ready: ${estimateUrl}`)}`} target="_blank" rel="noopener noreferrer" className="h-11 rounded-[12px] bg-[#25D366] text-white text-[13.5px] font-extrabold flex items-center justify-center">WhatsApp</a>
          <button onClick={() => { navigator.clipboard?.writeText(estimateUrl); toast.success("Link copied"); }} className="h-11 rounded-[12px] border border-line-2 text-[13.5px] font-extrabold">Copy link</button>
          <Link href={`/e/${job.estimateToken}`} target="_blank" className="h-11 rounded-[12px] border border-line-2 text-[13.5px] font-extrabold flex items-center justify-center">Preview</Link>
        </div>
      </Sheet>
    </div>
  );
}
