"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminNetworkApi, taxonomyApi, BUSINESS_ROLE_LABEL, type Industry, type NetworkOverview } from "@/lib/api/v3";
import { inr } from "@/lib/api/v2";
import { Skel, StatusChip } from "@/components/shop/ui";
import { IconTile } from "@/components/net/NetIcon";
import { NetBars, Kpi, AdminHead } from "@/components/admin/NetBars";
import { getErrorMessage } from "@/lib/errors";

type Row = NetworkOverview["industries"][number];
type Tone = "red" | "amber" | "blue" | "grey";

/** One-line read of supply vs demand for an industry. */
function health(r: Row): { tone: Tone; label: string; why: string } {
  const share = r.searches ? r.zero / r.searches : 0;
  if (!r.parts && (r.searches || r.requests)) return { tone: "red", label: "No supply", why: "Buyers are searching but nothing is listed" };
  if (r.searches >= 3 && share >= 0.4) return { tone: "amber", label: "Demand > supply", why: `${Math.round(share * 100)}% of searches found nothing` };
  if (r.parts && r.sellers <= 1) return { tone: "amber", label: "One seller", why: "All listings depend on a single seller" };
  if (!r.searches && !r.requests) return { tone: "grey", label: "Quiet", why: "No searches or repair requests in 30 days" };
  return { tone: "blue", label: "Balanced", why: "Most searches find a listing" };
}

const FIX_LABEL: Record<string, string> = { open: "Open (waiting for a technician)", accepted: "Accepted", completed: "Completed", cancelled: "Cancelled" };
const FIX_ORDER = ["open", "accepted", "completed", "cancelled"];

