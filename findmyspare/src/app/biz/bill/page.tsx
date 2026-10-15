"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { inventoryApi } from "@/lib/api";
import { inr } from "@/lib/api/v2";
import { bizApi, type SalesBill } from "@/lib/api/v3";
import { Field, Sheet, Skel, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, Segmented, SellerOnly, Stepper, btnGhost, btnPrimary, btnSmall, num, useApi, useDebounced } from "@/components/biz/kit";

type Line = { key: string; productId?: string; name: string; quantity: number; unitPrice: string; gstRate: number; max?: number };
const GST = [0, 5, 12, 18, 28];
const MODES: { value: SalesBill["paymentMode"]; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "credit", label: "Udhaar" },
];

export default function BillPage() {
  const { isSeller, reload } = useBiz();
  const router = useRouter();
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim(), 250);
  const inv = useApi(isSeller ? `inv:${dq}` : null, () => inventoryApi.list({ search: dq || undefined, limit: 50, sort: "stock_desc" }));
  const [lines, setLines] = useState<Line[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [mode, setMode] = useState<SalesBill["paymentMode"]>("cash");
  const [custom, setCustom] = useState(false);
  const [cl, setCl] = useState({ name: "", price: "", qty: 1 });
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    let sub = 0, tax = 0;
    for (const l of lines) { const v = l.quantity * num(l.unitPrice); sub += v; tax += (v * l.gstRate) / 100; }
    return { sub, tax, total: sub + tax, items: lines.reduce((n, l) => n + l.quantity, 0) };
  }, [lines]);

  if (!isSeller) return <Page><PageHead title="Counter bill" back="/biz" /><SellerOnly what="Counter billing" /></Page>;

  const inBill = (id: string) => lines.find((l) => l.productId === id);
  const add = (p: { id: string; name: string; price: string; stockQuantity: number }) => {
    const ex = inBill(p.id);
    if (ex) { setLines(lines.map((l) => (l === ex ? { ...l, quantity: Math.min(p.stockQuantity, l.quantity + 1) } : l))); return; }
    setLines([...lines, { key: p.id, productId: p.id, name: p.name, quantity: 1, unitPrice: String(num(p.price)), gstRate: 18, max: p.stockQuantity }]);
  };
  const patch = (key: string, v: Partial<Line>) => setLines(lines.map((l) => (l.key === key ? { ...l, ...v } : l)));
  const remove = (key: string) => setLines(lines.filter((l) => l.key !== key));

  const valid = lines.length > 0 && lines.every((l) => l.quantity > 0 && num(l.unitPrice) >= 0 && l.name.trim()) && (mode !== "credit" || customerName.trim() || customerPhone.trim());

  async function save() {
    setBusy(true);
    try {
      const { bill } = await bizApi.createBill({
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        paymentMode: mode,
        lines: lines.map((l) => ({ productId: l.productId, name: l.name.trim(), quantity: l.quantity, unitPrice: num(l.unitPrice), gstRate: l.gstRate })),
      });
      toast.success(`Bill ${bill.number} saved${mode === "credit" ? " · added to khata" : ""}`);
      reload();
      router.push(`/biz/bills/${bill.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't save the bill"));
      setBusy(false);
    }
  }

  return (
    <Page wide>
      <PageHead title="New bill" sub="Tap items to add. Stock updates when you save." action={<Link href="/biz/bills" className={clsx(btnSmall, "bg-paper-2 text-ink")}>All bills</Link>} />

      <div className="grid lg:grid-cols-[1fr_420px] gap-5 items-start">
        {/* Item picker */}
        <section className="min-w-0">
          <label className="h-12 rounded-[14px] bg-paper-2 border border-transparent focus-within:border-[color:var(--accent)] focus-within:bg-paper flex items-center px-3.5 gap-2.5 text-ink-3 mb-3">
            <BI.search size={18} />
            <input className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-medium text-ink placeholder:text-ink-4" placeholder="Search your stock: name or part no." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search your stock" />
          </label>
          {inv.error ? <ErrorCard message={inv.error} onRetry={inv.reload} /> : !inv.data ? (
            <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skel key={i} className="h-16" />)}</div>
          ) : !inv.data.items.length ? (
            <div className="card-flat p-5 text-center">
              <div className="text-[15px] font-extrabold">{dq ? `Nothing in stock matches “${dq}”` : "No items in your stock yet"}</div>
              <p className="text-[13px] text-ink-3 font-semibold mt-1">Add it as a custom line below, or add listings to bill faster next time.</p>
              <div className="mt-3 flex justify-center gap-2 flex-wrap">
                <button onClick={() => { setCl({ name: dq, price: "", qty: 1 }); setCustom(true); }} className={clsx(btnSmall, "bg-[color:var(--accent)] text-white")}>+ Custom line</button>
                <Link href="/biz/import" className={clsx(btnSmall, "bg-paper-2 text-ink")}>Import catalog</Link>
              </div>
            </div>
          ) : (
            <ul className="card-flat divide-y divide-line overflow-hidden">
              {inv.data.items.map((p) => {
                const line = inBill(p.id);
                const out = p.stockQuantity <= 0;
                return (
                  <li key={p.id}>
                    <button disabled={out || (line && line.quantity >= p.stockQuantity)} onClick={() => add(p)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-paper-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-extrabold truncate">{p.name}</span>
                        <span className="block text-[12.5px] text-ink-3 font-semibold truncate">
                          {[p.partNumber, out ? "Out of stock" : `${p.stockQuantity} in stock`, p.status === "draft" ? "Draft" : null].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="text-[15px] font-extrabold text-[color:var(--accent)] tabular-nums">{inr(p.price)}</span>
                      <span className={clsx("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", line ? "bg-[color:var(--accent)] text-white" : "bg-[color:var(--accent-wash)] text-[color:var(--accent)]")}>
                        {line ? <span className="text-[13px] font-extrabold">{line.quantity}</span> : <BI.plus size={18} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button onClick={() => { setCl({ name: "", price: "", qty: 1 }); setCustom(true); }} className="mt-3 text-[14px] font-extrabold text-[color:var(--accent)] inline-flex items-center gap-1"><BI.plus size={16} /> Add a custom line (labour, loose item)</button>
        </section>

        {/* Bill */}
        <section className="card p-4 md:p-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-extrabold tracking-tight">Bill</h2>
            {lines.length > 0 && <button onClick={() => setLines([])} className="text-[13px] font-bold text-ink-3 hover:text-[color:var(--danger)]">Clear</button>}
          </div>
          {!lines.length ? (
            <div className="rounded-[14px] bg-paper-2 p-5 text-center text-[13.5px] text-ink-3 font-semibold">No items yet. Tap an item from your stock.</div>
          ) : (
            <ul className="space-y-3">
              {lines.map((l) => (
                <li key={l.key} className="pb-3 border-b border-line last:border-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0 text-[14px] font-extrabold leading-snug">{l.name}</div>
                    <button onClick={() => remove(l.key)} aria-label={`Remove ${l.name}`} className="text-ink-4 hover:text-[color:var(--danger)] p-0.5"><BI.trash size={17} /></button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Stepper value={l.quantity} min={1} max={l.max} label={l.name} onChange={(v) => patch(l.key, { quantity: Math.max(1, v) })} />
                    <label className="flex items-center h-9 rounded-[10px] bg-paper-2 px-2.5 w-[104px]">
                      <span className="text-ink-3 text-[13px] font-bold">₹</span>
                      <input aria-label={`Rate for ${l.name}`} inputMode="decimal" className="w-full bg-transparent outline-none text-[14px] font-extrabold pl-1 tabular-nums" value={l.unitPrice} onChange={(e) => patch(l.key, { unitPrice: e.target.value.replace(/[^\d.]/g, "") })} />
                    </label>
                    <select aria-label={`GST for ${l.name}`} value={l.gstRate} onChange={(e) => patch(l.key, { gstRate: Number(e.target.value) })} className="h-9 rounded-[10px] bg-paper-2 px-2 text-[13px] font-bold outline-none">
                      {GST.map((g) => <option key={g} value={g}>GST {g}%</option>)}
                    </select>
                    <span className="ml-auto text-[14px] font-extrabold tabular-nums">{inr(l.quantity * num(l.unitPrice) * (1 + l.gstRate / 100), { decimals: true })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Field label="Customer name"><input className={inputCls} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" /></Field>
            <Field label="Phone"><input className={inputCls} inputMode="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="98xxxxxxxx" /></Field>
          </div>
          <div className="mt-3">
            <div className="text-[12.5px] font-bold text-ink-2 mb-1.5">Payment</div>
            <Segmented label="Payment mode" value={mode} onChange={setMode} items={MODES} />
            {mode === "credit" && <p className={clsx("text-[12.5px] font-semibold mt-1.5", customerName.trim() || customerPhone.trim() ? "text-ink-3" : "text-[color:var(--danger)]")}>Udhaar goes to the khata. Add the customer&apos;s name or phone.</p>}
          </div>

          <dl className="mt-4 space-y-1.5 text-[14px]">
            <div className="flex justify-between text-ink-3 font-semibold"><dt>Items ({totals.items})</dt><dd className="tabular-nums">{inr(totals.sub, { decimals: true })}</dd></div>
            <div className="flex justify-between text-ink-3 font-semibold"><dt>GST</dt><dd className="tabular-nums">{inr(totals.tax, { decimals: true })}</dd></div>
            <div className="flex justify-between text-[19px] font-extrabold pt-1.5 border-t border-line"><dt>Total</dt><dd className="tabular-nums">{inr(totals.total, { decimals: true })}</dd></div>
          </dl>
          <button onClick={save} disabled={!valid || busy} className={clsx(btnPrimary, "w-full mt-4")}>
            {busy ? "Saving…" : lines.length ? `Save bill · ${inr(totals.total)}` : "Add items to bill"}
          </button>
        </section>
      </div>

      <Sheet open={custom} onClose={() => setCustom(false)} title="Custom line">
        <div className="space-y-3">
          <Field label="Item or service"><input autoFocus className={inputCls} value={cl.name} onChange={(e) => setCl({ ...cl, name: e.target.value })} placeholder="Fitting charges, loose bolts…" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rate before GST (₹)"><input className={inputCls} inputMode="decimal" value={cl.price} onChange={(e) => setCl({ ...cl, price: e.target.value.replace(/[^\d.]/g, "") })} /></Field>
            <Field label="Quantity"><input className={inputCls} inputMode="numeric" value={cl.qty} onChange={(e) => setCl({ ...cl, qty: Math.max(1, parseInt(e.target.value.replace(/\D/g, "") || "1", 10)) })} /></Field>
          </div>
          <div className="flex gap-2 pt-1">
            <button className={clsx(btnGhost, "flex-1")} onClick={() => setCustom(false)}>Cancel</button>
            <button
              className={clsx(btnPrimary, "flex-1")}
              disabled={!cl.name.trim() || cl.price === ""}
              onClick={() => { setLines([...lines, { key: `c${Date.now()}`, name: cl.name.trim(), quantity: cl.qty, unitPrice: cl.price, gstRate: 18 }]); setCustom(false); }}
            >Add to bill</button>
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
