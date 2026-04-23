"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ShieldIcon } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/constants";
import { bidsApi, inquiriesApi } from "@/lib/api";
import type { Inquiry } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

const conditions = [
  { value: "oem", label: "OEM Genuine" },
  { value: "oem_equivalent", label: "OEM Equivalent" },
  { value: "used", label: "Used / Refurb" },
];

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const inquiryId = params.id;
  const router = useRouter();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loadingInquiry, setLoadingInquiry] = useState(true);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("oem");
  const [warrantyMonths, setWarrantyMonths] = useState("6");
  const [etaDays, setEtaDays] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingInquiry(true);
      setError("");
      try {
        const res = await inquiriesApi.get(inquiryId);
        if (!cancelled) setInquiry(res.inquiry);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load inquiry"));
      } finally {
        if (!cancelled) setLoadingInquiry(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  async function handleSubmit() {
    const priceNum = parseFloat(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setLoading(true);
    try {
      await bidsApi.createForInquiry(inquiryId, {
        price,
        condition,
        warrantyMonths: parseInt(warrantyMonths, 10),
        etaDays: parseInt(etaDays, 10),
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
      toast.success("Bid submitted.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not submit bid."));
    } finally {
      setLoading(false);
    }
  }

  if (loadingInquiry) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading inquiry...</div>;
  }

  if (error || !inquiry) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error || "Inquiry not found"}</div>;
  }

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar backHref="/supplier/leads" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-wash flex items-center justify-center">
            <ShieldIcon size={28} className="text-accent-ink" />
          </div>
          <div className="serif text-[26px] leading-[1.1]">Bid submitted!</div>
          <div className="text-[13px] text-ink-3 leading-[1.5]">
            Buyer will review your bid for <span className="font-medium text-ink">{inquiry.partName}</span>.
          </div>
          <Button variant="primary" onClick={() => router.push("/supplier/leads")}>Back to leads</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      <TopBar
        title={inquiry.partName}
        subtitle={`${inquiry.make} ${inquiry.model} · ${inquiry.year}`}
        backHref="/supplier/leads"
        rightAction={
          <div className="bg-accent-wash text-accent-ink text-[11px] font-medium px-2.5 py-1 rounded-full">
            {inquiry.bidCount || 0} bids
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
          <div className="mt-3 pt-3 border-t border-line flex items-center gap-4 text-[11px]">
            <div>
              <span className="text-ink-3">Buyer: </span>
              <span className="font-medium">{inquiry.buyerName || "Buyer"}</span>
            </div>
            <div>
              <span className="text-ink-3">Status: </span>
              <span className="font-medium">{inquiry.status}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Chip>{inquiry.bidCount || 0} bids so far</Chip>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">YOUR BID</div>

          <div>
            <label className="text-[11px] text-ink-3 mb-1.5 block">Price (₹)</label>
            <div className="flex items-center gap-2.5 bg-paper-2 border border-line rounded-[12px] px-3.5 h-12 focus-within:border-ink transition-colors">
              <span className="mono text-[13px] text-ink-3">₹</span>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 3200"
                className="flex-1 bg-transparent text-[15px] font-semibold mono outline-none placeholder:text-ink-3 placeholder:font-normal"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-ink-3 mb-1.5 block">Condition</label>
            <div className="flex flex-col gap-1.5">
              {conditions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  className={`p-3 rounded-[10px] border text-left text-[13px] transition-all ${
                    condition === c.value ? "border-ink bg-paper font-medium" : "border-line bg-paper text-ink-3"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="text-[11px] text-ink-3 mb-1.5 block">Warranty (months)</label>
              <select
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-line bg-paper-2 px-3 text-[13px] outline-none focus:border-ink transition-colors"
              >
                {[0, 1, 3, 6, 12, 24].map((m) => (
                  <option key={m} value={m}>{m === 0 ? "No warranty" : `${m} months`}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-ink-3 mb-1.5 block">Ships in (days)</label>
              <select
                value={etaDays}
                onChange={(e) => setEtaDays(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-line bg-paper-2 px-3 text-[13px] outline-none focus:border-ink transition-colors"
              >
                {[1, 2, 3, 5, 7].map((d) => (
                  <option key={d} value={d}>{d === 1 ? "Today" : `${d} days`}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-ink-3 mb-1.5 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details"
              className="w-full rounded-[12px] border border-line bg-paper-2 px-3.5 py-2.5 text-[13px] resize-none outline-none focus:border-ink transition-colors"
              rows={3}
            />
          </div>

          <Card variant="accent" className="!p-3">
            <div className="flex gap-2.5 items-start">
              <ShieldIcon size={16} className="text-accent-ink flex-shrink-0 mt-0.5" />
              <div className="text-xs text-accent-ink leading-[1.4]">
                <span className="font-semibold">Secure payment.</span>{" "}
                {price ? `${formatPrice(parseFloat(price) || 0)} ` : "Your amount "}
                will be held in escrow.
              </div>
            </div>
          </Card>

          <Button variant="primary" block loading={loading} onClick={handleSubmit}>
            Submit bid{price ? ` · ${formatPrice(parseFloat(price) || 0)}` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
