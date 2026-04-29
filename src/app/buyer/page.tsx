"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchIcon, PlusIcon, ArrowRightIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/store";
import { inquiriesApi } from "@/lib/api";
import type { Inquiry } from "@/lib/types";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function BuyerHomePage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const [requests, setRequests] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await inquiriesApi.mine();
        if (!cancelled) setRequests(res.inquiries);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const open = requests.filter((r) => r.isActive);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-5">
        <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">FINDMYSPARE</div>
        <div className="font-semibold text-[17px] mt-0.5">
          {timeGreeting()}, {firstName}
        </div>
      </div>

      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        <Link
          href="/search"
          className="p-4 rounded-[14px] bg-paper border border-line flex flex-col items-start gap-2 hover:border-accent/40 transition-colors active:scale-[0.97]"
        >
          <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center text-accent-ink">
            <SearchIcon size={18} />
          </div>
          <div className="text-[13px] font-medium leading-[1.2]">Browse parts</div>
          <div className="text-[11px] text-ink-3">From verified suppliers</div>
        </Link>

        <Link
          href="/buyer/requests/new"
          className="p-4 rounded-[14px] bg-ink text-paper flex flex-col items-start gap-2 active:scale-[0.97]"
        >
          <div className="w-9 h-9 rounded-[10px] bg-white/10 flex items-center justify-center">
            <PlusIcon size={18} />
          </div>
          <div className="text-[13px] font-medium leading-[1.2]">Post a request</div>
          <div className="text-[11px] opacity-70">Suppliers will bid</div>
        </Link>
      </div>

      <div className="px-5 pt-7 flex items-baseline justify-between">
        <div className="serif text-[22px]">Your open requests</div>
        <Link
          href="/buyer/requests"
          className="text-[12px] text-accent-ink hover:underline flex items-center gap-1"
        >
          View all <ArrowRightIcon size={12} />
        </Link>
      </div>

      <div className="px-5 pt-2.5 pb-8 flex flex-col gap-2">
        {loading ? (
          <div className="text-[13px] text-ink-3 py-6 text-center">Loading…</div>
        ) : open.length === 0 ? (
          <Card className="text-center !p-6">
            <div className="text-[13px] font-medium mb-1">No open requests</div>
            <div className="text-[11px] text-ink-3 mb-3">
              Post one and verified suppliers will bid.
            </div>
            <Link
              href="/buyer/requests/new"
              className="text-accent-ink text-[12px] font-medium hover:underline"
            >
              Post a request →
            </Link>
          </Card>
        ) : (
          open.slice(0, 5).map((r) => (
            <Link key={r.id} href={`/buyer/requests/${r.id}`}>
              <Card className="!p-3.5 flex items-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                <div
                  className="w-12 h-12 rounded-[10px] flex-shrink-0"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{r.partName}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5 truncate">
                    {r.make} {r.model} · {r.year}
                  </div>
                </div>
                <Chip variant="ok">{r.bidCount ?? 0} bids</Chip>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
