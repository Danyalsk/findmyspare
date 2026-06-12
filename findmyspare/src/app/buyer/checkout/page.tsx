"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { addressesApi, ordersApi } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import type { Address } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass = "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

const emptyAddr = { label: "", line1: "", line2: "", city: "", state: "", postalCode: "", phone: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyAddr);

  async function loadAddresses() {
    try {
      const res = await addressesApi.list();
      setAddresses(res.addresses);
      const def = res.addresses.find((a) => a.isDefault) ?? res.addresses[0];
      setSelected(def?.id ?? null);
      setAdding(res.addresses.length === 0);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load addresses"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  // Bounce back if the cart emptied (e.g. after order placed).
  useEffect(() => {
    if (!loading && items.length === 0 && !placing) router.replace("/buyer/cart");
  }, [items.length, loading, placing, router]);

  async function saveAddress() {
    if (!form.line1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Fill address, city, state and PIN");
      return;
    }
    try {
      const res = await addressesApi.create({
        label: form.label || undefined,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        phone: form.phone || undefined,
        isDefault: addresses.length === 0,
      });
      setForm(emptyAddr);
      setAdding(false);
      setAddresses((prev) => [...prev, res.address]);
      setSelected(res.address.id);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to save address"));
    }
  }

  async function placeOrder() {
    if (!selected) {
      toast.error("Select a delivery address");
      return;
    }
    setPlacing(true);
    try {
      const res = await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId!, quantity: i.quantity })),
        shippingAddressId: selected,
      });
      clear();
      router.replace(`/buyer/success?order=${res.order.id}`);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to place order"));
      setPlacing(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Checkout" backHref="/buyer/cart" />
      <div className="px-5 pb-8 space-y-4">
        {/* Address selection */}
        <div>
          <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider mb-2">Delivery address</div>
          {loading ? (
            <div className="text-[13px] text-ink-3 py-4">Loading…</div>
          ) : (
            <div className="space-y-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={`w-full text-left p-3.5 rounded-[14px] border transition-all ${
                    selected === a.id ? "border-[color:var(--accent)] bg-accent-wash" : "border-line bg-paper"
                  }`}
                >
                  <div className="text-[13px] font-medium">{a.label || a.line1}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
                  </div>
                </button>
              ))}

              {adding ? (
                <Card className="!p-4 space-y-3">
                  <div>
                    <label className={labelClass}>Address line 1</label>
                    <input className={fieldClass} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Address line 2 (optional)</label>
                    <input className={fieldClass} value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>City</label>
                      <input className={fieldClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input className={fieldClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>PIN code</label>
                      <input className={fieldClass} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input className={fieldClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {addresses.length > 0 && (
                      <Button variant="default" block onClick={() => setAdding(false)}>Cancel</Button>
                    )}
                    <Button variant="primary" block onClick={saveAddress}>Save address</Button>
                  </div>
                </Card>
              ) : (
                <Button variant="default" dashed block onClick={() => setAdding(true)}>
                  + Add new address
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider mb-2">Order summary</div>
          <Card className="!p-0 divide-y divide-line">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between p-3.5">
                <div className="text-[13px] min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-[11px] text-ink-3">Qty {it.quantity}</div>
                </div>
                <div className="mono text-[13px] font-semibold">{formatPrice(it.unitPrice * it.quantity)}</div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-[13px] font-bold">Total</span>
              <span className="mono text-[16px] font-bold">{formatPrice(total())}</span>
            </div>
          </Card>
        </div>

        <Card variant="accent" className="!p-3.5">
          <div className="text-[12px] text-ink-2 leading-snug">
            🔒 Your payment is held safely in escrow and released to the supplier only after you confirm delivery.
          </div>
        </Card>

        <Button variant="primary" block size="lg" onClick={placeOrder} loading={placing} disabled={!selected}>
          Place order · {formatPrice(total())}
        </Button>
      </div>
    </div>
  );
}
