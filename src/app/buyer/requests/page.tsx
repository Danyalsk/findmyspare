"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { inquiriesApi } from "@/lib/api";
import type { Inquiry } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

const statusConfig = {
  pending: { label: "Waiting", variant: "default" as const },
  responded: { label: "Bids in", variant: "ok" as const },
  closed: { label: "Closed", variant: "default" as const },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function RequestsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await inquiriesApi.mine();
        if (!cancelled) setInquiries(res.inquiries);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load requests"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const open = useMemo(() => inquiries.filter((i) => i.isActive), [inquiries]);
  const closed = useMemo(() => inquiries.filter((i) => !i.isActive), [inquiries]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <div className="serif text-[28px] leading-[1.05]">My requests</div>
          <div className="text-[11px] text-ink-3 mt-1">
            {open.length} open · {closed.length} closed
          </div>
        </div>
        <Link href="/buyer/requests/new">
          <div className="w-10 h-10 rounded-[12px] bg-ink flex items-center justify-center active:scale-90 transition-transform">
            <PlusIcon size={20} className="text-paper" />
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="px-5 pt-20 text-center text-[13px] text-ink-3">Loading requests...</div>
      ) : error ? (
        <div className="px-5 pt-20 text-center text-[13px] text-danger">{error}</div>
      ) : inquiries.length === 0 ? (
        <div className="px-5 pt-20 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-paper-2 border border-line flex items-center justify-center">
            <PlusIcon size={28} className="text-ink-3" />
          </div>
          <div>
            <div className="font-semibold text-[15px]">No requests yet</div>
            <div className="text-[12px] text-ink-3 mt-1">Post your first inquiry and get bids from suppliers</div>
          </div>
          <Link href="/buyer/requests/new">
            <Button variant="primary">Post first request</Button>
          </Link>
        </div>
      ) : (
        <div className="px-5 pt-5 pb-6 flex flex-col gap-5">
          {open.length > 0 && (
            <div>
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">OPEN</div>
              <div className="flex flex-col gap-2.5">
                {open.map((inquiry) => {
                  const cfg = statusConfig[inquiry.status];
                  return (
                    <Link key={inquiry.id} href={`/buyer/requests/${inquiry.id}`}>
                      <Card className="!p-4 cursor-pointer hover:border-accent/40 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[14px] leading-[1.2]">{inquiry.partName}</div>
                            <div className="text-[11px] text-ink-3 mt-0.5">
                              {inquiry.make} {inquiry.model} · {inquiry.year}
                            </div>
                          </div>
                          <Chip variant={cfg.variant}>{cfg.label}</Chip>
                        </div>

                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line">
                          {(inquiry.bidCount || 0) > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                              <span className="text-[12px] font-medium text-accent-ink">
                                {inquiry.bidCount} bid{inquiry.bidCount !== 1 ? "s" : ""} received
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-3">Waiting for bids...</span>
                          )}
                          <span className="mono text-[10px] text-ink-3 ml-auto">{timeAgo(inquiry.createdAt)}</span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {closed.length > 0 && (
            <div>
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em] mb-2.5">CLOSED</div>
              <div className="flex flex-col gap-2.5">
                {closed.map((inquiry) => (
                  <Link key={inquiry.id} href={`/buyer/requests/${inquiry.id}`}>
                    <Card className="!p-4 cursor-pointer hover:border-accent/40 transition-colors opacity-60">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-medium text-[14px]">{inquiry.partName}</div>
                          <div className="text-[11px] text-ink-3 mt-0.5">
                            {inquiry.make} {inquiry.model} · {inquiry.year}
                          </div>
                        </div>
                        <Chip variant="default">Closed</Chip>
                      </div>
                      <div className="text-[11px] text-ink-3 mt-2">
                        {inquiry.bidCount || 0} bids · {timeAgo(inquiry.createdAt)}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/buyer/requests/new" className="mt-2">
            <Button variant="default" dashed block>
              + Post another request
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
