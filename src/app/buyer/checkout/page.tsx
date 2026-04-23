"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackIcon, ShieldIcon, CheckIcon, WalletIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { MapPin, Plus } from "lucide-react";
import { addressesApi, ordersApi } from "@/lib/api";
import type { Address } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

const steps: Array<{ label: string; done: boolean; active?: boolean }> = [
  { label: "Review", done: true },
  { label: "Payment", done: false, active: true },
  { label: "Confirm", done: false },
];

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loading, setLoading] = useState(false);

  const orderTotal = total();

  useEffect(() => {
    let cancelled = false;

    async function loadAddresses() {
      setLoadingAddress(true);
      try {
        const res = await addressesApi.list();
        if (cancelled) return;

        setAddresses(res.addresses);
        const preferred = res.addresses.find((a) => a.isDefault)?.id || res.addresses[0]?.id || "";
        setSelectedAddress(preferred);
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load addresses"));
      } finally {
        if (!cancelled) setLoadingAddress(false);
      }
    }

    loadAddresses();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleFundEscrow() {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items
        .map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
        }))
        .filter((item) => Boolean(item.productId));

      if (!orderItems.length) {
        toast.error("No valid products in cart.");
        return;
      }

      const result = await ordersApi.create({
        items: orderItems,
        shippingAddressId: selectedAddress,
      });

      router.push(`/buyer/payment?orderId=${result.order.id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not place order."));
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="text-[13px] text-ink-3">Your cart is empty.</div>
        <Link href="/buyer/search">
          <Button variant="primary">Browse parts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-4 flex items-center gap-3">
        <Link
          href="/buyer/cart"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="serif text-[24px] leading-[1.05]">Checkout</div>
      </div>

      <div className="px-5 pt-5 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${
                s.done
                  ? "bg-ink text-paper"
                  : s.active
                    ? "bg-accent text-paper"
                    : "bg-paper-2 border border-line text-ink-3"
              }`}
            >
              {s.done ? <CheckIcon size={14} /> : i + 1}
            </div>
            <span className={`text-[11px] ${s.active ? "font-medium text-ink" : "text-ink-3"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-line ml-1" />}
          </div>
        ))}
      </div>

      <div className="px-5 pt-5 flex-1 space-y-4">
        <Card variant="dark" className="!p-4">
          <div className="mono text-[10px] opacity-50 tracking-[0.1em]">ORDER SUMMARY</div>
          <div className="mt-2 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-[13px]">
                <span className="opacity-70">
                  {item.name} ×{item.quantity}
                </span>
                <span className="mono">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="mono">{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </Card>

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">DELIVERY ADDRESS</div>

          {loadingAddress ? (
            <div className="text-[12px] text-ink-3">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <Card className="!p-3.5">
              <div className="text-[12px] text-ink-3">No address found. Add one from your profile settings.</div>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`w-full text-left p-3.5 rounded-[12px] border transition-all ${
                    selectedAddress === addr.id ? "border-[1.5px] !border-ink bg-paper" : "border-line bg-paper"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-ink-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{addr.label || "Address"}</div>
                      <div className="text-[11px] text-ink-3 mt-0.5">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.postalCode}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 ${
                        selectedAddress === addr.id ? "bg-ink border-ink" : "border-line"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          <button className="mt-2 p-3.5 rounded-[12px] border border-dashed border-line flex items-center gap-2 text-[13px] text-ink-3 w-full">
            <Plus size={16} />
            Add new address (soon)
          </button>
        </div>

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">PAYMENT METHOD</div>
          <Card className="!p-3.5 flex items-center gap-3 border-[1.5px] !border-ink">
            <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center">
              <WalletIcon size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium">UPI</div>
              <div className="text-[11px] text-ink-3">Google Pay, PhonePe, Paytm</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-ink" />
          </Card>
        </div>

        <Card variant="accent" className="!p-3">
          <div className="flex gap-2.5 items-start">
            <ShieldIcon size={18} className="text-accent-ink flex-shrink-0 mt-0.5" />
            <div className="text-xs text-accent-ink leading-[1.4]">
              <span className="font-semibold">Secure escrow.</span> {formatPrice(orderTotal)} held safely until delivery confirmation.
            </div>
          </div>
        </Card>
      </div>

      <div className="px-5 py-3.5 border-t border-line">
        <Button variant="primary" block loading={loading} onClick={handleFundEscrow}>
          Fund escrow · {formatPrice(orderTotal)}
        </Button>
      </div>
    </div>
  );
}