export default function NetworkOverviewPage() {
  const [d, setD] = useState<NetworkOverview | null>(null);
  const [err, setErr] = useState("");
  const [inds, setInds] = useState<Industry[]>([]);

  useEffect(() => {
    adminNetworkApi.overview().then(setD).catch((e) => setErr(getErrorMessage(e, "Couldn't load the network")));
    taxonomyApi.get().then((t) => setInds(t.industries)).catch(() => {});
  }, []);

  const ind = (slug: string | null) => (slug ? inds.find((i) => i.slug === slug) : undefined);
  const indName = (slug: string | null) => (slug ? ind(slug)?.name ?? d?.industries.find((i) => i.slug === slug)?.name ?? slug : "Any industry");

  return (
    <div className="max-w-6xl w-full mx-auto pb-12">
      <AdminHead
        title="Network"
        sub="Every business, industry and trade flow on FindMySpare, on one screen."
        action={
          <div className="flex gap-2">
            <Link href="/admin/network/businesses" className="h-10 px-4 inline-flex items-center rounded-[12px] border border-line-2 bg-paper text-[13px] font-extrabold fms-press">Businesses</Link>
            <Link href="/admin/network/taxonomy" className="h-10 px-4 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white text-[13px] font-extrabold fms-press">Taxonomy studio</Link>
          </div>
        }
      />
      {err && <div className="rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3 mb-4">{err}</div>}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {!d ? Array.from({ length: 4 }, (_, i) => <Skel key={i} className="h-[92px]" />) : (
          <>
            <Kpi label="Active trade links" value={d.trade.links.toLocaleString("en-IN")} sub="supplier ↔ buyer relationships" />
            <Kpi label="Purchase orders" value={d.trade.pos.toLocaleString("en-IN")} sub={`${inr(d.trade.po_value)} accepted or later`} />
            <Kpi label="Counter bills" value={d.trade.bills.toLocaleString("en-IN")} sub={`${inr(d.trade.bill_value)} billed`} />
            <Kpi label="Outstanding credit" value={inr(d.trade.receivable)} sub="net of all khata entries" />
          </>
        )}
      </div>

      <div className="mt-5 grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <section className="card p-5" aria-labelledby="roles-h">
          <h2 id="roles-h" className="text-[16px] font-extrabold tracking-tight">Businesses by supply-chain role</h2>
          <p className="text-[12.5px] text-ink-3 mb-4">A business can hold several roles.</p>
          {!d ? <Skel className="h-48" /> : (
            <NetBars rows={d.roles.map((r) => ({ key: r.role, label: BUSINESS_ROLE_LABEL[r.role] ?? r.role, value: r.n }))} empty="No business roles set yet" unit="businesses" />
          )}
        </section>
        <section className="card p-5" aria-labelledby="fix-h">
          <h2 id="fix-h" className="text-[16px] font-extrabold tracking-tight">Fix requests by status</h2>
          <p className="text-[12.5px] text-ink-3 mb-4">Repair bookings from customers, all time.</p>
          {!d ? <Skel className="h-40" /> : (() => {
            const by = new Map(d.fix.map((f) => [f.status, f.n]));
            const total = d.fix.reduce((s, f) => s + f.n, 0);
            const keys = [...FIX_ORDER, ...d.fix.map((f) => f.status).filter((s) => !FIX_ORDER.includes(s))];
            return (
              <>
                <div className="text-[28px] font-extrabold tracking-tight tabular-nums">{total.toLocaleString("en-IN")}<span className="text-[13px] font-bold text-ink-3 ml-1.5">requests</span></div>
                <div className="mt-3"><NetBars rows={keys.map((k) => ({ key: k, label: FIX_LABEL[k] ?? k, value: by.get(k) ?? 0 }))} unit="requests" /></div>
              </>
            );
          })()}
        </section>
      </div>

      {/* Industries */}
      <section className="card mt-4 overflow-hidden" aria-labelledby="ind-h">
        <div className="px-5 pt-5 pb-3 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 id="ind-h" className="text-[16px] font-extrabold tracking-tight">Industries</h2>
            <p className="text-[12.5px] text-ink-3">Supply (parts, sellers) against demand (searches, repair requests) over the last 30 days.</p>
          </div>
          <Link href="/admin/network/taxonomy" className="text-[13px] font-extrabold text-[color:var(--accent)]">Edit taxonomy →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-3 border-y border-line bg-paper-2">
                <th className="py-2.5 pl-5 pr-2 font-bold">Industry</th>
                <th className="py-2.5 px-2 font-bold text-right">Parts</th>
                <th className="py-2.5 px-2 font-bold text-right">Sellers</th>
                <th className="py-2.5 px-2 font-bold text-right">Businesses</th>
                <th className="py-2.5 px-2 font-bold text-right">Searches 30d</th>
                <th className="py-2.5 px-2 font-bold text-right">Zero-result</th>
                <th className="py-2.5 px-2 font-bold text-right">Fix requests</th>
                <th className="py-2.5 pl-2 pr-5 font-bold">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!d ? <tr><td colSpan={8} className="p-5"><Skel className="h-32" /></td></tr> : d.industries.map((r) => {
                const h = health(r);
                const i = ind(r.slug);
                const share = r.searches ? Math.round((r.zero / r.searches) * 100) : 0;
                return (
                  <tr key={r.slug} className="hover:bg-paper-2">
                    <td className="py-3 pl-5 pr-2">
                      <div className="flex items-center gap-2.5">
                        {i ? <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={30} /> : <span className="w-[30px] h-[30px] rounded-full bg-paper-2 flex-shrink-0" />}
                        <span className="font-extrabold">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{r.parts.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{r.sellers}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{r.businesses}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{r.searches}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{r.zero}{r.searches > 0 && <span className="text-ink-3 font-medium"> · {share}%</span>}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{r.requests}</td>
                    <td className="py-3 pl-2 pr-5"><span title={h.why}><StatusChip tone={h.tone}>{h.label}</StatusChip></span><div className="text-[11px] text-ink-3 mt-0.5 max-w-[200px]">{h.why}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Search gaps */}
      <section className="card p-5 mt-4" aria-labelledby="gaps-h">
        <h2 id="gaps-h" className="text-[16px] font-extrabold tracking-tight">Search gaps</h2>
        <p className="text-[12.5px] text-ink-3 mb-4">What buyers searched for in the last 30 days that nobody lists. Point sellers here first.</p>
        {!d ? <Skel className="h-40" /> : (
          <NetBars
            rows={d.searchGaps.map((g) => ({
              key: `${g.term}-${g.industry}`,
              value: g.n,
              hint: `"${g.term}" in ${indName(g.industry)}: ${g.n} searches with no results`,
              label: <span className="inline-flex items-center gap-2 min-w-0"><span className="font-extrabold text-ink truncate">{g.term}</span><span className="text-[11.5px] font-bold text-ink-3 whitespace-nowrap">{indName(g.industry)}</span></span>,
            }))}
            empty="No zero-result searches in the last 30 days"
            unit="searches"
          />
        )}
      </section>
    </div>
  );
}
