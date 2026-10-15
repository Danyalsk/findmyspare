"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi, taxonomyApi, BUSINESS_ROLE_LABEL, SELLER_ROLES, type DirectoryBiz, type TradeLink } from "@/lib/api/v3";
import { EmptyState, Field, Sheet, Skel, StatusChip, inputCls } from "@/components/shop/ui";
import { NetIcon } from "@/components/net/NetIcon";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, Tabs, btnPrimary, btnSmall, num, useApi, useDebounced } from "@/components/biz/kit";

type Tab = "suppliers" | "buyers" | "find";

const roleLine = (roles: string[] | null | undefined) => (roles ?? []).slice(0, 2).map((r) => BUSINESS_ROLE_LABEL[r] ?? r).join(", ");

function Initial({ name }: { name: string | null }) {
  return <span className="w-11 h-11 rounded-[14px] bg-paper-2 text-ink-2 flex items-center justify-center text-[16px] font-extrabold flex-shrink-0">{(name ?? "?").slice(0, 1).toUpperCase()}</span>;
}

function TermsSheet({ link, onClose, onSaved }: { link: TradeLink; onClose: () => void; onSaved: () => void }) {
  const lists = useApi("price-lists", () => bizApi.priceLists());
  const [f, setF] = useState({ creditLimit: String(num(link.credit_limit)), creditDays: String(link.credit_days), priceListId: link.price_list_id ?? "" });
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      await bizApi.updateLink(link.id, { creditLimit: num(f.creditLimit), creditDays: Math.min(180, parseInt(f.creditDays || "0", 10)), priceListId: f.priceListId });
      toast.success(`Terms saved for ${link.other_name}`);
      onSaved();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't save terms"));
      setBusy(false);
    }
  }
  return (
    <Sheet open onClose={onClose} title={`Terms for ${link.other_name ?? "buyer"}`}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Credit limit (₹)" hint="0 = no limit"><input className={inputCls} inputMode="numeric" value={f.creditLimit} onChange={(e) => setF({ ...f, creditLimit: e.target.value.replace(/[^\d.]/g, "") })} /></Field>
          <Field label="Credit days" hint="0 = advance only"><input className={inputCls} inputMode="numeric" value={f.creditDays} onChange={(e) => setF({ ...f, creditDays: e.target.value.replace(/\D/g, "") })} /></Field>
        </div>
        <Field label="Price list" hint={lists.data && !lists.data.priceLists.length ? "No price lists yet. Create one to give this buyer special rates." : undefined}>
          <select className={inputCls} value={f.priceListId} onChange={(e) => setF({ ...f, priceListId: e.target.value })}>
            <option value="">Standard listing price</option>
            {lists.data?.priceLists.map((l) => <option key={l.id} value={l.id}>{l.name}{num(l.discountPct) ? ` (−${num(l.discountPct)}%)` : ""}</option>)}
          </select>
        </Field>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Link href="/biz/price-lists" className="text-[13.5px] font-extrabold text-[color:var(--accent)]">Manage price lists</Link>
          <button onClick={save} disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Save terms"}</button>
        </div>
      </div>
    </Sheet>
  );
}

