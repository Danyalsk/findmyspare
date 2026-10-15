"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { inventoryApi } from "@/lib/api";
import { inr } from "@/lib/api/v2";
import { bizApi, type PriceList } from "@/lib/api/v3";
import { EmptyState, Field, Sheet, Skel, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, SellerOnly, btnPrimary, btnSmall, num, useApi, useDebounced } from "@/components/biz/kit";

function ItemSheet({ list, onClose, onDone }: { list: PriceList; onClose: () => void; onDone: () => void }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim(), 250);
  const inv = useApi(`inv:${dq}`, () => inventoryApi.list({ search: dq || undefined, limit: 20 }));
  const [pick, setPick] = useState<{ id: string; name: string; price: string } | null>(null);
  const [price, setPrice] = useState("");
  const [minQty, setMinQty] = useState("1");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!pick) return;
    setBusy(true);
    try {
      await bizApi.setPriceListItem(list.id, pick.id, num(price), Math.max(1, parseInt(minQty || "1", 10)));
      toast.success(`${pick.name}: ${inr(price)}${parseInt(minQty, 10) > 1 ? ` at ${minQty}+` : ""} in ${list.name}`);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't save the price"));
      setBusy(false);
    }
  }

  return (
    <Sheet open onClose={onClose} title={`Special price · ${list.name}`}>
      {!pick ? (
        <div>
          <label className="h-12 rounded-[14px] bg-paper-2 border border-transparent focus-within:border-[color:var(--accent)] focus-within:bg-paper flex items-center px-3.5 gap-2.5 text-ink-3 mb-3">
            <BI.search size={18} />
            <input autoFocus className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-medium text-ink placeholder:text-ink-4" placeholder="Find one of your items" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find item" />
          </label>
          {inv.error ? <ErrorCard message={inv.error} onRetry={inv.reload} /> : !inv.data ? <Skel className="h-40" /> : !inv.data.items.length ? (
            <p className="text-[14px] text-ink-3 font-semibold text-center py-6">No items match.</p>
          ) : (
            <ul className="divide-y divide-line max-h-[50dvh] overflow-y-auto">
              {inv.data.items.map((p) => (
                <li key={p.id}>
                  <button onClick={() => { setPick(p); setPrice(String(num(p.price))); }} className="w-full text-left py-3 flex items-center gap-3 hover:bg-paper-2 px-1">
                    <span className="flex-1 min-w-0"><span className="block text-[14px] font-extrabold truncate">{p.name}</span><span className="block text-[12.5px] text-ink-3 font-semibold">{p.partNumber ?? "No part no."}</span></span>
                    <span className="text-[14px] font-extrabold tabular-nums">{inr(p.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-[14px] bg-paper-2 p-3 flex items-center gap-3">
            <span className="flex-1 min-w-0"><span className="block text-[14px] font-extrabold truncate">{pick.name}</span><span className="block text-[12.5px] text-ink-3 font-semibold">Listing price {inr(pick.price)}</span></span>
            <button onClick={() => setPick(null)} className="text-[13px] font-extrabold text-[color:var(--accent)]">Change</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Special price (₹)"><input className={inputCls} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} /></Field>
            <Field label="From quantity" hint="1 = always"><input className={inputCls} inputMode="numeric" value={minQty} onChange={(e) => setMinQty(e.target.value.replace(/\D/g, ""))} /></Field>
          </div>
          <button onClick={save} disabled={busy || price === ""} className={clsx(btnPrimary, "w-full")}>{busy ? "Saving…" : "Save price"}</button>
        </div>
      )}
    </Sheet>
  );
}

export default function PriceListsPage() {
  const { isSeller } = useBiz();
  const r = useApi(isSeller ? "price-lists" : null, () => bizApi.priceLists());
  const links = useApi(isSeller ? "links" : null, () => bizApi.links());
  const [name, setName] = useState("");
  const [disc, setDisc] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState<PriceList | null>(null);

  if (!isSeller) return <Page><PageHead title="Price lists" back="/biz/more" /><SellerOnly what="Price lists" /></Page>;

  async function create() {
    setBusy(true);
    try {
      await bizApi.createPriceList(name.trim(), num(disc));
      toast.success(`Price list “${name.trim()}” created`);
      setName(""); setDisc("");
      r.reload();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't create the list"));
    } finally {
      setBusy(false);
    }
  }

  const usedBy = (id: string) => (links.data?.links ?? []).filter((l) => l.price_list_id === id && l.direction === "buyer");

  return (
    <Page>
      <PageHead title="Price lists" sub="Different rates for different buyers: dealers, workshops, bulk" back="/biz/more" />

      <section className="card p-4 md:p-5 mb-5">
        <h2 className="text-[15px] font-extrabold mb-3">New price list</h2>
        <div className="grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_140px_auto] gap-2.5 items-end">
          <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dealer rate" maxLength={80} /></Field>
          <Field label="Discount %"><input className={inputCls} inputMode="decimal" value={disc} onChange={(e) => setDisc(e.target.value.replace(/[^\d.]/g, ""))} placeholder="8" /></Field>
          <button onClick={create} disabled={busy || name.trim().length < 2 || num(disc) > 90} className={clsx(btnPrimary, "col-span-2 sm:col-span-1")}>{busy ? "Creating…" : "Create"}</button>
        </div>
        <p className="text-[12.5px] text-ink-3 font-semibold mt-2">The discount applies to every item. Add special prices below for items that need a different rate or a bulk price.</p>
      </section>

      {r.error ? <ErrorCard message={r.error} onRetry={r.reload} /> : !r.data ? <Skel className="h-40" /> : !r.data.priceLists.length ? (
        <EmptyState title="No price lists yet" body="Create one above, then assign it to a buyer from Network › My buyers › Terms." />
      ) : (
        <div className="space-y-3">
          {r.data.priceLists.map((l) => {
            const buyers = usedBy(l.id);
            return (
              <section key={l.id} className="card-flat overflow-hidden">
                <div className="px-4 py-3.5 flex items-center gap-3 border-b border-line">
                  <span className="w-10 h-10 rounded-[12px] bg-[color:var(--accent-wash)] text-[color:var(--accent)] flex items-center justify-center flex-shrink-0"><BI.tag size={20} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-extrabold truncate">{l.name}</span>
                    <span className="block text-[12.5px] text-ink-3 font-semibold truncate">
                      {num(l.discountPct) ? `${num(l.discountPct)}% off listing price` : "Listing price"} · {buyers.length ? `Used by ${buyers.map((b) => b.other_name).join(", ")}` : <Link href="/biz/network?tab=buyers" className="text-[color:var(--accent)] font-bold">Assign to a buyer</Link>}
                    </span>
                  </span>
                  <button onClick={() => setAdding(l)} className={clsx(btnSmall, "bg-paper-2 text-ink")}><BI.plus size={15} /> Item</button>
                </div>
                {l.items.length ? (
                  <ul className="divide-y divide-line">
                    {l.items.map((it) => (
                      <li key={it.id} className="px-4 py-2.5 flex items-center gap-3 text-[13.5px]">
                        <span className="flex-1 min-w-0 font-bold truncate">{it.name}</span>
                        <span className="strike tabular-nums">{inr(it.listPrice)}</span>
                        <span className="font-extrabold text-[color:var(--accent)] tabular-nums">{inr(it.price)}</span>
                        <span className="text-ink-3 font-semibold w-14 text-right">{it.minQty > 1 ? `${it.minQty}+` : "any qty"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-[13px] text-ink-3 font-semibold">No special prices. Every item gets the list discount.</div>
                )}
              </section>
            );
          })}
        </div>
      )}
      {adding && <ItemSheet list={adding} onClose={() => setAdding(null)} onDone={() => { setAdding(null); r.reload(); }} />}
    </Page>
  );
}
