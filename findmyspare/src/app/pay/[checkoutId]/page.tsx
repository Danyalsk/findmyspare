"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { checkoutApi, inr, type PayMethod } from "@/lib/api/v2";
import { Logo } from "@/components/brand/Logo";
import { MockGateway } from "@/components/shop/MockGateway";
import { getErrorMessage } from "@/lib/errors";
import { usePaymentsMode, PAYMENTS_SOON } from "@/lib/use-config";

type Checkout = Awaited<ReturnType<typeof checkoutApi.get>>;

export default function PayCheckoutPage() {
  const { checkoutId } = useParams<{ checkoutId: string }>();
  const router = useRouter();
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  const clearCart = useCartStore((s) => s.clear);
  const [data, setData] = useState<Checkout | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const payments = usePaymentsMode();

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.replace(`/login?next=/pay/${checkoutId}`); return; }
    checkoutApi.get(checkoutId).then((d) => { setData(d); if (d.orders.every((o) => o.paymentStatus === "paid")) setPaid(true); }).catch((e) => setError(getErrorMessage(e, "Something went wrong")));
  }, [mounted, user, checkoutId, router]);

  async function pay(method: PayMethod, fail: boolean) {
    setBusy(true); setError("");
    try {
      const { payment } = await checkoutApi.startPayment(checkoutId);
      const r = await checkoutApi.completePayment(payment.id, method, fail ? "failure" : "success");
      if (r.payment.status === "succeeded") { clearCart(); setPaid(true); }
      else setError(`Payment declined (${r.payment.failureReason ?? "try another method"}). Your cart is safe, so try again.`);
    } catch (e) { setError(getErrorMessage(e, "Payment failed")); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-dvh bg-paper-3">
      <header className="bg-paper border-b border-line"><div className="max-w-[960px] mx-auto px-4 h-16 flex items-center justify-between"><Link href="/"><Logo size={24} /></Link><span className="text-[13px] font-bold text-ink-3 flex items-center gap-1.5">🔒 Secure checkout</span></div></header>
      <div className="max-w-[960px] mx-auto px-4 py-8">
        {!data ? (
          <div className="text-center text-ink-3 py-20">{error || "Loading…"}</div>
        ) : paid ? (
          <div className="max-w-[520px] mx-auto text-center fms-fade-up">
            <div className="mx-auto w-24 h-24 rounded-full bg-[color:var(--success)] flex items-center justify-center text-white"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg></div>
            <h1 className="mt-5 text-[28px] font-extrabold tracking-tight">Order placed!</h1>
            <p className="text-[15px] text-ink-2 mt-2">{inr(data.checkout.total, { decimals: true })} is held safely in FMS escrow. Sellers are packing now.</p>
            <div className="mt-6 card p-4 text-left divide-y divide-line">
              {data.orders.map((o) => (
                <Link key={o.id} href={`/buyer/orders/${o.id}`} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div><div className="text-[14.5px] font-extrabold">{o.supplierName}</div><div className="text-[12.5px] text-ink-3 font-semibold">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</div></div>
                  <span className="text-[13px] font-extrabold text-[color:var(--accent)] whitespace-nowrap">Track →</span>
                </Link>
              ))}
            </div>
            <Link href="/buyer/orders" className="mt-6 inline-flex h-12 px-6 items-center rounded-[14px] bg-ink text-paper font-extrabold">View all orders</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-start">
            <div className="card p-5">
              <div className="text-[16px] font-extrabold">Order summary</div>
              <div className="mt-3 divide-y divide-line">
                {data.orders.map((o) => (
                  <div key={o.id} className="py-3">
                    <div className="flex justify-between text-[14px] font-extrabold"><span>{o.supplierName}</span><span>{inr(o.totalAmount)}</span></div>
                    <ul className="mt-1 text-[13px] text-ink-3 font-semibold">{o.items.map((i, k) => <li key={k}>{i.quantity}× {i.name}</li>)}</ul>
                    {parseFloat(o.deliveryFee) > 0 && <div className="text-[12.5px] text-ink-3">incl. delivery {inr(o.deliveryFee)}</div>}
                  </div>
                ))}
              </div>
            </div>
            {payments === "mock" ? <MockGateway amount={data.checkout.total} onPay={pay} busy={busy} error={error} /> : <div className="card p-6 text-center"><div className="text-[18px] font-extrabold">{PAYMENTS_SOON}</div><p className="text-[14px] text-ink-3 mt-1">We&apos;ll notify you the moment you can complete this order.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
