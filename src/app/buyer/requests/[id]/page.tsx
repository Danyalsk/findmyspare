"use client";

import { TopBar } from "@/components/layout/TopBar";
import { BidCard } from "@/components/features/BidCard";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   Live Bids — Screen 06
   Part request with streaming supplier bids
   ═══════════════════════════════════════════════════════ */

const bids = [
  {
    rank: 1,
    supplier: "Kirinyaga Parts Ltd.",
    initials: "KP",
    avatarColor: "oklch(0.55 0.10 30)",
    rating: 4.9,
    price: "₹3,200",
    description: "OEM genuine · 6-mo warranty · Ships today",
    isBest: true,
  },
  {
    rank: 2,
    supplier: "BestSpares India",
    initials: "BS",
    avatarColor: "oklch(0.55 0.10 200)",
    rating: 4.6,
    price: "₹2,850",
    description: "Aftermarket ceramic · 3-mo warranty · 2-day ship",
    isBest: false,
  },
  {
    rank: 3,
    supplier: "Universal Auto Co.",
    initials: "UA",
    avatarColor: "oklch(0.55 0.10 140)",
    rating: 4.7,
    price: "₹3,950",
    description: "Genuine + sensor kit · 12-mo warranty · Free delivery",
    isBest: false,
  },
  {
    rank: 4,
    supplier: "Metro Parts Hub",
    initials: "MP",
    avatarColor: "oklch(0.55 0.10 280)",
    rating: 4.3,
    price: "₹2,400",
    description: "Refurb OEM · as-is · Ships 3-5 days",
    isBest: false,
  },
];

export default function LiveBidsPage() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* Top bar */}
      <TopBar
        title="Part request"
        subtitle="REQ-2041"
        backHref="/buyer"
        rightAction={
          <div className="bg-accent-wash text-accent-ink text-[11px] font-medium px-2.5 py-1 rounded-full">
            7 bids
          </div>
        }
      />

      <div className="px-5 pb-5">
        {/* Request summary card */}
        <Card className="!p-3 flex gap-3 mb-5">
          <div
            className="w-[60px] h-[60px] rounded-[10px] flex-shrink-0"
            style={{
              background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium">Front brake caliper</div>
            <div className="text-[11px] text-ink-3 mt-0.5">Maruti Swift ZXi+ · 2018</div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Chip>₹2K – ₹6K budget</Chip>
              <Chip>New only</Chip>
            </div>
          </div>
        </Card>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-ink-3">7 suppliers bidding · live</span>
          <span className="mono text-[10px] text-ink-3 ml-auto tracking-[0.08em]">
            CLOSES IN 3H 42M
          </span>
        </div>

        {/* Bid list */}
        <div className="flex flex-col gap-2.5">
          {bids.map((b) => (
            <BidCard
              key={b.rank}
              rank={b.rank}
              supplier={b.supplier}
              initials={b.initials}
              avatarColor={b.avatarColor}
              rating={b.rating}
              price={b.price}
              description={b.description}
              isBest={b.isBest}
              href={`/buyer/product/${b.rank}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
