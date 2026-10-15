"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { addressesApi } from "@/lib/api";
import { checkoutApi, inr, type CheckoutPreview } from "@/lib/api/v2";
import type { Address } from "@/lib/types";
import { PartThumb, PartTypeBadge, EmptyState, Sheet, Field, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const blank = { label: "Home", line1: "", city: "", state: "", postalCode: "", phone: "" };

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.updateQty);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [previewErr, setPreviewErr] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addrOpen, setAddrOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const lines = useMemo(() => items.map((i) => ({ productId: i.productId ?? i.id, quantity: i.quantity })), [items]);

  useEffect(() => {
    addressesApi.list().then((r) => {
      setAddresses(r.addresses);
      setAddressId((r.addresses.find((a) => a.isDefault) ?? r.addresses[0])?.id ?? null);
    }).catch(() => {});
  }, []);

  // Server is the source of truth for prices, stock and delivery fees.
  useEffect(() => {
    if (!lines.length) { setPreview(null); return; }
    setPreviewErr("");
    checkoutApi.preview(lines).then(setPreview).catch((e) => setPreviewErr(getErrorMessage(e, "Couldn't price your cart")));
  }, [lines]);

  async function saveAddress() {
    try {
      const { address } = await addressesApi.create({ ...form, isDefault: addresses.length === 0 });
      setAddresses((a) => [...a, address]);
      setAddressId(address.id);
      setAddrOpen(false);
      setForm(blank);
    } catch (e) { toast.error(getErrorMessage(e, "Couldn't save address")); }
  }

  async function proceed() {
    if (!addressId) { setAddrOpen(true); return; }
    setBusy(true);
    try {
      const { checkoutId } = await checkoutApi.create(lines, addressId);
      router.push(`/pay/${checkoutId}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Checkout failed"));
      setBusy(false);
    }
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        body="Add parts from verified sellers, or post a request and let sellers quote."
        action={<Link href="/search" className="h-12 px-6 inline-flex items-center rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold">Browse parts</Link>}
      />
    );
  }

  const bySeller = items.reduce<Record<string, typeof items>>((acc, i) => { (acc[i.supplierId] ??= []).push(i); return acc; }, {});
  const address = addresses.find((a) => a.id === addressId);
  const mrpSavings = items.reduce((s, i) => s + (i.mrp && i.mrp > i.unitPrice ? (i.mrp - i.unitPrice) * i.quantity : 0), 0);

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-6 md:py-10 grid md:grid-cols-[1.4fr_1fr] gap-5 md:gap-6 items-start">
        <div className="space-y-4">
          {/* Address */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-extrabold text-ink-3 uppercase tracking-wide">Deliver to</div>
                {address ? (
                  <div className="mt-1"><span className="text-[16px] font-extrabold">{address.label}</span><div className="text-[14px] text-ink-2">{address.line1}, {address.city} {address.postalCode}</div></div>
                ) : <div className="mt-1 text-[15px] font-bold text-ink-2">Add a delivery address</div>}
              </div>
              <button onClick={() => setAddrOpen(true)} className="h-10 px-4 rounded-[12px] border border-[color:var(--accent)] text-[color:var(--accent)] text-[13.5px] font-extrabold whitespace-nowrap">{address ? "Change" : "Add address"}</button>
            </div>
          </div>

          {/* Items grouped by seller */}
          {Object.entries(bySeller).map(([sid, list]) => {
            const s = preview?.sellers.find((x) => x.supplierId === sid);
            return (
              <div key={sid} className="card p-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
                  <div>
                    <div className="text-[15px] font-extrabold">{list[0]!.supplierName}</div>
                    <div className="text-[12.5px] font-semibold text-ink-3">Ships separately · {s ? (parseFloat(s.deliveryFee) === 0 ? "Free delivery" : `Delivery ${inr(s.deliveryFee)}`) : "…"}</div>
                  </div>
                  {s && parseFloat(s.deliveryFee) > 0 && preview && (
                    <span className="text-[12px] font-bold text-[color:var(--success)] text-right">Add {inr(preview.freeDeliveryAbove - parseFloat(s.subtotal))} more<br />for free delivery</span>
                  )}
                </div>
                <ul className="divide-y divide-line">
                  {list.map((i) => (
                    <li key={i.id} className="flex items-center gap-4 py-4">
                      <PartThumb category={i.category} size="sm" className="w-14 h-14 rounded-[12px] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${i.productId ?? i.id}`} className="text-[14.5px] font-extrabold leading-snug hover:text-[color:var(--accent)]">{i.brand ? `${i.brand} ` : ""}{i.name}</Link>
                        <div className="mt-1 flex items-center gap-2">{i.partType && <PartTypeBadge type={i.partType} />}<span className="text-[13px] font-bold">{inr(i.unitPrice)}</span></div>
                      </div>
                      <div className="inline-flex items-center rounded-[10px] border border-line-2 h-9 font-extrabold text-[color:var(--success)]">
                        <button aria-label="Decrease" className="w-9 h-full" onClick={() => setQty(i.id, i.quantity - 1)}>−</button>
                        <span className="w-6 text-center text-ink">{i.quantity}</span>
                        <button aria-label="Increase" className="w-9 h-full" onClick={() => setQty(i.id, i.quantity + 1)}>+</button>
                      </div>
                      <div className="w-20 text-right price text-[14.5px]">{inr(i.unitPrice * i.quantity)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bill */}
        <div className="card p-5 md:sticky md:top-[88px]">
          <div className="text-[16px] font-extrabold">Bill details</div>
          {previewErr && <div className="mt-3 rounded-[12px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] text-[13px] font-bold p-3">{previewErr}</div>}
          <dl className="mt-3 space-y-2.5 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-2">Item total</dt><dd className="font-bold">{preview ? inr(preview.itemsTotal, { decimals: true }) : "…"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Delivery ({preview?.sellers.length ?? 0} seller{preview && preview.sellers.length > 1 ? "s" : ""})</dt><dd className="font-bold">{preview ? (parseFloat(preview.deliveryTotal) ? inr(preview.deliveryTotal) : <span className="text-[color:var(--success)]">FREE</span>) : "…"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Platform fee</dt><dd className="font-bold"><span className="strike mr-1">₹9</span><span className="text-[color:var(--success)]">FREE</span></dd></div>
            <div className="border-t border-dashed border-line-2 pt-3 flex justify-between text-[16px]"><dt className="font-extrabold">To pay</dt><dd className="price">{preview ? inr(preview.total, { decimals: true }) : "…"}</dd></div>
          </dl>
          {mrpSavings > 0 && <div className="mt-3 rounded-[12px] bg-[color:var(--success-wash)] text-[color:var(--success)] text-[13px] font-extrabold p-3">You save {inr(mrpSavings)} vs MRP on this order</div>}
          <button disabled={busy || !preview || !!previewErr} onClick={proceed} className="mt-4 w-full h-[54px] rounded-[14px] bg-[color:var(--accent)] text-white text-[16px] font-extrabold disabled:opacity-50 fms-press flex items-center justify-between px-5">
            <span>{preview ? inr(preview.total) : ""}</span><span>{busy ? "Creating order…" : addressId ? "Proceed to pay →" : "Add address to continue"}</span>
          </button>
          <p className="mt-3 text-[12px] text-ink-3 text-center">Payment is held in FMS escrow until delivery. Fit or free return.</p>
        </div>
      </div>

      <Sheet open={addrOpen} onClose={() => setAddrOpen(false)} title="Delivery address">
        {addresses.length > 0 && (
          <div className="space-y-2 mb-5">
            {addresses.map((a) => (
              <button key={a.id} onClick={() => { setAddressId(a.id); setAddrOpen(false); }} className="w-full text-left p-3.5 rounded-[14px] border-2" style={{ borderColor: a.id === addressId ? "var(--accent)" : "var(--line)" }}>
                <div className="text-[14.5px] font-extrabold">{a.label}</div><div className="text-[13px] text-ink-3">{a.line1}, {a.city} {a.postalCode}</div>
              </button>
            ))}
            <div className="text-[12px] font-extrabold uppercase tracking-wide text-ink-3 pt-3">Or add new</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Address"><input className={inputCls} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Flat / shop, street, area" /></Field></div>
          <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="PIN code"><input className={inputCls} inputMode="numeric" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></Field>
          <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <div className="col-span-2"><Field label="Save as"><div className="flex gap-2">{["Home", "Work", "Garage"].map((l) => <button key={l} type="button" className="chip" data-on={form.label === l} onClick={() => setForm({ ...form, label: l })}>{l}</button>)}</div></Field></div>
        </div>
        <button onClick={saveAddress} disabled={!form.line1 || !form.city || !form.state || !form.postalCode} className="mt-5 w-full h-12 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">Save address</button>
      </Sheet>
    </div>
  );
}