function LinkRow({ l, myId, onDecide, onTerms, busy }: { l: TradeLink; myId: string; onDecide: (l: TradeLink, accept: boolean) => void; onTerms: (l: TradeLink) => void; busy: boolean }) {
  const incoming = l.status === "pending" && l.requested_by !== myId;
  const bal = num(l.balance);
  return (
    <li className="px-4 py-3.5 flex items-center gap-3">
      <Initial name={l.other_name} />
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-extrabold truncate">{l.other_name}</div>
        <div className="text-[12.5px] text-ink-3 font-semibold truncate">{[l.other_city, roleLine(l.other_roles)].filter(Boolean).join(" · ")}</div>
        {l.status === "active" && (
          <div className="text-[12.5px] font-semibold mt-0.5 flex flex-wrap gap-x-2">
            {bal !== 0 && <span className={clsx("font-extrabold", l.direction === "supplier" ? "text-ink" : "text-[color:var(--amber)]")}>{l.direction === "supplier" ? `You owe ${inr(bal)}` : `Owes you ${inr(bal)}`}</span>}
            <span className="text-ink-3">{l.credit_days ? `${l.credit_days}-day credit${num(l.credit_limit) ? ` up to ${inr(l.credit_limit)}` : ""}` : "Advance"}</span>
            {l.price_list_name && <span className="text-ink-3">· {l.price_list_name}</span>}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {incoming ? (
          <>
            <button disabled={busy} onClick={() => onDecide(l, false)} className={clsx(btnSmall, "bg-paper-2 text-ink")}>Decline</button>
            <button disabled={busy} onClick={() => onDecide(l, true)} className={clsx(btnSmall, "bg-[color:var(--accent)] text-white")}>Accept</button>
          </>
        ) : l.status === "pending" ? (
          <StatusChip tone="amber">Request sent</StatusChip>
        ) : l.status === "blocked" ? (
          <StatusChip tone="grey">Declined</StatusChip>
        ) : l.direction === "supplier" ? (
          <Link href={`/biz/order/${l.other_id}`} className={clsx(btnSmall, "bg-[color:var(--accent)] text-white")}>Order</Link>
        ) : (
          <button onClick={() => onTerms(l)} className={clsx(btnSmall, "bg-paper-2 text-ink")}>Terms</button>
        )}
      </div>
    </li>
  );
}

function Directory({ isSeller, onChanged }: { isSeller: boolean; onChanged: () => void }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const dq = useDebounced(q.trim(), 300);
  const dir = useApi(`dir:${role}:${industry}:${dq}`, () => bizApi.directory({ role: role || undefined, industry: industry || undefined, q: dq || undefined }));
  const tax = useApi("taxonomy", () => taxonomyApi.get());
  const [busyId, setBusyId] = useState<string | null>(null);

  async function connect(b: DirectoryBiz, as: "supplier" | "buyer") {
    setBusyId(b.id + as);
    try {
      await bizApi.connect(as === "supplier" ? { supplierId: b.id } : { buyerId: b.id });
      toast.success(`Request sent to ${b.businessName ?? b.name}`);
      dir.reload(); onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't send the request"));
    } finally {
      setBusyId(null);
    }
  }

  const status = (s: string | null) => (s === "active" ? "Connected" : s === "pending" ? "Requested" : s === "blocked" ? "Declined" : null);

  return (
    <div>
      <label className="h-12 rounded-[14px] bg-paper-2 border border-transparent focus-within:border-[color:var(--accent)] focus-within:bg-paper flex items-center px-3.5 gap-2.5 text-ink-3 mb-3">
        <BI.search size={18} />
        <input className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-medium text-ink placeholder:text-ink-4" placeholder="Business name or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search businesses" />
      </label>
      <div className="flex gap-2 overflow-x-auto scroll-hidden pb-1 mb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <button className="chip" data-on={!role} onClick={() => setRole("")}>All trades</button>
        {SELLER_ROLES.map((r) => <button key={r} className="chip" data-on={role === r} onClick={() => setRole(role === r ? "" : r)}>{BUSINESS_ROLE_LABEL[r]}</button>)}
      </div>
      <div className="flex gap-2 overflow-x-auto scroll-hidden pb-1 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <button className="chip" data-on={!industry} onClick={() => setIndustry("")}>All industries</button>
        {tax.data?.industries.map((i) => (
          <button key={i.slug} className="chip" data-on={industry === i.slug} onClick={() => setIndustry(industry === i.slug ? "" : i.slug)}>
            <NetIcon name={i.icon} size={16} /> {i.name}
          </button>
        ))}
      </div>
      {dir.error ? <ErrorCard message={dir.error} onRetry={dir.reload} /> : !dir.data ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skel key={i} className="h-16" />)}</div>
      ) : !dir.data.businesses.length ? (
        <EmptyState title="No businesses match" body="Try another trade or industry, or clear the search." />
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {dir.data.businesses.map((b) => {
            const asBuyer = status(b.linkAsBuyer);
            const asSupplier = status(b.linkAsSupplier);
            return (
              <li key={b.id} className="px-4 py-3.5 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <Initial name={b.businessName ?? b.name} />
                <div className="flex-1 min-w-0">
                  <Link href={`/s/${b.id}`} className="text-[14.5px] font-extrabold truncate block hover:text-[color:var(--accent)]">{b.businessName ?? b.name}</Link>
                  <div className="text-[12.5px] text-ink-3 font-semibold truncate">{[b.city, roleLine(b.businessRoles), `${b.listings} listing${b.listings === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-14 sm:ml-0">
                  {asBuyer ? <StatusChip tone={b.linkAsBuyer === "active" ? "green" : "grey"}>{b.linkAsBuyer === "active" ? "Your supplier" : `Supplier · ${asBuyer}`}</StatusChip> : (
                    <button disabled={busyId === b.id + "supplier"} onClick={() => connect(b, "supplier")} className={clsx(btnSmall, "bg-[color:var(--accent)] text-white")}>Buy from them</button>
                  )}
                  {isSeller && (asSupplier ? <StatusChip tone={b.linkAsSupplier === "active" ? "green" : "grey"}>{b.linkAsSupplier === "active" ? "Your buyer" : `Buyer · ${asSupplier}`}</StatusChip> : (
                    <button disabled={busyId === b.id + "buyer"} onClick={() => connect(b, "buyer")} className={clsx(btnSmall, "bg-paper-2 text-ink")}>Add as buyer</button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NetworkInner() {
  const { me, isSeller, reload: reloadBiz } = useBiz();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const links = useApi("links", () => bizApi.links());
  const [terms, setTerms] = useState<TradeLink | null>(null);
  const [busy, setBusy] = useState(false);
  const want = params.get("tab") as Tab | null;
  const tab: Tab = want === "find" || want === "suppliers" || (want === "buyers" && isSeller) ? want : "suppliers";
  const setTab = (t: Tab) => router.replace(`${path}?tab=${t}`, { scroll: false });

  const all = links.data?.links ?? [];
  const suppliers = all.filter((l) => l.direction === "supplier");
  const buyers = all.filter((l) => l.direction === "buyer");
  const incoming = (ls: TradeLink[]) => ls.filter((l) => l.status === "pending" && l.requested_by !== me.id).length;
  const sortLinks = (ls: TradeLink[]) => [...ls].sort((a, b) => Number(b.status === "pending" && b.requested_by !== me.id) - Number(a.status === "pending" && a.requested_by !== me.id));

  async function decide(l: TradeLink, accept: boolean) {
    setBusy(true);
    try {
      await bizApi.decide(l.id, accept);
      toast.success(accept ? `Connected with ${l.other_name}` : "Request declined");
      links.reload(); reloadBiz();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't update the request"));
    } finally {
      setBusy(false);
    }
  }

  const list = tab === "suppliers" ? suppliers : buyers;

  return (
    <Page>
      <PageHead title="Network" sub="Your suppliers and buyers, with credit terms and balances" />
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { value: "suppliers", label: "My suppliers", count: incoming(suppliers) },
          ...(isSeller ? [{ value: "buyers" as Tab, label: "My buyers", count: incoming(buyers) }] : []),
          { value: "find", label: "Find businesses" },
        ]}
      />
      {tab === "find" ? (
        <Directory isSeller={isSeller} onChanged={links.reload} />
      ) : links.error ? <ErrorCard message={links.error} onRetry={links.reload} /> : !links.data ? (
        <div className="space-y-2">{Array.from({ length: 4 }, (_, i) => <Skel key={i} className="h-16" />)}</div>
      ) : !list.length ? (
        tab === "suppliers" ? (
          <EmptyState title="No suppliers yet" body="Find distributors and wholesalers in your industry, connect once, then order at your trade price." action={<button onClick={() => setTab("find")} className={btnPrimary}>Find suppliers</button>} />
        ) : (
          <EmptyState title="No buyers yet" body="Add the shops and workshops you supply. Set credit days and a price list for each." action={<button onClick={() => setTab("find")} className={btnPrimary}>Add buyers</button>} />
        )
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {sortLinks(list).map((l) => <LinkRow key={l.id} l={l} myId={me.id} busy={busy} onDecide={decide} onTerms={setTerms} />)}
        </ul>
      )}
      {terms && <TermsSheet link={terms} onClose={() => setTerms(null)} onSaved={() => { setTerms(null); links.reload(); }} />}
    </Page>
  );
}

export default function NetworkPage() {
  return <Suspense><NetworkInner /></Suspense>;
}
