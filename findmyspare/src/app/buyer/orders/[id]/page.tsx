"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { clsx } from "clsx";
import { ordersApi } from "@/lib/api";
import { checkoutApi, vehiclesApi, inr, type Vehicle } from "@/lib/api/v2";
import type { OrderDetail } from "@/lib/types";
import { Timeline, StatusChip, PartThumb, Skel } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const FLOW = ["placed", "confirmed", "shipped", "in_transit", "delivered", "completed"] as const;
const LABEL: Record<string, string> = { placed: "Order placed", confirmed: "Seller confirmed & packing", shipped: "Shipped", in_transit: "On the way", delivered: "Delivered", completed: "Completed · payment released to seller" };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<OrderDetail | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rating, setRating] = useState(0);
  const [fit, setFit] = useState<boolean | null>(null);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => ordersApi.get(id).then(setD).catch((e) => setError(getErrorMessage(e, "Something went wrong"))), [id]);
  useEffect(() => { load(); vehiclesApi.mine().then((r) => { setVehicles(r.vehicles); if (r.vehicles[0]) setVehicleId(r.vehicles[0].id); }).catch(() => {}); }, [load]);

  async function submitReview() {
    setBusy(true);
    try {
      await checkoutApi.review(id, { rating, comment: comment || undefined, fitConfirmed: fit ?? undefined, vehicleId: vehicleId || undefined });
      toast.success(fit ? "Thanks! Your fit confirmation helps other buyers." : "Thanks for the review");
      load();
    } catch (e) { toast.error(getErrorMessage(e, "Something went wrong")); }
    finally { setBusy(false); }
  }

  if (error) return <div className="p-10 text-center text-[color:var(--danger)] font-bold">{error}</div>;
  if (!d) return <div className="max-w-[880px] mx-auto px-4 py-8 space-y-4"><Skel className="h-28" /><Skel className="h-64" /></div>;

  const { order, items, escrow, supplier, shippingAddress, dispute } = d;
  const idx = FLOW.indexOf(order.status as (typeof FLOW)[number]);
  const unpaid = order.paymentStatus === "pending";
  const steps = FLOW.map((s, i) => ({
    label: LABEL[s]!,
    sub:
      s === "placed" ? format(new Date(order.createdAt), "d MMM, h:mm a")
      : s === "shipped" && order.trackingNumber && i <= idx ? `${order.courierService} · AWB ${order.trackingNumber}`
      : s === "in_transit" && order.estimatedDelivery && i <= idx + 1 ? `Expected by ${format(new Date(order.estimatedDelivery), "EEE, d MMM")}`
      : s === "delivered" && order.deliveredAt ? format(new Date(order.deliveredAt), "d MMM, h:mm a") : undefined,
    state: (i < idx || (i === idx && s === "completed") ? "done" : i === idx ? "current" : "todo") as "done" | "current" | "todo",
  }));
  const fee = parseFloat(order.deliveryFee ?? "0");

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[880px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-4">
        <Link href="/buyer/orders" className="text-[13px] font-bold text-ink-3">← All orders</Link>
        <div className="card p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[13px] font-bold text-ink-3">Order #{order.id.slice(0, 8).toUpperCase()} · {format(new Date(order.createdAt), "d MMM yyyy")}</div>
            <div className="text-[22px] font-extrabold tracking-tight mt-0.5">{unpaid ? "Waiting for payment" : order.status === "cancelled" ? "Cancelled" : LABEL[order.status]?.split(" ·")[0]}</div>
            <div className="text-[13.5px] text-ink-2 font-semibold">from {supplier?.businessName ?? supplier?.name}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {order.source === "quote" && <StatusChip tone="blue">From quote</StatusChip>}
            {order.source === "job" && <StatusChip tone="blue">For a garage job</StatusChip>}
            {escrow && <StatusChip tone={escrow.status === "released" ? "green" : escrow.status.startsWith("refund") ? "amber" : "brand"}>Escrow: {escrow.status.replace("_", " ")}</StatusChip>}
          </div>
        </div>

        {unpaid && order.checkoutId && (
          <Link href={`/pay/${order.checkoutId}`} className="card p-5 flex items-center justify-between bg-[color:var(--accent-wash)]">
            <span className="text-[15px] font-extrabold">Complete payment of {inr(order.totalAmount)} so the seller can ship</span>
            <span className="h-10 px-4 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">Pay now</span>
          </Link>
        )}

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-4 items-start">
          <div className="card p-5"><div className="text-[16px] font-extrabold mb-4">Tracking</div>{order.status === "cancelled" ? <p className="text-ink-3">This order was cancelled and refunded.</p> : <Timeline steps={steps} />}</div>
          <div className="space-y-4">
            <div className="card p-5">
              <div className="text-[16px] font-extrabold mb-2">Items</div>
              <ul className="divide-y divide-line">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <PartThumb size="sm" className="w-12 h-12 rounded-[10px] flex-shrink-0" />
                    <div className="flex-1 min-w-0"><Link href={`/product/${i.productId}`} className="text-[14px] font-extrabold hover:text-[color:var(--accent)]">{i.productName}</Link><div className="text-[12.5px] text-ink-3 font-semibold">Qty {i.quantity}{i.partNumber ? ` · #${i.partNumber}` : ""}</div></div>
                    <span className="price text-[14px]">{inr(i.subtotal)}</span>
                  </li>
                ))}
                {!items.length && <li className="py-3 text-[14px] text-ink-2">Quoted part from {supplier?.businessName}</li>}
              </ul>
              <div className="border-t border-dashed border-line-2 mt-2 pt-3 space-y-1.5 text-[14px]">
                {fee > 0 && <div className="flex justify-between"><span className="text-ink-2">Delivery</span><b>{inr(fee)}</b></div>}
                <div className="flex justify-between text-[15px]"><span className="font-extrabold">Paid</span><span className="price">{inr(order.totalAmount, { decimals: true })}</span></div>
              </div>
            </div>
            {shippingAddress && <div className="card p-5 text-[14px]"><div className="text-[13px] font-extrabold text-ink-3 uppercase tracking-wide">Delivering to</div><div className="font-bold mt-1">{shippingAddress.label}</div><div className="text-ink-2">{shippingAddress.line1}, {shippingAddress.city} {shippingAddress.postalCode}</div></div>}
          </div>
        </div>

        {order.status === "delivered" && (
          <div className="card p-5 md:p-6 border-2 border-[color:var(--success)]">
            <div className="text-[19px] font-extrabold">How was it?</div>
            <p className="text-[14px] text-ink-3">Confirming the fit releases payment to the seller and helps the next buyer.</p>
            <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} stars`} onClick={() => setRating(n)} className={clsx("w-11 h-11 rounded-[12px] text-[20px] border-2", n <= rating ? "bg-[color:var(--success)] border-[color:var(--success)] text-white" : "border-line text-ink-4")}>★</button>
              ))}
            </div>
            <div className="mt-5 text-[15px] font-extrabold">Did it fit your vehicle?</div>
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <button className="chip" data-on={fit === true} onClick={() => setFit(true)}>✓ Yes, fitted perfectly</button>
              <button className="chip" data-on={fit === false} onClick={() => setFit(false)}>✗ No</button>
              {vehicles.length > 0 && (
                <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="chip" aria-label="Vehicle">
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.makeName} {v.modelName} · {v.regNoDisplay}</option>)}
                </select>
              )}
            </div>
            {fit === false && <div className="mt-3 rounded-[12px] bg-[color:var(--amber-wash)] text-[color:var(--amber)] text-[13.5px] font-bold p-3">Sorry about that. <Link href={`/buyer/orders/${order.id}/dispute`} className="underline">Raise a free return</Link> and we&apos;ll arrange pickup.</div>}
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything other buyers should know? (optional)" className="mt-4 w-full min-h-[84px] p-4 rounded-[12px] bg-paper-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)] text-[14.5px]" />
            <button disabled={!rating || busy} onClick={submitReview} className="mt-4 h-12 px-6 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold disabled:opacity-40">Submit & release payment</button>
          </div>
        )}
        {order.status === "completed" && <div className="card p-5 text-[14px] font-bold text-[color:var(--success)]">✓ Order complete. Thanks for confirming!</div>}
        {["delivered", "completed"].includes(order.status) && !dispute && (
          <Link href={`/buyer/orders/${order.id}/dispute`} className="block text-center text-[13.5px] font-bold text-ink-3 hover:text-ink">Problem with this order? Report an issue</Link>
        )}
      </div>
    </div>
  );
}
