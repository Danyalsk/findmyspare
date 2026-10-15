"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { garageApi, inr, type GarageStats, type JobCard } from "@/lib/api/v2";
import { useMyGarage } from "@/components/shop/AppShell";
import { Skel, StatusChip, EmptyState, VerifiedBadge } from "@/components/shop/ui";
import { LogoMark } from "@/components/brand/Logo";
import { JOB_STATUS } from "@/lib/job-status";
import { toast } from "@/lib/toast";
import { GarageForm, type ServiceGarage } from "@/components/service/GarageForm";
import { useIndustries } from "@/components/service/IndustryPicker";
import { NearbyJobs, IndustryChips } from "@/components/service/NearbyJobs";
import { MachineId } from "@/components/service/MachineId";


function Setup({ onDone }: { onDone: (g: ServiceGarage) => void }) {
  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="rounded-[24px] bg-ink text-white p-6 md:p-8 relative overflow-hidden">
        <LogoMark size={220} color="rgba(255,255,255,.06)" className="absolute -right-10 -bottom-16" />
        <div className="text-[13px] font-extrabold uppercase tracking-wider text-[color:var(--brand)]">FindMySpare Workshop · Free</div>
        <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mt-2 leading-tight">Repair jobs, GST bills and UPI collection, in one app.</h1>
        <p className="text-white/70 mt-2 max-w-[520px]">For garages, pump and motor rewinders, appliance and genset technicians, tractor mechanics. Set up in a minute.</p>
      </div>
      <div className="mt-5"><GarageForm submitLabel="Create my workshop" onDone={(g) => { onDone(g); toast.success("Your workshop is ready"); }} /></div>
    </div>
  );
}

export default function WorkshopHome() {
  const { garage, refresh } = useMyGarage();
  const [stats, setStats] = useState<GarageStats | null>(null);
  const [jobs, setJobs] = useState<JobCard[] | null>(null);
  const industries = useIndustries();

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
            <div className="flex items-center gap-2"><h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">{garage.name}</h1>{garage.verified && <VerifiedBadge label="Verified Workshop" />}</div>
            <p className="text-[14px] text-ink-3 font-semibold">{garage.city ?? "Add your city"} · Workshop</p>
          </div>
          <Link href="/workshop/jobs/new" className="h-12 px-5 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold fms-press">+ New job card</Link>
        </div>

        <div className="mt-3"><IndustryChips slugs={(garage as ServiceGarage).industrySlugs?.length ? (garage as ServiceGarage).industrySlugs! : ["automotive"]} industries={industries} /></div>

        <div className="mt-5"><NearbyJobs industries={industries} /></div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["Open jobs", stats?.open_jobs ?? "–"],
            ["Ready to bill", stats?.ready_jobs ?? "–"],
            ["Collected today", stats ? inr(stats.today_collected) : "–"],
            ["Unpaid bills", stats ? `${inr(stats.unpaid_total)} (${stats.unpaid_count})` : "–"],
            ["This month", stats ? inr(stats.month_revenue) : "–"],
          ].map(([l, v]) => <div key={l as string} className="card p-4"><div className="text-[12px] font-bold text-ink-3">{l}</div><div className="text-[20px] font-extrabold mt-0.5 tracking-tight">{v}</div></div>)}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-5 items-start">
          <div className="card min-w-0">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between"><div className="text-[16px] font-extrabold">In the workshop</div><span className="text-[13px] text-ink-3 font-bold">{jobs?.length ?? 0}</span></div>
            {!jobs ? <div className="p-5"><Skel className="h-16" /></div> : !jobs.length ? (
              <EmptyState title="Nothing in right now" body="Open a job card when a vehicle or machine checks in." action={<Link href="/workshop/jobs/new" className="font-extrabold text-[color:var(--accent)]">+ New job card</Link>} />
            ) : (
              <ul className="divide-y divide-line">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <Link href={`/workshop/jobs/${j.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper-2">
                      <MachineId display={j.regNoDisplay} regNo={j.regNo ?? null} className="flex-shrink-0" />
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
              { href: "/workshop/customers", t: "Customers & machines", s: "Visit history and spend per vehicle or machine" },
              { href: "/search", t: "Buy parts for the shop", s: "Trade prices from verified sellers" },
              { href: "/verify", t: "Verify any FMS invoice", s: "Scan or enter a code" },
              { href: "/workshop/settings", t: "Workshop profile", s: "Industries, address, UPI, invoice prefix" },
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
