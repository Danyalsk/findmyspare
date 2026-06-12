"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { disputesApi } from "@/lib/api";
import type { IssueType } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const taClass =
  "w-full px-3.5 py-2.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass = "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

const ISSUES: { value: IssueType; label: string }[] = [
  { value: "wrong_part", label: "Wrong part received" },
  { value: "damaged", label: "Item arrived damaged" },
  { value: "not_as_described", label: "Not as described" },
  { value: "missing_parts", label: "Parts missing" },
  { value: "not_delivered", label: "Never delivered" },
  { value: "other", label: "Other" },
];

export default function RaiseDisputePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [issueType, setIssueType] = useState<IssueType>("wrong_part");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (description.trim().length < 10) {
      toast.error("Describe the issue (at least 10 characters)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await disputesApi.raise(params.id, { issueType, description: description.trim() });
      toast.success("Dispute raised");
      router.replace(`/disputes/${res.dispute.id}`);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to raise dispute"));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Raise a dispute" backHref={`/buyer/orders/${params.id}`} />
      <div className="px-5 pb-8 max-w-xl w-full mx-auto space-y-4">
        <Card className="!p-4 space-y-4">
          <div>
            <label className={labelClass}>What went wrong?</label>
            <select className={fieldClass} value={issueType} onChange={(e) => setIssueType(e.target.value as IssueType)}>
              {ISSUES.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Describe the issue</label>
            <textarea
              className={taClass}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what happened so we can help resolve it…"
            />
          </div>
        </Card>

        <div className="text-[12px] text-ink-3 px-1">
          Raising a dispute pauses the order. Your escrow stays held until it&apos;s resolved.
        </div>

        <Button variant="primary" block size="lg" onClick={submit} loading={submitting}>
          Submit dispute
        </Button>
      </div>
    </div>
  );
}
