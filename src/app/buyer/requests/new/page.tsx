"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DnaLoader } from "@/components/ui/DnaLoader";
import { vehicleData } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { inquiriesApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export default function NewRequestPage() {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [partName, setPartName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const makes = Object.keys(vehicleData);
  const models = make ? Object.keys(vehicleData[make] || {}) : [];
  const years = make && model ? vehicleData[make]?.[model] || [] : [];

  const isValid = make && model && year && partName.trim().length >= 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await inquiriesApi.create({
        partName: partName.trim(),
        make,
        model,
        year,
        description: description.trim() || undefined,
      });
      toast.success("Inquiry posted.");
      router.push("/buyer/requests");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to post inquiry."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      {loading && <DnaLoader fullscreen size={80} label="POSTING INQUIRY…" />}
      <div className="px-5 pt-4 flex items-center gap-3">
        <Link
          href="/buyer/requests"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div>
          <div className="serif text-[24px] leading-[1.05]">Post a request</div>
          <div className="text-[11px] text-ink-3">Suppliers will bid on your inquiry</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-5 pb-8 flex flex-col gap-4 flex-1">
        <Card className="!p-4 flex flex-col gap-3">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">VEHICLE</div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-2">Make</label>
            <select
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setModel("");
                setYear("");
              }}
              className="h-11 rounded-[10px] bg-paper-2 border border-line px-3 text-[13px] text-ink w-full appearance-none"
              required
            >
              <option value="">Select make</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-ink-2">Model</label>
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setYear("");
                }}
                disabled={!make}
                className="h-11 rounded-[10px] bg-paper-2 border border-line px-3 text-[13px] text-ink w-full appearance-none disabled:opacity-40"
                required
              >
                <option value="">Model</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-ink-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!model}
                className="h-11 rounded-[10px] bg-paper-2 border border-line px-3 text-[13px] text-ink w-full appearance-none disabled:opacity-40"
                required
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="!p-4 flex flex-col gap-3">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">PART DETAILS</div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-2">Part name *</label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="e.g. Front brake caliper"
              className="h-11 rounded-[10px] bg-paper-2 border border-line px-3 text-[13px] text-ink placeholder:text-ink-3 w-full"
              required
              minLength={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-2">
              Additional details <span className="text-ink-3 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="OEM number, condition preference, urgency"
              rows={3}
              className="rounded-[10px] bg-paper-2 border border-line px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-3 w-full resize-none"
            />
          </div>
        </Card>

        <div className="bg-accent-wash rounded-[12px] px-4 py-3 flex flex-col gap-1.5">
          <div className="text-[12px] font-semibold text-accent-ink">How this works</div>
          <div className="text-[11px] text-accent-ink opacity-85 space-y-0.5">
            <div>1. Post your request</div>
            <div>2. Suppliers submit bids</div>
            <div>3. Pick one and pay via escrow</div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Button type="submit" variant="primary" block loading={loading} disabled={!isValid}>
            Post inquiry
          </Button>
        </div>
      </form>
    </div>
  );
}
