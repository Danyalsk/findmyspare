"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { fixApi, type Industry, type ServiceRequest } from "@/lib/api/v3";
import { IconTile } from "@/components/net/NetIcon";
import { Skel } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

type Nearby = Awaited<ReturnType<typeof fixApi.nearby>>;

/** "Jobs near you": open Fix requests matching the workshop's industries + city. */
export function NearbyJobs({ industries }: { industries: Industry[] | null }) {
  const router = useRouter();
  const [data, setData] = useState<Nearby | null>(null);
  const [failed, setFailed] = useState(false);
  const [taking, setTaking] = useState<string | null>(null);

  const load = useCallback(() => fixApi.nearby().then((d) => { setData(d); setFailed(false); }).catch(() => setFailed(true)), []);
  useEffect(() => { load(); }, [load]);
  // New requests land through the day; keep the list fresh while the screen is open.
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const ind = (slug: string) => industries?.find((i) => i.slug === slug);

  async function accept(r: ServiceRequest) {
    setTaking(r.id);
    try {
      const { job } = await fixApi.accept(r.id);
      toast.success(`Job ${job.number} is yours. Customer's phone and address are now on the job card.`);
      router.push(`/workshop/jobs/${job.id}`);
    } catch (e) {
      const msg = getErrorMessage(e, "Couldn't accept");
      if (/took|cancel|409/i.test(msg)) toast.info("Someone else took this job. Refreshing the list.");
      else toast.error(msg);
      setTaking(null);
      load();
    }
  }

  return (
    <section className="card overflow-hidden" aria-labelledby="nearby-h">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 id="nearby-h" className="text-[18px] font-extrabold tracking-tight flex items-center gap-2">
            Jobs near you
            {data && data.requests.length > 0 && <span className="h-6 min-w-6 px-2 rounded-full bg-[color:var(--accent)] text-white text-[12px] font-extrabold inline-flex items-center justify-center">{data.requests.length}</span>}
          </h2>
          <p className="text-[12.5px] text-ink-3 font-semibold">Repair requests from customers{data?.city ? ` in ${data.city}` : ""}. Phone and address unlock when you accept.</p>
        </div>
        <button onClick={() => load()} className="h-9 px-3 rounded-[10px] border border-line-2 text-[12.5px] font-extrabold fms-press">Refresh</button>
      </div>
      {!data ? (
        failed ? <div className="p-5 text-[13.5px] text-ink-3">Couldn&apos;t load nearby jobs. <button onClick={() => load()} className="font-extrabold text-[color:var(--accent)]">Try again</button></div>
          : <div className="p-5 grid sm:grid-cols-2 gap-3"><Skel className="h-36" /><Skel className="h-36" /></div>
      ) : !data.requests.length ? (
        <div className="p-6 text-center">
          <div className="text-[15px] font-extrabold">No open requests right now</div>
          <p className="text-[13px] text-ink-3 mt-1">We&apos;ll notify you the moment someone nearby books a repair in your industries.</p>
        </div>
      ) : (
        <ul className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.requests.map((r) => {
            const i = ind(r.industrySlug);
            return (
              <li key={r.id} className="min-w-0 card-flat rounded-[18px] border border-line p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <IconTile name={i?.icon ?? "gear"} tint={i?.tint ?? "#EEF0F3"} ink={i?.ink ?? "#3E434E"} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink-3 truncate">{i?.name ?? r.industrySlug}</div>
                    <div className="text-[15px] font-extrabold tracking-tight truncate">{r.machineType ?? "Repair"}{r.brand || r.model ? ` · ${[r.brand, r.model].filter(Boolean).join(" ")}` : ""}</div>
                  </div>
                  <span className="text-[11.5px] font-bold text-ink-3 whitespace-nowrap">{formatDistanceToNowStrict(new Date(r.createdAt))} ago</span>
                </div>
                <p className="text-[13.5px] text-ink-2 line-clamp-3">{r.problem}</p>
                <div className="flex flex-wrap gap-1.5 text-[12px] font-bold text-ink-2">
                  {r.city && <span className="h-6 px-2 rounded-full bg-paper-2 inline-flex items-center">{r.city}</span>}
                  {r.preferredTime && <span className="h-6 px-2 rounded-full bg-paper-2 inline-flex items-center">Prefers {r.preferredTime}</span>}
                  {r.customerName && <span className="h-6 px-2 rounded-full bg-paper-2 inline-flex items-center">{r.customerName}</span>}
                </div>
                <button disabled={!!taking} onClick={() => accept(r)} className="mt-auto h-11 rounded-[12px] bg-[color:var(--accent)] text-white text-[14px] font-extrabold disabled:opacity-50 fms-press">
                  {taking === r.id ? "Accepting…" : "Accept job"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** The workshop's industries as chips, with an Edit link. */
export function IndustryChips({ slugs, industries }: { slugs: string[]; industries: Industry[] | null }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[12px] font-bold text-ink-3 mr-0.5">You service</span>
      {slugs.map((s) => {
        const i = industries?.find((x) => x.slug === s);
        return (
          <span key={s} className="h-7 pl-1 pr-2.5 rounded-full bg-paper border border-line inline-flex items-center gap-1.5 text-[12.5px] font-bold">
            <IconTile name={i?.icon ?? "gear"} tint={i?.tint ?? "#EEF0F3"} ink={i?.ink ?? "#3E434E"} size={20} />
            {i?.name ?? s}
          </span>
        );
      })}
      <Link href="/workshop/settings" className="h-7 px-2.5 rounded-full inline-flex items-center text-[12.5px] font-extrabold text-[color:var(--accent)] hover:bg-[color:var(--accent-wash)]">Edit</Link>
    </div>
  );
}
