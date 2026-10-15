"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { bizApi } from "@/lib/api/v3";
import { EmptyState, Skel, StatusChip } from "@/components/shop/ui";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, SellerOnly, btnSmall, useApi } from "@/components/biz/kit";

export default function RadarPage() {
  const { isSeller, me } = useBiz();
  const r = useApi(isSeller ? "radar" : null, () => bizApi.radar());
  if (!isSeller) return <Page><PageHead title="Demand radar" back="/biz/more" /><SellerOnly what="Demand radar" /></Page>;

  const searches = r.data?.searches ?? [];
  const gaps = searches.filter((s) => s.my_listings === 0).length;
  const max = Math.max(1, ...searches.map((s) => s.searches));

  return (
    <Page>
      <PageHead
        title="Demand radar"
        sub={me.industries?.length ? "What buyers searched in your industries, last 30 days" : "What buyers searched on FindMySpare, last 30 days"}
        back="/biz"
      />
      {r.error ? <ErrorCard message={r.error} onRetry={r.reload} /> : !r.data ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skel key={i} className="h-14" />)}</div>
      ) : (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
          <section>
            {gaps > 0 && (
              <div className="rounded-[16px] bg-[color:var(--accent-wash)] p-4 mb-3 flex items-center gap-3">
                <BI.radar size={22} className="text-[color:var(--accent)] flex-shrink-0" />
                <div className="text-[14px] font-bold text-ink-2"><span className="font-extrabold text-ink">{gaps} searched item{gaps === 1 ? "" : "s"}</span> you don&apos;t list yet. Listing them puts you in front of these buyers.</div>
              </div>
            )}
            {!searches.length ? (
              <EmptyState title="No searches yet" body={me.industries?.length ? "Nobody has searched your industries in the last 30 days." : "Pick your industries in setup to see searches that matter to you."} action={!me.industries?.length ? <Link href="/biz/setup" className="font-extrabold text-[color:var(--accent)]">Pick industries</Link> : undefined} />
            ) : (
              <ul className="card-flat divide-y divide-line overflow-hidden">
                {searches.map((s) => (
                  <li key={s.term} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-extrabold capitalize truncate">{s.term}</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-paper-2 overflow-hidden" aria-hidden>
                        <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${(s.searches / max) * 100}%` }} />
                      </div>
                      <div className="text-[12px] text-ink-3 font-semibold mt-1">
                        {s.searches} search{s.searches === 1 ? "" : "es"}
                        {s.zero_result > 0 && <span className="text-[color:var(--danger)] font-bold"> · {s.zero_result} found nothing</span>}
                      </div>
                    </div>
                    {s.my_listings > 0 ? (
                      <StatusChip tone="green">You list {s.my_listings}</StatusChip>
                    ) : (
                      <Link href={`/supplier/products/new?name=${encodeURIComponent(s.term)}`} className={clsx(btnSmall, "bg-[color:var(--accent)] text-white flex-shrink-0")}><BI.plus size={15} /> Add listing</Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-[16px] font-extrabold">Buyers asking for parts</h2>
              <Link href="/supplier/leads" className="text-[13px] font-extrabold text-[color:var(--accent)]">All leads</Link>
            </div>
            {!r.data.requests.length ? (
              <div className="card-flat p-4 text-[14px] text-ink-3 font-semibold">No open part requests right now.</div>
            ) : (
              <ul className="card-flat divide-y divide-line overflow-hidden">
                {r.data.requests.map((q) => (
                  <li key={q.id}>
                    <Link href={`/supplier/leads/${q.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper-2">
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-extrabold truncate">{q.partName}</span>
                        <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{[[q.make, q.model].filter(Boolean).join(" "), q.city, `${formatDistanceToNowStrict(new Date(q.createdAt))} ago`].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className="text-[13px] font-extrabold text-[color:var(--accent)]">Quote</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Page>
  );
}
