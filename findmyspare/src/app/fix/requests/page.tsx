"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, Skel, StatusChip, Timeline } from "@/components/shop/ui";
import { IconTile, INDUSTRY_STYLE } from "@/components/net/NetIcon";
import { fixApi, type ServiceRequest } from "@/lib/api/v3";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

const JOB_LABEL: Record<string, string> = {
  open: "Inspecting", estimate_sent: "Estimate sent", approved: "Estimate approved", in_progress: "Work in progress",
  ready: "Ready", invoiced: "Bill sent", paid: "Paid", cancelled: "Cancelled",
};

export default function FixRequestsPage() {
  const [list, setList] = useState<ServiceRequest[] | null>(null);
  const load = useCallback(() => fixApi.mine().then((r) => setList(r.requests)).catch(() => setList([])), []);
  useEffect(() => { load(); }, [load]);

  async function cancel(id: string) {
    try { await fixApi.cancel(id); toast.success("Request cancelled"); load(); }
    catch (e) { toast.error(getErrorMessage(e, "Couldn't cancel")); }
  }

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">My repair requests</h1>
          <p className="text-[15px] text-ink-2 mt-1 font-medium">Track who took the job and where it stands.</p>
        </div>
        <Link href="/fix" className="h-12 px-5 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold fms-press">+ New request</Link>
      </div>

      <div className="mt-6 space-y-4">
        {!list ? [0, 1].map((i) => <Skel key={i} className="h-40" />)
          : !list.length ? <EmptyState title="No repair requests yet" body="Book a technician for your pump, AC, genset, vehicle or any machine." action={<Link href="/fix" className="h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Fix something</Link>} />
          : list.map((r) => {
            const st = INDUSTRY_STYLE[r.industrySlug] ?? INDUSTRY_STYLE.industrial!;
            const accepted = r.status === "accepted" || r.status === "completed";
            const jobDone = r.jobStatus === "paid" || r.jobStatus === "invoiced";
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <IconTile name={st.icon} tint={st.tint} ink={st.ink} size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-extrabold">{[r.brand, r.model].filter(Boolean).join(" ") || st.short}</span>
                      {r.status === "open" && <StatusChip tone="amber">Finding a technician</StatusChip>}
                      {accepted && <StatusChip tone="green">Technician assigned</StatusChip>}
                      {r.status === "cancelled" && <StatusChip tone="grey">Cancelled</StatusChip>}
                    </div>
                    <div className="text-[13.5px] text-ink-2 mt-1 line-clamp-2">{r.problem}</div>
                    <div className="text-[12.5px] text-ink-3 font-semibold mt-1">{r.city}{r.preferredTime ? ` · ${r.preferredTime}` : ""} · {ago(r.createdAt)}</div>
                  </div>
                </div>
                {r.status !== "cancelled" && (
                  <div className="mt-4">
                    <Timeline steps={[
                      { label: "Request sent", sub: "Technicians who fix this nearby were alerted", state: "done" },
                      { label: accepted ? `${r.garageName} accepted` : "Waiting for a technician", sub: accepted && r.garagePhone ? `Call ${r.garagePhone}` : undefined, state: accepted ? "done" : "current" },
                      { label: r.jobStatus ? JOB_LABEL[r.jobStatus] ?? "In progress" : "Inspection & estimate", sub: r.jobNumber ? `Job ${r.jobNumber} · approve estimates from your notifications` : undefined, state: jobDone ? "done" : accepted ? "current" : "todo" },
                      { label: "Fixed & added to your record", state: r.jobStatus === "paid" ? "done" : "todo" },
                    ]} />
                  </div>
                )}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {r.status === "open" && <button onClick={() => cancel(r.id)} className="h-10 px-4 rounded-[12px] bg-paper border border-line-2 text-[13.5px] font-bold">Cancel request</button>}
                  {accepted && r.garagePhone && <a href={`tel:${r.garagePhone.replace(/\s/g, "")}`} className="h-10 px-4 inline-flex items-center rounded-[12px] bg-[color:var(--success)] text-white text-[13.5px] font-extrabold">Call technician</a>}
                  {r.vehicleId && <Link href={`/vehicles/${r.vehicleId}`} className="h-10 px-4 inline-flex items-center rounded-[12px] bg-paper-2 text-[13.5px] font-bold hover:bg-paper-3">Open machine record</Link>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
