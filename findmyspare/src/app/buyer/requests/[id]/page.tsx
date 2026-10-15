"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { clsx } from "clsx";
import { bidsApi, inquiriesApi } from "@/lib/api";
import { useSocket } from "@/lib/socket";
import { inr } from "@/lib/api/v2";
import type { Bid, Inquiry } from "@/lib/types";
import { RatingPill, StatusChip, Skel, EmptyState } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { usePaymentsMode, PAYMENTS_SOON } from "@/lib/use-config";

const COND: Record<string, string> = { genuine: "Genuine OEM", oem: "Genuine OEM", oes: "OES", oem_equivalent: "OES", aftermarket: "Aftermarket", used: "Used · graded", refurbished: "Refurbished" };

export default function RequestQuotesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const socket = useSocket();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [bids, setBids] = useState<Bid[] | null>(null);
  const [sort, setSort] = useState<"price" | "rating" | "eta">("price");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const payments = usePaymentsMode();

  const load = useCallback(() => Promise.all([inquiriesApi.get(id), bidsApi.listForInquiry(id)])
    .then(([i, b]) => { setInquiry(i.inquiry); setBids(b.bids); })
    .catch((e) => setError(getErrorMessage(e, "Couldn't load request"))), [id]);

  useEffect(() => { load(); }, [load]);
  // New quotes arrive as notifications; poll lightly while the request is open.
  useEffect(() => {
    if (!inquiry?.isActive) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [inquiry?.isActive, load, socket]);

  const sorted = useMemo(() => [...(bids ?? [])].sort((a, b) =>
    sort === "price" ? parseFloat(a.price) - parseFloat(b.price)
    : sort === "eta" ? a.etaDays - b.etaDays
    : parseFloat(b.supplierRating ?? "0") - parseFloat(a.supplierRating ?? "0")
  ), [bids, sort]);
  const best = useMemo(() => Math.min(...(bids ?? []).map((b) => parseFloat(b.price))), [bids]);

  async function accept(b: Bid) {
    setAccepting(b.id);
    try {
      const r = await bidsApi.accept(b.id);
      router.push(`/pay/${r.checkoutId}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't accept this quote"));
      setAccepting(null);
    }
  }

  if (error) return <EmptyState title="Request not found" body={error} />;
  if (!inquiry || !bids) return <div className="max-w-[880px] mx-auto px-4 py-8 space-y-3"><Skel className="h-28" /><Skel className="h-36" /><Skel className="h-36" /></div>;

  return (
    <div className="bg-paper-3 min-h-full">
      <div className="max-w-[880px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link href="/buyer/requests" className="text-[13px] font-bold text-ink-3">← My requests</Link>
        <div className="card p-5 mt-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-bold text-ink-3">{inquiry.make} {inquiry.model} {inquiry.year}</div>
              <h1 className="text-[24px] font-extrabold tracking-tight">{inquiry.partName}</h1>
              {inquiry.description && <p className="text-[14px] text-ink-2 mt-1">{inquiry.description}</p>}
            </div>
            {inquiry.isActive ? <StatusChip tone="green">● Live · {bids.length} quote{bids.length === 1 ? "" : "s"}</StatusChip> : <StatusChip tone="grey">Closed</StatusChip>}
          </div>
          <div className="text-[12.5px] text-ink-3 font-semibold mt-3">Posted {formatDistanceToNowStrict(new Date(inquiry.createdAt))} ago · sent to verified sellers who stock {inquiry.make}</div>
        </div>

        {bids.length > 1 && (
          <div className="mt-5 flex items-center gap-2">
            <span className="text-[13px] font-bold text-ink-3 mr-1">Sort</span>
            {([["price", "Lowest price"], ["rating", "Best rated"], ["eta", "Fastest"]] as const).map(([k, l]) => <button key={k} className="chip" data-on={sort === k} onClick={() => setSort(k)}>{l}</button>)}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {!bids.length && (
            <div className="card p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full border-4 border-[color:var(--accent-wash)] border-t-[color:var(--accent)] animate-spin" />
              <div className="mt-4 text-[17px] font-extrabold">Sellers are checking their shelves…</div>
              <p className="text-[14px] text-ink-3 mt-1">Most requests get a first quote within minutes. We&apos;ll notify you.</p>
            </div>
          )}
          {sorted.map((b) => {
            const isBest = parseFloat(b.price) === best && bids.length > 1;
            const accepted = b.status === "accepted";
            return (
              <div key={b.id} className={clsx("card p-5", isBest && "ring-2 ring-[color:var(--success)]")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-extrabold">{b.supplierBusinessName ?? b.supplierName}</span>
                      {isBest && <StatusChip tone="green">Best price</StatusChip>}
                      {accepted && <StatusChip tone="brand">Accepted</StatusChip>}
                    </div>
                    <div className="mt-1 flex items-center gap-3 flex-wrap text-[12.5px] font-semibold text-ink-3">
                      <RatingPill rating={b.supplierRating} count={b.supplierReviewCount} />
                      {b.supplierCity && <span>{b.supplierCity}</span>}
                      <span>{b.completedOrders ?? 0} orders delivered</span>
                    </div>
                  </div>
                  <div className="text-right"><div className="price text-[22px]">{inr(b.price)}</div><div className="text-[12px] text-ink-3 font-semibold">incl. GST & delivery</div></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="chip !h-7 !text-[12px]">{COND[b.condition] ?? b.condition}</span>
                  {b.brand && <span className="chip !h-7 !text-[12px]">{b.brand}{b.partNumber ? ` · #${b.partNumber}` : ""}</span>}
                  <span className="chip !h-7 !text-[12px]">{b.etaDays <= 1 ? "Delivers tomorrow" : `Delivers in ${b.etaDays} days`}</span>
                  {b.warrantyMonths > 0 && <span className="chip !h-7 !text-[12px]">{b.warrantyMonths}-month warranty</span>}
                </div>
                {b.notes && <p className="mt-3 text-[13.5px] text-ink-2 bg-paper-2 rounded-[12px] p-3">“{b.notes}”</p>}
                {inquiry.isActive && b.status === "pending" && payments === "off" && (
                  <div className="mt-4 rounded-[12px] bg-paper-2 text-[13px] font-bold text-ink-2 p-3 text-center">{PAYMENTS_SOON} You&apos;ll be able to accept this quote and pay safely here.</div>
                )}
                {inquiry.isActive && b.status === "pending" && payments === "mock" && (
                  <button disabled={!!accepting} onClick={() => accept(b)} className={clsx("mt-4 w-full h-12 rounded-[14px] font-extrabold fms-press disabled:opacity-50", isBest ? "bg-[color:var(--accent)] text-white" : "bg-paper border-2 border-ink text-ink")}>
                    {accepting === b.id ? "Creating order…" : `Accept & pay ${inr(b.price)}`}
                  </button>
                )}
                {accepted && b.orderId && <Link href={`/buyer/orders/${b.orderId}`} className="mt-4 block text-center text-[14px] font-extrabold text-[color:var(--accent)]">Track this order →</Link>}
              </div>
            );
          })}
        </div>
        {bids.length > 0 && inquiry.isActive && <p className="mt-5 text-[12.5px] text-ink-3 text-center">Paying on FindMySpare keeps you covered: escrow, fit-or-free-return and a record in your Vehicle Passport.</p>}
      </div>
    </div>
  );
}
