"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { garageApi, inr, type Garage, type GarageStats, type JobCard } from "@/lib/api/v2";
import { useMyGarage } from "@/components/shop/AppShell";
import { Field, inputCls, Skel, StatusChip, EmptyState, VerifiedBadge } from "@/components/shop/ui";
import { LogoMark } from "@/components/brand/Logo";
import { JOB_STATUS } from "@/lib/job-status";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";


function Setup({ onDone }: { onDone: (g: Garage) => void }) {
  const [f, setF] = useState({ name: "", gstin: "", phone: "", addressLine: "", city: "", state: "", pincode: "", upiId: "", invoicePrefix: "INV" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function save() {
    setBusy(true);
    try { const { garage } = await garageApi.save(Object.fromEntries(Object.entries(f).filter(([, v]) => v)) as typeof f); onDone(garage); toast.success("Your workshop is ready"); }
    catch (e) { toast.error(getErrorMessage(e, "Couldn't save")); setBusy(false); }
  }
  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="rounded-[24px] bg-ink text-white p-6 md:p-8 relative overflow-hidden">
        <LogoMark size={220} color="rgba(255,255,255,.06)" className="absolute -right-10 -bottom-16" />
        <div className="text-[13px] font-extrabold uppercase tracking-wider text-[color:var(--brand)]">FindMySpare Workshop · Free</div>
        <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mt-2 leading-tight">Job cards, GST bills and UPI collection, in one app.</h1>
        <p className="text-white/70 mt-2 max-w-[520px]">Set up in a minute. Every invoice carries a QR your customers (and their insurers) can verify.</p>
      </div>
      <div className="card p-5 md:p-6 mt-5 grid grid-cols-2 gap-4">
        <div className="col-span-2"><Field label="Garage name"><input className={inputCls} value={f.name} onChange={set("name")} placeholder="Sharma Auto Works" /></Field></div>
        <Field label="GSTIN (optional)"><input className={`${inputCls} mono uppercase`} value={f.gstin} onChange={set("gstin")} placeholder="27ABCDE1234F1Z5" /></Field>
        <Field label="Phone"><input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+91 …" /></Field>
        <div className="col-span-2"><Field label="Address"><input className={inputCls} value={f.addressLine} onChange={set("addressLine")} /></Field></div>
        <Field label="City"><input className={inputCls} value={f.city} onChange={set("city")} /></Field>
        <Field label="State"><input className={inputCls} value={f.state} onChange={set("state")} /></Field>
        <Field label="PIN"><input className={inputCls} value={f.pincode} onChange={set("pincode")} /></Field>
        <Field label="UPI ID for collections"><input className={inputCls} value={f.upiId} onChange={set("upiId")} placeholder="garage@okicici" /></Field>
        <Field label="Invoice prefix" hint="Invoices are numbered PREFIX-YYYY-0001"><input className={`${inputCls} mono uppercase`} maxLength={10} value={f.invoicePrefix} onChange={set("invoicePrefix")} /></Field>
        <div className="col-span-2"><button disabled={f.name.length < 2 || busy} onClick={save} className="w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">Create my workshop</button></div>
      </div>
    </div>
  );
}

export default function WorkshopHome() {
  const { garage, refresh } = useMyGarage();
  const [stats, setStats] = useState<GarageStats | null>(null);
  const [jobs, setJobs] = useState<JobCard[] | null>(null);

  useEffect(() => {
    if (!garage) return;
    garageApi.me().then((r) => setStats(r.stats ?? null)).catch(() => {});
    garageApi.jobs("active").then((r) => setJobs(r.jobs)).catch(() => setJobs([]));
  }, [garage]);

  if (garage === undefined) return <div className="max-w-[1100px] mx-auto px-4 py-8"><Skel className="h-40" /></div>;
  if (garage === null) return <Setup onDone={(g) => refresh(g)} />;

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2"><h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">{garage.name}</h1>{garage.verified && <VerifiedBadge label="Verified Garage" />}</div>
            <p className="text-[14px] text-ink-3 font-semibold">{garage.city} · Workshop</p>
          </div>
          <Link href="/workshop/jobs/new" className="h-12 px-5 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold fms-press">+ New job card</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["Open jobs", stats?.open_jobs ?? "–"],
            ["Ready to bill", stats?.ready_jobs ?? "–"],
            ["Collected today", stats ? inr(stats.today_collected) : "–"],
            ["Unpaid bills", stats ? `${inr(stats.unpaid_total)} (${stats.unpaid_count})` : "–"],
            ["This month", stats ? inr(stats.month_revenue) : "–"],
          ].map(([l, v]) => <div key={l as string} className="card p-4"><div className="text-[12px] font-bold text-ink-3">{l}</div><div className="text-[20px] font-extrabold mt-0.5 tracking-tight">{v}</div></div>)}
        </div>

        <div className="mt-6 grid md:grid-cols-[1.6fr_1fr] gap-5 items-start">
          <div className="card">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between"><div className="text-[16px] font-extrabold">Vehicles in the workshop</div><span className="text-[13px] text-ink-3 font-bold">{jobs?.length ?? 0}</span></div>
            {!jobs ? <div className="p-5"><Skel className="h-16" /></div> : !jobs.length ? (
              <EmptyState title="No vehicles in right now" body="Open a job card when a vehicle checks in." action={<Link href="/workshop/jobs/new" className="font-extrabold text-[color:var(--accent)]">+ New job card</Link>} />
            ) : (
              <ul className="divide-y divide-line">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <Link href={`/workshop/jobs/${j.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper-2">
                      <span className="reg-plate text-[12px] flex-shrink-0">{j.regNoDisplay}</span>
                      <div className="flex-1 min-w-0"><div className="text-[14.5px] font-extrabold truncate">{j.vehicleLabel}</div><div className="text-[12.5px] text-ink-3 font-semibold truncate">{j.number} · {j.customerName ?? "Walk-in"} · {formatDistanceToNowStrict(new Date(j.createdAt))} ago</div></div>
                      <div className="text-right"><StatusChip tone={JOB_STATUS[j.status]!.tone}>{JOB_STATUS[j.status]!.label}</StatusChip>{j.estimateTotal && parseFloat(j.estimateTotal) > 0 && <div className="text-[12.5px] font-extrabold mt-1">{inr(j.estimateTotal)}</div>}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3">
            {[
              { href: "/workshop/invoices", t: "Invoices & payments", s: "GST bills, payment links, collections" },
              { href: "/workshop/customers", t: "Customers & vehicles", s: "Visit history and spend per vehicle" },
              { href: "/search", t: "Buy parts for the shop", s: "Trade prices from verified sellers" },
              { href: "/verify", t: "Verify any FMS invoice", s: "Scan or enter a code" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="card p-4 flex items-center justify-between hover:shadow-[var(--shadow-lifted)] transition-shadow">
                <div><div className="text-[15px] font-extrabold">{l.t}</div><div className="text-[12.5px] text-ink-3 font-semibold">{l.s}</div></div>
                <span className="text-ink-3 text-[18px]">›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
