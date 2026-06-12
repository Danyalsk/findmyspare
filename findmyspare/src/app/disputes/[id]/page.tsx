"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { disputesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import type { Dispute, DisputeStatus, OrderEntity } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const taClass =
  "w-full px-3.5 py-2.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

const ISSUE_LABEL: Record<string, string> = {
  wrong_part: "Wrong part",
  damaged: "Damaged",
  not_as_described: "Not as described",
  missing_parts: "Missing parts",
  not_delivered: "Not delivered",
  other: "Other",
};

const STATUS_META: Record<DisputeStatus, { label: string; variant: "ok" | "warn" | "danger" | "default" }> = {
  open: { label: "Open", variant: "warn" },
  under_review: { label: "Under review", variant: "warn" },
  return_approved: { label: "Return approved", variant: "ok" },
  return_rejected: { label: "Return rejected", variant: "danger" },
  resolved: { label: "Resolved", variant: "ok" },
  closed: { label: "Closed", variant: "default" },
};

export default function DisputeThreadPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [order, setOrder] = useState<OrderEntity | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await disputesApi.get(params.id);
      setDispute(res.dispute);
      setOrder(res.order);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load dispute"));
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(action?: "approve_return" | "reject" | "confirm_return") {
    setBusy(true);
    try {
      await disputesApi.respond(params.id, {
        ...(action ? { action } : {}),
        ...(response.trim() ? { supplierResponse: response.trim() } : {}),
      });
      toast.success("Response sent");
      setResponse("");
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to respond"));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error}</div>;
  if (!dispute) return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;

  const meta = STATUS_META[dispute.status];
  const isSupplier = !!order && user?.id === order.supplierId;
  const canRespond = isSupplier && (dispute.status === "open" || dispute.status === "under_review");
  const canConfirmReturn = isSupplier && dispute.status === "return_approved";

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Dispute"
        backHref={order ? (isSupplier ? `/supplier/orders/${order.id}` : `/buyer/orders/${order.id}`) : "/buyer/orders"}
      />
      <div className="px-5 pb-8 max-w-xl w-full mx-auto space-y-4">
        <Card className="!p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-ink-3">Issue</div>
            <div className="text-[14px] font-medium">{ISSUE_LABEL[dispute.issueType] ?? dispute.issueType}</div>
          </div>
          <Chip variant={meta.variant} size="md" dot>{meta.label}</Chip>
        </Card>

        {/* Buyer's complaint */}
        <div>
          <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider mb-2">Buyer&apos;s report</div>
          <Card className="!p-4">
            <p className="text-[13px] leading-relaxed text-ink-2 whitespace-pre-wrap">{dispute.description}</p>
            <div className="text-[10px] text-ink-3 mt-2">{new Date(dispute.createdAt).toLocaleString()}</div>
          </Card>
        </div>

        {/* Supplier response */}
        {dispute.supplierResponse && (
          <div>
            <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider mb-2">Supplier&apos;s response</div>
            <Card className="!p-4">
              <p className="text-[13px] leading-relaxed text-ink-2 whitespace-pre-wrap">{dispute.supplierResponse}</p>
            </Card>
          </div>
        )}

        {/* Supplier actions */}
        {canRespond && (
          <Card className="!p-4 space-y-3">
            <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wider">Respond</div>
            <textarea
              className={taClass}
              rows={4}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Explain or offer a resolution…"
            />
            <div className="flex flex-col gap-2">
              <Button variant="primary" block onClick={() => respond("approve_return")} loading={busy}>
                Approve return &amp; refund
              </Button>
              <div className="flex gap-2">
                <Button variant="default" block onClick={() => respond()} loading={busy}>
                  Send reply
                </Button>
                <Button variant="default" block onClick={() => respond("reject")} loading={busy}>
                  Reject claim
                </Button>
              </div>
            </div>
          </Card>
        )}

        {canConfirmReturn && (
          <Button variant="primary" block size="lg" onClick={() => respond("confirm_return")} loading={busy}>
            Confirm return received → refund buyer
          </Button>
        )}

        {!isSupplier && dispute.status === "open" && (
          <div className="text-[12px] text-ink-3 text-center">Waiting for the supplier to respond.</div>
        )}
      </div>
    </div>
  );
}
