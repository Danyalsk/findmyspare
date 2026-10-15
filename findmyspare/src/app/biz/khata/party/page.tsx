"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi, type LedgerEntry } from "@/lib/api/v3";
import { EmptyState, Field, Sheet, Skel, StatusChip, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, PO_STATUS, Page, PageHead, Segmented, btnGhost, btnPrimary, dateTime, num, shortDate, useApi, waLink } from "@/components/biz/kit";

const TYPE_LABEL: Record<LedgerEntry["type"], string> = { invoice: "Udhaar / invoice", payment: "Payment received", credit_note: "Credit note", opening: "Opening balance" };
const METHODS = [{ value: "cash", label: "Cash" }, { value: "upi", label: "UPI" }, { value: "bank", label: "Bank" }, { value: "cheque", label: "Cheque" }];

/** What I owe a supplier: their ledger lines about me (read-only) and my POs with them. */
function SupplierParty({ supplierId }: { supplierId: string }) {
  const k = useApi("khata", () => bizApi.khata());
  const pos = useApi("pos:out", () => bizApi.pos("out"));
  const lines = useApi(`payable:${supplierId}`, () => bizApi.khataEntries({ supplierId }));
  const row = k.data?.payable.find((r) => r.owner_id === supplierId);
  const mine = (pos.data?.pos ?? []).filter((p) => p.sellerId === supplierId);
  const name = row?.name ?? mine[0]?.sellerName ?? "Supplier";
  const bal = num(row?.balance);
  return (
    <Page>
      <PageHead title={name} sub="Supplier · what you owe" back="/biz/khata?tab=pay" />
      {k.error ? <ErrorCard message={k.error} onRetry={k.reload} /> : (
        <div className="card p-5 mb-4">
          <div className="text-[12.5px] font-bold text-ink-3">You will pay</div>
          <div className="text-[30px] font-extrabold tracking-tight tabular-nums">{k.data ? inr(Math.abs(bal), { decimals: true }) : "…"}</div>
          <p className="text-[13px] text-ink-3 font-semibold mt-1">{name} records your payments in their khata. Pay them by UPI or bank and ask them to mark it received.</p>
          <Link href={`/biz/order/${supplierId}`} className={clsx(btnGhost, "mt-3 h-11")}><BI.cart size={18} /> Order again</Link>
        </div>
      )}
      {!!lines.data?.entries.length && (
        <>
          <h2 className="text-[16px] font-extrabold mb-2">Their khata for you</h2>
          <ul className="card-flat divide-y divide-line overflow-hidden mb-5">
            {lines.data.entries.map((x) => (
              <li key={x.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-extrabold">{x.type === "payment" ? "You paid" : x.type === "credit_note" ? "Credit note" : "Bill"}{x.method ? ` · ${x.method.toUpperCase()}` : ""}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{dateTime(x.createdAt)}{x.note ? ` · ${x.note}` : ""}</span>
                </span>
                <span className={clsx("text-[14.5px] font-extrabold tabular-nums", num(x.amount) < 0 && "text-[color:var(--success)]")}>{num(x.amount) < 0 ? "−" : "+"}{inr(Math.abs(num(x.amount)), { decimals: true })}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <h2 className="text-[16px] font-extrabold mb-2">Your orders with {name}</h2>
      {pos.error ? <ErrorCard message={pos.error} onRetry={pos.reload} /> : !pos.data ? <Skel className="h-32" /> : !mine.length ? (
        <div className="card-flat p-4 text-[14px] text-ink-3 font-semibold">No purchase orders yet.</div>
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {mine.map((p) => (
            <li key={p.id}>
              <Link href={`/biz/orders/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper-2">
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-extrabold">{p.number}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold">{shortDate(p.createdAt)}{p.dueDate ? ` · due ${shortDate(p.dueDate)}` : ""}</span>
                </span>
                <span className="text-right"><span className="block text-[14.5px] font-extrabold tabular-nums">{inr(p.total)}</span><StatusChip tone={PO_STATUS[p.status].tone} className="mt-0.5">{PO_STATUS[p.status].label}</StatusChip></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

function CustomerParty({ who }: { who: { counterpartyId?: string; phone?: string; name?: string } }) {
  const { me, reload: reloadBiz } = useBiz();
  const key = who.counterpartyId ?? who.phone ?? who.name ?? "";
  const k = useApi("khata", () => bizApi.khata());
  const e = useApi(`entries:${key}`, () => bizApi.khataEntries(who.counterpartyId ? { counterpartyId: who.counterpartyId } : who.phone ? { phone: who.phone } : { name: who.name }));
  const [sheet, setSheet] = useState<"payment" | "invoice" | null>(null);
  const [f, setF] = useState({ amount: "", note: "", method: "cash" });
  const [busy, setBusy] = useState(false);

  const row = k.data?.receivable.find((r) => (who.counterpartyId ? r.counterparty_id === who.counterpartyId : who.phone ? r.phone === who.phone && !r.counterparty_id : r.name === who.name && !r.counterparty_id && !r.phone));
  const name = row?.name ?? who.name ?? who.phone ?? "Customer";
  const phone = row?.phone ?? who.phone ?? null;
  const entries = e.data?.entries ?? [];
  // Running balance, oldest first.
  const running: number[] = [];
  entries.slice().reverse().reduce((acc, x, i) => { running[entries.length - 1 - i] = acc + num(x.amount); return acc + num(x.amount); }, 0);
  const bal = entries.length ? running[0]! : num(row?.balance);
  const overdue = num(row?.overdue);

  async function save() {
    if (!sheet) return;
    setBusy(true);
    try {
      await bizApi.addEntry({
        ...(who.counterpartyId ? { counterpartyId: who.counterpartyId } : { phone: who.phone, name: who.name ?? (row?.name || undefined) }),
        type: sheet, amount: num(f.amount), note: f.note.trim() || undefined, method: sheet === "payment" ? f.method : undefined,
      });
      toast.success(sheet === "payment" ? `${inr(f.amount)} received from ${name}` : `${inr(f.amount)} udhaar added`);
      setSheet(null); setF({ amount: "", note: "", method: "cash" });
      e.reload(); k.reload(); reloadBiz();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save"));
    } finally {
      setBusy(false);
    }
  }

  const reminder = `Namaste ${name}, a gentle reminder from ${me.businessName ?? me.name}: ${inr(bal, { decimals: true })} is pending in our khata. Please pay by UPI or cash at your convenience. Thank you!`;

  return (
    <Page>
      <PageHead title={name} sub={[who.counterpartyId ? "Trade buyer" : "Customer", phone].filter(Boolean).join(" · ")} back="/biz/khata" />

      <div className="card p-5 mb-4">
        <div className="text-[12.5px] font-bold text-ink-3">{bal >= 0 ? "You will get" : "Advance with you"}</div>
        <div className={clsx("text-[32px] font-extrabold tracking-tight tabular-nums", bal > 0 ? "text-[color:var(--amber)]" : bal < 0 ? "text-[color:var(--success)]" : "")}>{e.data || k.data ? inr(Math.abs(bal), { decimals: true }) : "…"}</div>
        {overdue > 0 && bal > 0 && <StatusChip tone="red" className="mt-1">Overdue {inr(Math.min(overdue, bal))}</StatusChip>}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => setSheet("payment")} className={clsx(btnPrimary, "!bg-[color:var(--success)] hover:!bg-[color:var(--success)] px-3")}>Payment received</button>
          <button onClick={() => setSheet("invoice")} className={clsx(btnGhost, "px-3")}>Add udhaar</button>
        </div>
        {bal > 0 && (
          <a href={waLink(phone, reminder)} target="_blank" rel="noopener noreferrer" className="mt-2 h-11 w-full rounded-[14px] border border-line-2 text-[14px] font-extrabold inline-flex items-center justify-center gap-2 hover:bg-paper-2">
            <BI.wa size={18} /> Send WhatsApp reminder
          </a>
        )}
      </div>

      <h2 className="text-[16px] font-extrabold mb-2">Entries</h2>
      {e.error ? <ErrorCard message={e.error} onRetry={e.reload} /> : !e.data ? (
        <div className="space-y-2">{Array.from({ length: 4 }, (_, i) => <Skel key={i} className="h-14" />)}</div>
      ) : !entries.length ? (
        <EmptyState title="No entries yet" body="Add udhaar when you give goods on credit, and record payments as they come in." />
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {entries.map((x, i) => {
            const amt = num(x.amount);
            const link = x.refType === "bill" && x.refId ? `/biz/bills/${x.refId}` : x.refType === "po" && x.refId ? `/biz/orders/${x.refId}` : null;
            const body = (
              <>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-extrabold">{TYPE_LABEL[x.type]}{x.method ? ` · ${x.method.toUpperCase()}` : ""}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{[x.note, dateTime(x.createdAt)].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className={clsx("block text-[14.5px] font-extrabold tabular-nums", amt > 0 ? "text-[color:var(--amber)]" : "text-[color:var(--success)]")}>{amt > 0 ? "+" : "−"}{inr(Math.abs(amt), { decimals: true })}</span>
                  <span className="block text-[11.5px] text-ink-4 font-bold tabular-nums">Bal {running[i]! < 0 ? "−" : ""}{inr(Math.abs(running[i]!), { decimals: true })}</span>
                </span>
              </>
            );
            return <li key={x.id}>{link ? <Link href={link} className="flex items-center gap-3 px-4 py-3 hover:bg-paper-2">{body}</Link> : <div className="flex items-center gap-3 px-4 py-3">{body}</div>}</li>;
          })}
        </ul>
      )}

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet === "payment" ? `Payment from ${name}` : `Udhaar for ${name}`}>
        <div className="space-y-3">
          <Field label="Amount (₹)"><input autoFocus className={inputCls} inputMode="decimal" value={f.amount} onChange={(ev) => setF({ ...f, amount: ev.target.value.replace(/[^\d.]/g, "") })} placeholder={sheet === "payment" && bal > 0 ? String(bal) : ""} /></Field>
          {sheet === "payment" && (
            <div>
              <div className="text-[12.5px] font-bold text-ink-2 mb-1.5">Paid by</div>
              <Segmented label="Payment method" value={f.method} onChange={(v) => setF({ ...f, method: v })} items={METHODS} />
              {bal > 0 && <button type="button" onClick={() => setF({ ...f, amount: String(bal) })} className="mt-2 text-[13px] font-extrabold text-[color:var(--accent)]">Full amount {inr(bal, { decimals: true })}</button>}
            </div>
          )}
          <Field label="Note (optional)"><input className={inputCls} value={f.note} onChange={(ev) => setF({ ...f, note: ev.target.value })} maxLength={200} placeholder={sheet === "payment" ? "UPI ref 4821…" : "2 bearings"} /></Field>
          <button onClick={save} disabled={busy || !(num(f.amount) > 0)} className={clsx(btnPrimary, "w-full", sheet === "payment" && "!bg-[color:var(--success)]")}>{busy ? "Saving…" : sheet === "payment" ? "Record payment" : "Add udhaar"}</button>
        </div>
      </Sheet>
    </Page>
  );
}

function PartyInner() {
  const p = useSearchParams();
  const { isSeller } = useBiz();
  const supplier = p.get("supplier");
  if (supplier) return <SupplierParty supplierId={supplier} />;
  const id = p.get("id") ?? undefined;
  const phone = p.get("phone") ?? undefined;
  const name = p.get("name") ?? undefined;
  if (!id && !phone && !name) return <Page><PageHead title="Khata" back="/biz/khata" /><ErrorCard message="Pick a party from your khata." /></Page>;
  if (!isSeller) return <Page><PageHead title="Khata" back="/biz/khata" /><ErrorCard message="Only sellers keep a customer khata." /></Page>;
  return <CustomerParty key={id ?? phone ?? name} who={{ counterpartyId: id, phone, name }} />;
}

export default function PartyPage() {
  return <Suspense><PartyInner /></Suspense>;
}
