"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { bizApi } from "@/lib/api/v3";
import { EmptyState, Field, Sheet, Skel, StatusChip, inputCls } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, Tabs, btnPrimary, btnSmall, num, partyHref, shortDate, useApi } from "@/components/biz/kit";

type Tab = "get" | "pay";

function NewUdhaar({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", amount: "", note: "" });
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      await bizApi.addEntry({ name: f.name.trim() || undefined, phone: f.phone.trim() || undefined, type: "invoice", amount: num(f.amount), note: f.note.trim() || undefined });
      toast.success(`${inr(f.amount)} udhaar added for ${f.name || f.phone}`);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't save"));
      setBusy(false);
    }
  }
  return (
    <Sheet open onClose={onClose} title="Add udhaar">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Customer name"><input autoFocus className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ravi Motors" /></Field>
          <Field label="Phone"><input className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="98xxxxxxxx" /></Field>
        </div>
        <Field label="Amount (₹)"><input className={inputCls} inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^\d.]/g, "") })} /></Field>
        <Field label="For (optional)"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="2 clutch plates" maxLength={200} /></Field>
        <button onClick={save} disabled={busy || !(num(f.amount) > 0) || !(f.name.trim() || f.phone.trim())} className={clsx(btnPrimary, "w-full")}>{busy ? "Saving…" : "Add to khata"}</button>
      </div>
    </Sheet>
  );
}

function KhataInner() {
  const { isSeller, reload: reloadBiz } = useBiz();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const tab: Tab = params.get("tab") === "pay" || !isSeller ? "pay" : "get";
  const setTab = (t: Tab) => router.replace(`${path}?tab=${t}`, { scroll: false });
  const k = useApi("khata", () => bizApi.khata());
  const [adding, setAdding] = useState(false);

  const receivable = k.data?.receivable ?? [];
  const payable = k.data?.payable ?? [];
  const toCollect = receivable.reduce((s, r) => s + Math.max(0, num(r.balance)), 0);
  const toPay = payable.reduce((s, r) => s + num(r.balance), 0);
  const open = receivable.filter((r) => num(r.balance) !== 0);
  const settled = receivable.filter((r) => num(r.balance) === 0);

  return (
    <Page>
      <PageHead
        title="Khata"
        sub="Udhaar you have to collect and bills you have to pay"
        action={isSeller ? <button onClick={() => setAdding(true)} className={clsx(btnSmall, "bg-[color:var(--accent)] text-white h-10")}><BI.plus size={16} /> Udhaar</button> : undefined}
      />

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {isSeller && (
          <button onClick={() => setTab("get")} className={clsx("text-left rounded-[18px] p-4 border-2 transition-colors", tab === "get" ? "border-[color:var(--amber)] bg-[color:var(--amber-wash)]" : "border-line")}>
            <div className="text-[12.5px] font-bold text-ink-3">You will get</div>
            <div className="text-[22px] font-extrabold tracking-tight tabular-nums text-[color:var(--amber)]">{k.data ? inr(toCollect) : "…"}</div>
            <div className="text-[12px] font-semibold text-ink-3">{open.filter((r) => num(r.balance) > 0).length} parties</div>
          </button>
        )}
        <button onClick={() => setTab("pay")} className={clsx("text-left rounded-[18px] p-4 border-2 transition-colors", !isSeller && "col-span-2", tab === "pay" ? "border-ink bg-paper-2" : "border-line")}>
          <div className="text-[12.5px] font-bold text-ink-3">You will pay</div>
          <div className="text-[22px] font-extrabold tracking-tight tabular-nums">{k.data ? inr(toPay) : "…"}</div>
          <div className="text-[12px] font-semibold text-ink-3">{payable.length} supplier{payable.length === 1 ? "" : "s"}</div>
        </button>
      </div>

      {isSeller && <Tabs<Tab> value={tab} onChange={setTab} items={[{ value: "get", label: "To collect" }, { value: "pay", label: "To pay" }]} />}

      {k.error ? <ErrorCard message={k.error} onRetry={k.reload} /> : !k.data ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skel key={i} className="h-16" />)}</div>
      ) : tab === "get" ? (
        !receivable.length ? (
          <EmptyState title="Khata is clean" body="Udhaar bills, shipped credit orders and manual entries show up here, party by party." action={<button onClick={() => setAdding(true)} className={btnPrimary}>Add udhaar</button>} />
        ) : (
          <>
            <ul className="card-flat divide-y divide-line overflow-hidden">
              {open.map((r) => {
                const bal = num(r.balance);
                const overdue = num(r.overdue);
                return (
                  <li key={r.key}>
                    <Link href={partyHref(r)} className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-2">
                      <span className="w-11 h-11 rounded-[14px] bg-paper-2 text-ink-2 flex items-center justify-center text-[16px] font-extrabold flex-shrink-0">{(r.name ?? r.phone ?? "?").slice(0, 1).toUpperCase()}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-extrabold truncate">{r.name ?? r.phone}</span>
                        <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{[r.counterparty_id ? "Trade buyer" : r.phone, `last ${shortDate(r.last_at)}`].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className="text-right flex-shrink-0">
                        <span className={clsx("block text-[15px] font-extrabold tabular-nums", bal > 0 ? "text-[color:var(--amber)]" : "text-[color:var(--success)]")}>{inr(Math.abs(bal))}</span>
                        {overdue > 0 && bal > 0 ? <StatusChip tone="red" className="mt-0.5">Overdue {inr(Math.min(overdue, bal))}</StatusChip> : <span className="block text-[11.5px] text-ink-4 font-bold">{bal > 0 ? "to get" : "advance"}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {settled.length > 0 && (
              <>
                <div className="text-[12.5px] font-extrabold uppercase tracking-wider text-ink-4 mt-5 mb-2 px-1">Settled</div>
                <ul className="card-flat divide-y divide-line overflow-hidden opacity-75">
                  {settled.map((r) => (
                    <li key={r.key}><Link href={partyHref(r)} className="flex items-center justify-between px-4 py-3 hover:bg-paper-2 text-[14px] font-bold"><span className="truncate">{r.name ?? r.phone}</span><span className="text-ink-3">₹0</span></Link></li>
                  ))}
                </ul>
              </>
            )}
          </>
        )
      ) : !payable.length ? (
        <EmptyState title="Nothing to pay" body="When a supplier ships your purchase order on credit, the amount shows here until you pay." />
      ) : (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {payable.map((r) => (
            <li key={r.owner_id}>
              <Link href={`/biz/khata/party?supplier=${r.owner_id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-2">
                <span className="w-11 h-11 rounded-[14px] bg-paper-2 text-ink-2 flex items-center justify-center text-[16px] font-extrabold flex-shrink-0">{(r.name ?? "?").slice(0, 1).toUpperCase()}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] font-extrabold truncate">{r.name}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold">Supplier</span>
                </span>
                <span className="text-right">
                  <span className="block text-[15px] font-extrabold tabular-nums">{inr(Math.abs(num(r.balance)))}</span>
                  <span className="block text-[11.5px] text-ink-4 font-bold">{num(r.balance) > 0 ? "to pay" : "advance"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {adding && <NewUdhaar onClose={() => setAdding(false)} onDone={() => { setAdding(false); k.reload(); reloadBiz(); }} />}
    </Page>
  );
}

export default function KhataPage() {
  return <Suspense><KhataInner /></Suspense>;
}
