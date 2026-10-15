"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi, type PurchaseOrder } from "@/lib/api/v3";
import { Field, Sheet, Skel, StatusChip, Timeline, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, PO_STATUS, Page, PageHead, btnGhost, btnPrimary, dateTime, shortDate, useApi } from "@/components/biz/kit";

type Action = "accept" | "reject" | "ship" | "receive" | "cancel";
const DONE: Record<Action, string> = {
  accept: "Order accepted. Buyer notified.",
  reject: "Order rejected",
  ship: "Marked shipped. Invoice added to your khata.",
  receive: "Received. Stock added to your listings.",
  cancel: "Order cancelled",
};

const isPast = (d: string) => new Date(d).getTime() < Date.now();

function steps(po: PurchaseOrder) {
  const order = ["sent", "accepted", "shipped", "received"] as const;
  const idx = order.indexOf(po.status as (typeof order)[number]);
  const labels = { sent: "Order sent", accepted: "Accepted by supplier", shipped: "Shipped", received: "Received" };
  return order.map((st, i) => {
    const sub =
      st === "sent" ? dateTime(po.createdAt)
      : i === idx ? [st === "shipped" ? po.trackingNote : null, dateTime(po.updatedAt)].filter(Boolean).join(" · ")
      : st === "shipped" && i < idx ? po.trackingNote ?? undefined
      : undefined;
    const state: "done" | "current" | "todo" = i <= idx ? "done" : i === idx + 1 ? "current" : "todo";
    return { label: labels[st], sub, state };
  });
}

