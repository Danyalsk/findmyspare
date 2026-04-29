"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { StarIcon } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/constants";
import { bidsApi, inquiriesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { buildWhatsAppLink, waTemplates } from "@/lib/whatsapp";
import type { Bid, Inquiry } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

const conditionLabel: Record<string, string> = {
  oem: "OEM Genuine",
  oem_equivalent: "OEM Equivalent",
  used: "Used / Refurb",
};

const avatarColors = [
  "oklch(0.55 0.10 30)",
  "oklch(0.55 0.10 200)",
  "oklch(0.55 0.10 140)",
  "oklch(0.55 0.10 280)",
];

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const inquiryId = params.id;
  const buyer = useAuthStore((s) => s.user);

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [inquiryRes, bidsRes] = await Promise.all([
          inquiriesApi.get(inquiryId),
          bidsApi.listForInquiry(inquiryId),
        ]);

        if (cancelled) return;
        setInquiry(inquiryRes.inquiry);
        setBids(bidsRes.bids);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load request"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  const sortedBids = useMemo(
    () => [...bids].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
    [bids]
  );

  function contactBidder(bid: Bid) {
    if (!inquiry) return;
    if (!bid.supplierPhone) {
      toast.error("Supplier phone unavailable");
      return;
    }
    const msg = waTemplates.bidFollowUp({
      buyerName: buyer?.name || "a buyer",
      partName: inquiry.partName,
      vehicle: `${inquiry.make} ${inquiry.model} ${inquiry.year}`,
      bidPrice: bid.price,
    });
    window.open(buildWhatsAppLink(bid.supplierPhone, msg), "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading request...</div>;
  }

  if (error || !inquiry) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error || "Request not found"}</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      <TopBar
        title={inquiry.partName}
        subtitle={`${inquiry.make} ${inquiry.model} · ${inquiry.year}`}
        backHref="/buyer/requests"
        rightAction={
          <div className="bg-accent-wash text-accent-ink text-[11px] font-medium px-2.5 py-1 rounded-full">
            {sortedBids.length} bids
          </div>
        }
      />

      <div className="px-5 pb-8 flex flex-col gap-4">
        <Card className="!p-4">
          <div className="flex gap-3">
            <div
              className="w-14 h-14 rounded-[10px] flex-shrink-0"
              style={{ background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)" }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[14px]">{inquiry.partName}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">
                {inquiry.make} {inquiry.model} · {inquiry.year}
              </div>
              {inquiry.description && (
                <div className="text-[11px] text-ink-3 mt-1.5 leading-[1.4]">{inquiry.description}</div>
              )}
            </div>
          </div>
        </Card>

        {inquiry.isActive && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-ink-3">
              {sortedBids.length} supplier{sortedBids.length !== 1 ? "s" : ""} bidding · sorted by price
            </span>
          </div>
        )}

        {sortedBids.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-[13px] text-ink-3">No bids yet.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedBids.map((bid, idx) => {
              const isBest = idx === 0;
              return (
                <Card
                  key={bid.id}
                  className={`!p-4 flex flex-col gap-3 ${isBest ? "border-[1.5px] !border-ink" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-[8px] flex items-center justify-center mono text-xs font-semibold flex-shrink-0 ${
                        isBest ? "bg-ink text-paper" : "bg-paper-2 text-ink"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={(bid.supplierName || "SP").slice(0, 2).toUpperCase()}
                          size="sm"
                          color={avatarColors[idx % 4]}
                        />
                        <div>
                          <div className="text-[13px] font-medium leading-[1.2]">
                            {bid.supplierBusinessName || bid.supplierName || "Supplier"}
                          </div>
                          <div className="text-[10px] text-ink-3 flex items-center gap-1">
                            <StarIcon size={10} className="text-ink" />
                            {(bid.completedOrders || 0).toLocaleString("en-IN")} orders
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="mono text-[17px] font-semibold">{formatPrice(parseFloat(bid.price))}</div>
                      {isBest && <Chip variant="ok">BEST PRICE</Chip>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Chip>{conditionLabel[bid.condition] ?? bid.condition}</Chip>
                    {bid.warrantyMonths > 0 && <Chip>{bid.warrantyMonths}mo warranty</Chip>}
                    <Chip>{bid.etaDays === 1 ? "Ships today" : `Ships in ${bid.etaDays} days`}</Chip>
                  </div>

                  {bid.notes && <div className="text-[11px] text-ink-3 leading-[1.4]">{bid.notes}</div>}

                  {inquiry.isActive && bid.status === "pending" && (
                    <Button
                      variant={isBest ? "primary" : "default"}
                      block
                      className="!h-9 !text-[12px]"
                      onClick={() => contactBidder(bid)}
                      disabled={!bid.supplierPhone}
                    >
                      Contact supplier on WhatsApp
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
