"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminNetworkApi, taxonomyApi, BUSINESS_ROLE_LABEL, type AdminBiz, type Industry } from "@/lib/api/v3";
import { Skel, StatusChip, EmptyState, inputCls } from "@/components/shop/ui";
import { AdminHead } from "@/components/admin/NetBars";
import { IconTile } from "@/components/net/NetIcon";

const VERIFY: Record<string, { tone: "green" | "amber" | "red" | "grey"; label: string }> = { approved: { tone: "green", label: "Verified" }, pending: { tone: "amber", label: "Pending" }, rejected: { tone: "red", label: "Rejected" }, not_submitted: { tone: "grey", label: "Not submitted" } };
const selectCls = `${inputCls} !h-11 !text-[14px] pr-8`;

export default function NetworkBusinessesPage() {
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [q, setQ] = useState("");
  const [debQ, setDebQ] = useState("");
  const [res, setRes] = useState<{ key: string; rows: AdminBiz[] | null; err?: string } | null>(null);
  const [inds, setInds] = useState<Industry[]>([]);

  useEffect(() => { taxonomyApi.get().then((t) => setInds(t.industries)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(() => setDebQ(q.trim()), 300); return () => clearTimeout(t); }, [q]);

  const key = `${role}|${industry}|${debQ}`;
  useEffect(() => {
    let live = true;
    adminNetworkApi.businesses({ role, industry, q: debQ })
      .then((r) => live && setRes({ key, rows: r.businesses }))
      .catch((e: Error) => live && setRes({ key, rows: [], err: e.message }));
    return () => { live = false; };
  }, [key, role, industry, debQ]);
  const loading = !res || res.key !== key;
  const rows = res?.rows ?? [];
  const ind = (slug: string) => inds.find((i) => i.slug === slug);

  return (
    <div className="max-w-6xl w-full mx-auto pb-12">
      <Link href="/admin/network" className="text-[13px] font-bold text-ink-3">← Network</Link>
      <div className="mt-2"><AdminHead title="Businesses" sub="Everyone who trades on the network: manufacturers to recyclers, in every industry." /></div>

      <div className="card p-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr] gap-2">
        <label className="block"><span className="sr-only">Role</span>
          <select aria-label="Role" className={selectCls} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            {Object.entries(BUSINESS_ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label className="block"><span className="sr-only">Industry</span>
          <select aria-label="Industry" className={selectCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All industries</option>
            {inds.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="sr-only">Search</span>
          <input aria-label="Search businesses" type="search" className={`${inputCls} !h-11 !text-[14px]`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or city" />
        </label>
      </div>

      <div className="mt-3 text-[12.5px] font-bold text-ink-3">{loading ? "Loading…" : `${rows.length}${rows.length === 200 ? "+" : ""} business${rows.length === 1 ? "" : "es"}`}</div>
      {res?.err && <div className="mt-2 rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13.5px] font-bold p-3">{res.err}</div>}

      <div className="card mt-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-3 border-b border-line bg-paper-2">
                <th className="py-2.5 pl-5 pr-2 font-bold">Business</th>
                <th className="py-2.5 px-2 font-bold">Roles</th>
                <th className="py-2.5 px-2 font-bold">Industries</th>
                <th className="py-2.5 px-2 font-bold text-right">Listings</th>
                <th className="py-2.5 px-2 font-bold text-right">Buyers</th>
                <th className="py-2.5 px-2 font-bold text-right">Suppliers</th>
                <th className="py-2.5 pl-2 pr-5 font-bold">Verification</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-line ${loading && res ? "opacity-60" : ""}`}>
              {!res ? <tr><td colSpan={7} className="p-5"><Skel className="h-40" /></td></tr>
                : !rows.length ? <tr><td colSpan={7}><EmptyState title="No businesses match" body="Try another role, industry or search." /></td></tr>
                : rows.map((b) => (
                  <tr key={b.id} className="hover:bg-paper-2 align-top">
                    <td className="py-3 pl-5 pr-2 max-w-[240px]">
                      <Link href={`/admin/users/${b.id}`} className="font-extrabold text-ink hover:text-[color:var(--accent)]">{b.businessName || b.name || "Unnamed"}</Link>
                      <div className="text-[12px] text-ink-3 font-semibold">{[b.businessName && b.name ? b.name : null, b.city].filter(Boolean).join(" · ") || "No city"}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {(b.businessRoles ?? []).map((r) => <span key={r} className="h-6 px-2 rounded-full bg-paper-2 text-ink-2 text-[11.5px] font-bold inline-flex items-center whitespace-nowrap">{BUSINESS_ROLE_LABEL[r] ?? r}</span>)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(b.industries ?? []).map((s) => {
                          const i = ind(s);
                          return <span key={s} title={i?.name ?? s} className="h-6 pl-0.5 pr-2 rounded-full border border-line text-[11.5px] font-bold inline-flex items-center gap-1 whitespace-nowrap">{i && <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={20} />}{i?.name ?? s}</span>;
                        })}
                        {!b.industries?.length && <span className="text-ink-4">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{b.listings}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{b.buyers}</td>
                    <td className="py-3 px-2 text-right tabular-nums font-semibold">{b.suppliers}</td>
                    <td className="py-3 pl-2 pr-5"><StatusChip tone={VERIFY[b.verificationStatus]?.tone ?? "grey"}>{VERIFY[b.verificationStatus]?.label ?? b.verificationStatus.replace(/_/g, " ")}</StatusChip></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