export default function PoDetail() {
  const { id } = useParams<{ id: string }>();
  const { reload: reloadBiz } = useBiz();
  const r = useApi(id ? `po:${id}` : null, () => bizApi.po(id));
  const [sheet, setSheet] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(action: Action) {
    setBusy(true);
    try {
      await bizApi.poAction(id, action, { note: note.trim() || undefined, tracking: tracking.trim() || undefined });
      toast.success(DONE[action]);
      setSheet(null); setNote(""); setTracking("");
      r.reload(); reloadBiz();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't update the order"));
    } finally {
      setBusy(false);
    }
  }

  if (r.error) return <Page><PageHead title="Purchase order" back="/biz/orders" /><ErrorCard message={r.error} onRetry={r.reload} /></Page>;
  if (!r.data) return <Page><Skel className="h-10 w-1/2 mb-4" /><Skel className="h-48 mb-3" /><Skel className="h-48" /></Page>;

  const { po, buyer, seller, role } = r.data;
  const s = PO_STATUS[po.status];
  const other = role === "seller" ? buyer : seller;
  const ended = po.status === "rejected" || po.status === "cancelled";
  const overdue = !!po.dueDate && po.paymentTerms === "credit" && (po.status === "shipped" || po.status === "received") && isPast(po.dueDate);

  const actions: React.ReactNode[] = [];
  if (role === "seller" && po.status === "sent") {
    actions.push(<button key="a" disabled={busy} onClick={() => act("accept")} className={clsx(btnPrimary, "flex-1")}><BI.check size={18} /> Accept order</button>);
    actions.push(<button key="r" disabled={busy} onClick={() => setSheet("reject")} className={clsx(btnGhost, "flex-1")}>Reject</button>);
  }
  if (role === "seller" && po.status === "accepted") actions.push(<button key="s" disabled={busy} onClick={() => setSheet("ship")} className={clsx(btnPrimary, "flex-1")}><BI.truck size={18} /> Mark shipped</button>);
  if (role === "buyer" && po.status === "shipped") actions.push(<button key="rc" disabled={busy} onClick={() => setSheet("receive")} className={clsx(btnPrimary, "flex-1")}><BI.check size={18} /> Mark received</button>);
  if (role === "buyer" && po.status === "sent") actions.push(<button key="c" disabled={busy} onClick={() => setSheet("cancel")} className={clsx(btnGhost, "flex-1")}>Cancel order</button>);

  const waiting =
    role === "buyer" && po.status === "sent" ? "Waiting for the supplier to accept."
    : role === "buyer" && po.status === "accepted" ? "Accepted. Waiting for dispatch."
    : role === "seller" && po.status === "shipped" ? "Shipped. Waiting for the buyer to confirm delivery."
    : null;

  return (
    <Page>
      <PageHead title={po.number} sub={<>{role === "seller" ? "Order from" : "Order to"} <span className="text-ink font-extrabold">{other?.name}</span></>} back={`/biz/orders?tab=${role === "seller" ? "in" : "out"}`} action={<StatusChip tone={s.tone}>{s.label}</StatusChip>} />

      {ended && (
        <div className="rounded-[16px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] p-4 mb-4 text-[14px] font-bold">
          This order was {po.status}{po.sellerNote && po.status === "rejected" ? `: “${po.sellerNote}”` : ""}.
        </div>
      )}

      {(actions.length > 0 || waiting) && (
        <div className="card p-4 mb-4">
          {waiting && <div className="text-[14px] font-bold text-ink-2 mb-0">{waiting}</div>}
          {actions.length > 0 && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_300px] gap-4 items-start">
        <section className="card p-4 md:p-5 min-w-0">
          <h2 className="text-[16px] font-extrabold mb-2">Items</h2>
          <ul className="divide-y divide-line">
            {po.lines.map((l) => (
              <li key={l.productId} className="py-3 flex items-start gap-3">
                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] font-extrabold">{l.name}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold">{[l.brand, l.partNumber].filter(Boolean).join(" · ")}{(l.brand || l.partNumber) && " · "}{l.quantity} × {inr(l.unitPrice, { decimals: true })} + {l.gstRate}% GST</span>
                </span>
                <span className="text-[14.5px] font-extrabold tabular-nums">{inr(l.total, { decimals: true })}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 pt-3 border-t border-line space-y-1 text-[14px]">
            <div className="flex justify-between text-ink-3 font-semibold"><dt>Subtotal</dt><dd className="tabular-nums">{inr(po.subtotal, { decimals: true })}</dd></div>
            <div className="flex justify-between text-ink-3 font-semibold"><dt>GST</dt><dd className="tabular-nums">{inr(po.tax, { decimals: true })}</dd></div>
            <div className="flex justify-between text-[18px] font-extrabold pt-1"><dt>Total</dt><dd className="tabular-nums">{inr(po.total, { decimals: true })}</dd></div>
          </dl>
          {(po.note || po.sellerNote) && (
            <div className="mt-4 space-y-2">
              {po.note && <div className="rounded-[12px] bg-paper-2 p-3 text-[13.5px]"><span className="font-extrabold">Buyer note:</span> {po.note}</div>}
              {po.sellerNote && <div className="rounded-[12px] bg-paper-2 p-3 text-[13.5px]"><span className="font-extrabold">Supplier note:</span> {po.sellerNote}</div>}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          {!ended && <section className="card p-4 md:p-5"><h2 className="text-[16px] font-extrabold mb-3">Progress</h2><Timeline steps={steps(po)} /></section>}
          <section className="card p-4 md:p-5 text-[13.5px] space-y-2.5">
            <div className="flex justify-between gap-2"><span className="text-ink-3 font-semibold">Payment</span><span className="font-extrabold">{po.paymentTerms === "credit" ? "On credit" : "Advance"}</span></div>
            {po.dueDate && <div className="flex justify-between gap-2"><span className="text-ink-3 font-semibold">Due</span><span className={clsx("font-extrabold", overdue && "text-[color:var(--danger)]")}>{shortDate(po.dueDate)}{overdue && " · overdue"}</span></div>}
            <div className="pt-2 border-t border-line">
              <div className="text-ink-3 font-semibold text-[12px] uppercase tracking-wider mb-0.5">Supplier</div>
              <div className="font-extrabold">{seller?.name}</div>
              <div className="text-ink-3 font-semibold">{[seller?.city, seller?.gst && `GSTIN ${seller.gst}`].filter(Boolean).join(" · ")}</div>
            </div>
            <div className="pt-2 border-t border-line">
              <div className="text-ink-3 font-semibold text-[12px] uppercase tracking-wider mb-0.5">Buyer</div>
              <div className="font-extrabold">{buyer?.name}</div>
              <div className="text-ink-3 font-semibold">{[buyer?.city, buyer?.gst && `GSTIN ${buyer.gst}`].filter(Boolean).join(" · ")}</div>
            </div>
          </section>
          {role === "seller" ? (
            <Link href={`/biz/khata/party?id=${po.buyerId}`} className="card-flat p-4 flex items-center justify-between hover:bg-paper-2 text-[14px] font-extrabold">Open {buyer?.name}&apos;s khata <BI.chev size={18} className="text-ink-4" /></Link>
          ) : (
            <Link href={`/biz/order/${po.sellerId}`} className="card-flat p-4 flex items-center justify-between hover:bg-paper-2 text-[14px] font-extrabold">Order again from {seller?.name} <BI.chev size={18} className="text-ink-4" /></Link>
          )}
        </aside>
      </div>

      <Sheet open={sheet === "ship"} onClose={() => setSheet(null)} title="Mark shipped">
        <p className="text-[13.5px] text-ink-3 font-semibold mb-3">Stock will be reduced and {inr(po.total)} will be added to {buyer?.name}&apos;s khata{po.paymentTerms === "credit" ? " with a due date" : ""}.</p>
        <div className="space-y-3">
          <Field label="Transport / tracking" hint="Shown to the buyer"><input className={inputCls} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="VRL Logistics, LR 48213" maxLength={200} /></Field>
          <Field label="Note (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} /></Field>
          <button disabled={busy} onClick={() => act("ship")} className={clsx(btnPrimary, "w-full")}>{busy ? "Saving…" : "Confirm shipped"}</button>
        </div>
      </Sheet>
      <Sheet open={sheet === "reject"} onClose={() => setSheet(null)} title="Reject this order?">
        <div className="space-y-3">
          <Field label="Reason (sent to the buyer)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Out of stock till next week" maxLength={300} /></Field>
          <button disabled={busy} onClick={() => act("reject")} className={clsx(btnPrimary, "w-full !bg-[color:var(--danger)]")}>{busy ? "Saving…" : "Reject order"}</button>
        </div>
      </Sheet>
      <Sheet open={sheet === "receive"} onClose={() => setSheet(null)} title="Goods received?">
        <p className="text-[13.5px] text-ink-3 font-semibold mb-3">Check the items. Marking received adds them to your stock; new items are saved as draft listings you can price and publish.</p>
        <div className="space-y-3">
          <Field label="Note (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="2 boxes, all OK" maxLength={300} /></Field>
          <button disabled={busy} onClick={() => act("receive")} className={clsx(btnPrimary, "w-full")}>{busy ? "Saving…" : "Yes, received"}</button>
        </div>
      </Sheet>
      <Sheet open={sheet === "cancel"} onClose={() => setSheet(null)} title="Cancel this order?">
        <div className="space-y-3">
          <Field label="Reason (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} /></Field>
          <button disabled={busy} onClick={() => act("cancel")} className={clsx(btnPrimary, "w-full !bg-[color:var(--danger)]")}>{busy ? "Saving…" : "Cancel order"}</button>
        </div>
      </Sheet>
    </Page>
  );
}
