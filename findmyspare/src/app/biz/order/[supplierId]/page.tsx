"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi, type SupplierCatalog } from "@/lib/api/v3";
import { EmptyState, Field, Sheet, Skel, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, Segmented, Stepper, btnPrimary, num, useApi, useDebounced } from "@/components/biz/kit";

type Item = SupplierCatalog["products"][number];
/** Same rule as the server: tier price once qty reaches the tier's minimum, else your price. */
const unitFor = (p: Item, qty: number) => (p.tier && qty >= p.tier.minQty ? num(p.tier.price) : num(p.yourPrice));

export default function OrderStock() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const router = useRouter();
  const { reload: reloadBiz } = useBiz();
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim(), 300);
  const cat = useApi(supplierId ? `cat:${supplierId}:${dq}` : null, () => bizApi.supplierCatalog(supplierId, dq || undefined));
  // Remember every product we've seen so the cart survives a search.
  const [cart, setCart] = useState<Record<string, { item: Item; qty: number }>>({});
  const [terms, setTerms] = useState<"credit" | "advance" | null>(null);
  const [note, setNote] = useState("");
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);

  const setQty = (p: Item, qty: number) => {
    const next = { ...cart };
    if (qty <= 0) delete next[p.id];
    else next[p.id] = { item: p, qty: Math.max(p.moq, qty) };
    setCart(next);
  };

  const lines = Object.values(cart);
  const sub = lines.reduce((s, l) => s + unitFor(l.item, l.qty) * l.qty, 0);
  const gst = sub * 0.18;
  const total = sub + gst;
  const units = lines.reduce((s, l) => s + l.qty, 0);

  if (cat.error) return <Page><PageHead title="Order stock" back="/biz/network?tab=suppliers" /><ErrorCard message={cat.error} onRetry={cat.reload} />
    <p className="text-[13.5px] text-ink-3 font-semibold mt-3">You can order once the supplier accepts your connection. <Link href="/biz/network?tab=suppliers" className="text-[color:var(--accent)] font-extrabold">See my suppliers</Link></p></Page>;

  const data = cat.data;
  const payTerms = terms ?? (data && data.terms.creditDays > 0 ? "credit" : "advance");

  async function place() {
    setBusy(true);
    try {
      const { po } = await bizApi.createPo({ sellerId: supplierId, lines: lines.map((l) => ({ productId: l.item.id, quantity: l.qty })), paymentTerms: payTerms, note: note.trim() || undefined });
      toast.success(`${po.number} sent to ${data?.supplier.businessName ?? "supplier"}`);
      reloadBiz();
      router.push(`/biz/orders/${po.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't place the order"));
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHead
        title={data?.supplier.businessName ?? "Order stock"}
        sub={data ? [data.supplier.city, data.terms.creditDays ? `${data.terms.creditDays}-day credit${num(data.terms.creditLimit) ? ` · limit ${inr(data.terms.creditLimit)}` : ""}` : "Advance payment", data.terms.priceList ? `Your rates: ${data.terms.priceList}` : null].filter(Boolean).join(" · ") : "Loading catalog…"}
        back="/biz/network?tab=suppliers"
      />
      <label className="h-12 rounded-[14px] bg-paper-2 border border-transparent focus-within:border-[color:var(--accent)] focus-within:bg-paper flex items-center px-3.5 gap-2.5 text-ink-3 mb-3">
        <BI.search size={18} />
        <input className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-medium text-ink placeholder:text-ink-4" placeholder="Search this supplier: part, brand, part no." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search catalog" />
      </label>

      {!data ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skel key={i} className="h-20" />)}</div>
      ) : !data.products.length ? (
        <EmptyState title={dq ? `No match for “${dq}”` : "No items listed yet"} body={dq ? "Try a shorter word or the part number." : "This supplier hasn't listed stock on FindMySpare yet."} />
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden mb-28">
          {data.products.map((p) => {
            const inCart = cart[p.id];
            const qty = inCart?.qty ?? 0;
            const unit = unitFor(p, Math.max(qty, 1));
            const off = num(p.listPrice) > unit;
            return (
              <li key={p.id} className="px-4 py-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-extrabold leading-snug">{p.name}</div>
                  <div className="text-[12.5px] text-ink-3 font-semibold truncate">{[p.brand, p.partNumber, p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"].filter(Boolean).join(" · ")}</div>
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    <span className="text-[16px] font-extrabold text-[color:var(--accent)] tabular-nums">{inr(unit, { decimals: unit % 1 !== 0 })}</span>
                    {off && <span className="strike text-[12.5px] tabular-nums">{inr(p.listPrice)}</span>}
                    {p.tier && p.tier.minQty > 1 && (
                      <span className={clsx("text-[12px] font-bold px-2 h-[22px] inline-flex items-center rounded-full", qty >= p.tier.minQty ? "bg-[color:var(--success-wash)] text-[color:var(--success)]" : "bg-[color:var(--amber-wash)] text-[color:var(--amber)]")}>
                        {inr(p.tier.price)} at {p.tier.minQty}+
                      </span>
                    )}
                    {p.moq > 1 && <span className="text-[12px] font-bold text-ink-3">Min {p.moq}</span>}
                  </div>
                  {qty > p.stockQuantity && <div className="text-[12px] font-bold text-[color:var(--amber)] mt-1">Only {p.stockQuantity} in stock now; supplier may ship in parts.</div>}
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  {qty ? (
                    <Stepper value={qty} label={p.name} min={0} step={1} onChange={(v) => setQty(p, v < p.moq ? 0 : v)} />
                  ) : (
                    <button onClick={() => setQty(p, p.moq)} className="h-9 px-5 rounded-[10px] border border-[color:var(--accent)] text-[color:var(--accent)] text-[13.5px] font-extrabold hover:bg-[color:var(--accent-wash)]">ADD</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[72px] md:bottom-6 md:left-[248px] z-[80] px-4 no-print">
          <button onClick={() => setReview(true)} className="max-w-[640px] mx-auto w-full h-14 rounded-[16px] bg-[color:var(--accent)] text-white flex items-center justify-between px-5 shadow-[var(--shadow-lifted)] fms-press">
            <span className="text-left">
              <span className="block text-[14px] font-extrabold">{lines.length} item{lines.length > 1 ? "s" : ""} · {units} units</span>
              <span className="block text-[11.5px] font-semibold text-white/80">incl. 18% GST</span>
            </span>
            <span className="text-[16px] font-extrabold flex items-center gap-1 tabular-nums">{inr(total)} <BI.chev size={18} /></span>
          </button>
        </div>
      )}

      <Sheet open={review} onClose={() => setReview(false)} title="Review purchase order">
        <ul className="divide-y divide-line mb-3">
          {lines.map(({ item, qty }) => (
            <li key={item.id} className="py-2.5 flex items-center gap-3">
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-extrabold truncate">{item.name}</span>
                <span className="block text-[12.5px] text-ink-3 font-semibold">{qty} × {inr(unitFor(item, qty), { decimals: true })}</span>
              </span>
              <span className="text-[14px] font-extrabold tabular-nums">{inr(unitFor(item, qty) * qty, { decimals: true })}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 text-[14px] mb-4">
          <div className="flex justify-between text-ink-3 font-semibold"><dt>Subtotal</dt><dd className="tabular-nums">{inr(sub, { decimals: true })}</dd></div>
          <div className="flex justify-between text-ink-3 font-semibold"><dt>GST 18%</dt><dd className="tabular-nums">{inr(gst, { decimals: true })}</dd></div>
          <div className="flex justify-between text-[18px] font-extrabold pt-1"><dt>Total</dt><dd className="tabular-nums">{inr(total, { decimals: true })}</dd></div>
        </dl>
        <div className="space-y-3">
          <div>
            <div className="text-[12.5px] font-bold text-ink-2 mb-1.5">Payment</div>
            <Segmented label="Payment terms" value={payTerms} onChange={setTerms} items={[{ value: "credit", label: data?.terms.creditDays ? `Credit · ${data.terms.creditDays} days` : "Credit" }, { value: "advance", label: "Advance" }]} />
            {payTerms === "credit" && !data?.terms.creditDays && <p className="text-[12.5px] text-[color:var(--amber)] font-semibold mt-1.5">This supplier hasn&apos;t given you credit days yet; payment will be due on dispatch.</p>}
          </div>
          <Field label="Note to supplier (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Send by Saturday, transport via VRL" maxLength={500} /></Field>
          <button onClick={place} disabled={busy} className={clsx(btnPrimary, "w-full")}>{busy ? "Placing…" : `Place order · ${inr(total)}`}</button>
        </div>
      </Sheet>
    </Page>
  );
}
