"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { inr } from "@/lib/api/v2";
import { bizApi, type PurchaseOrder } from "@/lib/api/v3";
import { EmptyState, Skel, StatusChip } from "@/components/shop/ui";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, PO_STATUS, Page, PageHead, Tabs, shortDate, useApi } from "@/components/biz/kit";

type Tab = "in" | "out";

function PoList({ pos, dir }: { pos: PurchaseOrder[]; dir: Tab }) {
  return (
    <ul className="card-flat divide-y divide-line overflow-hidden">
      {pos.map((p) => {
        const s = PO_STATUS[p.status];
        const needsMe = dir === "in" ? p.status === "sent" || p.status === "accepted" : p.status === "shipped";
        return (
          <li key={p.id}>
            <Link href={`/biz/orders/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-2">
              {needsMe && <span className="w-2 h-2 rounded-full bg-[color:var(--accent)] flex-shrink-0" aria-label="Needs your action" />}
              <span className="flex-1 min-w-0">
                <span className="block text-[14.5px] font-extrabold truncate">{dir === "in" ? p.buyerName : p.sellerName}</span>
                <span className="block text-[12.5px] text-ink-3 font-semibold truncate">
                  {p.number} · {p.lines.length} item{p.lines.length === 1 ? "" : "s"} · {shortDate(p.createdAt)} · {p.paymentTerms === "credit" ? "Credit" : "Advance"}
                </span>
              </span>
              <span className="text-right flex-shrink-0">
                <span className="block text-[15px] font-extrabold tabular-nums">{inr(p.total)}</span>
                <StatusChip tone={s.tone} className="mt-0.5">{s.label}</StatusChip>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function OrdersInner() {
  const { isSeller, today } = useBiz();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const want = params.get("tab");
  // No tab asked for: open where the work is.
  const auto: Tab = today.pos_to_accept + today.pos_to_ship === 0 && today.pos_to_receive + today.pos_waiting > 0 ? "out" : "in";
  const tab: Tab = !isSeller ? "out" : want === "out" || want === "in" ? want : auto;
  const r = useApi(`pos:${tab}`, () => bizApi.pos(tab));
  const setTab = (t: Tab) => router.replace(`${path}?tab=${t}`, { scroll: false });
  const pos = r.data?.pos ?? [];

  return (
    <Page>
      <PageHead
        title="Orders"
        sub={isSeller ? "Purchase orders from your buyers and to your suppliers" : "Stock you ordered from suppliers"}
        action={<Link href="/biz/network?tab=suppliers" className="h-10 px-3.5 rounded-[10px] bg-[color:var(--accent)] text-white text-[13px] font-extrabold inline-flex items-center gap-1.5"><BI.cart size={16} /> Order stock</Link>}
      />
      {isSeller && (
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "in", label: "Received", count: today.pos_to_accept + today.pos_to_ship },
            { value: "out", label: "Placed", count: today.pos_to_receive },
          ]}
        />
      )}
      {r.error ? <ErrorCard message={r.error} onRetry={r.reload} /> : !r.data ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skel key={i} className="h-16" />)}</div>
      ) : !pos.length ? (
        tab === "in" ? (
          <EmptyState title="No purchase orders yet" body="When a connected buyer orders stock from you, it shows up here to accept and ship." action={<Link href="/biz/network?tab=find" className="h-11 px-5 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">Add buyers</Link>} />
        ) : (
          <EmptyState title="You haven't ordered stock yet" body="Connect with a supplier, see your trade price and place a purchase order in a minute." action={<Link href="/biz/network?tab=suppliers" className="h-11 px-5 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">Order stock</Link>} />
        )
      ) : (
        <PoList pos={pos} dir={tab} />
      )}

      {isSeller && (
        <Link href="/supplier/orders" className="mt-4 card-flat p-4 flex items-center gap-3.5 hover:bg-paper-2">
          <span className="w-10 h-10 rounded-[12px] bg-paper-2 flex items-center justify-center text-ink-2"><BI.store size={20} /></span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14.5px] font-extrabold">Marketplace orders</span>
            <span className="block text-[12.5px] text-ink-3 font-semibold">{today.orders_to_pack ? `${today.orders_to_pack} paid order${today.orders_to_pack === 1 ? "" : "s"} to pack` : "Online orders from FindMySpare buyers"}</span>
          </span>
          <BI.chev size={18} className="text-ink-4" />
        </Link>
      )}
    </Page>
  );
}

export default function OrdersPage() {
  return <Suspense><OrdersInner /></Suspense>;
}
