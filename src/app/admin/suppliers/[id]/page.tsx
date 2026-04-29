"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { adminApi } from "@/lib/api/admin";
import type { User } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function AdminSupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getSupplier(id);
      setSupplier(res.supplier);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function approve() {
    setActing(true);
    try {
      await adminApi.approve(id);
      toast.success("Supplier approved");
      router.replace("/admin");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Approval failed"));
    } finally {
      setActing(false);
    }
  }

  async function reject() {
    if (!reason.trim()) return toast.error("Reason required");
    setActing(true);
    try {
      await adminApi.reject(id, reason.trim());
      toast.success("Supplier rejected");
      router.replace("/admin");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Rejection failed"));
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;
  }
  if (!supplier) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">Not found</div>;
  }

  const status = supplier.verificationStatus || "not_submitted";
  const canAct = status === "pending" || status === "rejected";
  const cert = supplier.gstCertificateUrl;
  const isPdf = cert?.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex-1 flex flex-col pb-32">
      <TopBar title="Supplier review" backHref="/admin" />

      <div className="px-5 max-w-3xl w-full mx-auto space-y-4">
        <Card className="!p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="serif text-[22px] leading-tight">{supplier.businessName || supplier.name}</div>
              <div className="text-[12px] text-ink-3 mt-1">{supplier.name} · {supplier.email}</div>
            </div>
            <Chip
              variant={
                status === "approved" ? "ok" :
                status === "pending" ? "warn" :
                status === "rejected" ? "danger" : "default"
              }
            >
              {status}
            </Chip>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs mono uppercase tracking-[0.06em] text-ink-3 mb-3">Business details</div>
          <Row label="GSTIN" value={supplier.gstNumber} />
          <Row label="PAN" value={supplier.panNumber} />
          <Row label="Phone" value={supplier.phone ? `+91 ${supplier.phone}` : null} />
          {supplier.businessAddress && (
            <Row
              label="Address"
              value={[
                supplier.businessAddress.line1,
                supplier.businessAddress.line2,
                supplier.businessAddress.city,
                supplier.businessAddress.state,
                supplier.businessAddress.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          )}
        </Card>

        {cert && (
          <Card className="!p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs mono uppercase tracking-[0.06em] text-ink-3">GST certificate</div>
              <a
                href={cert}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-accent-ink hover:underline"
              >
                Open in new tab
              </a>
            </div>
            <div className="rounded-[10px] overflow-hidden border border-line bg-paper-2">
              {isPdf ? (
                <iframe src={cert} className="w-full h-[480px]" title="GST certificate" />
              ) : (
                <img src={cert} alt="GST certificate" className="w-full max-h-[600px] object-contain" />
              )}
            </div>
          </Card>
        )}

        {status === "rejected" && supplier.rejectionReason && (
          <Card variant="accent" className="!p-3 !bg-danger-wash !border-transparent">
            <div className="text-xs mono uppercase tracking-[0.06em] text-[oklch(0.45_0.15_25)] mb-1">
              Last rejection reason
            </div>
            <div className="text-sm text-[oklch(0.45_0.15_25)]">{supplier.rejectionReason}</div>
          </Card>
        )}
      </div>

      {canAct && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-3.5 border-t border-line bg-paper z-10">
          <div className="max-w-3xl mx-auto">
            {showReject ? (
              <div className="space-y-2">
                <textarea
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-paper-2 border border-line text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  rows={2}
                  placeholder="Reason for rejection (shown to supplier)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1 !h-10 !text-[13px]" onClick={() => setShowReject(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1 !h-10 !text-[13px]" loading={acting} onClick={reject}>
                    Confirm reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 !h-11 !text-[13px] !text-danger"
                  onClick={() => setShowReject(true)}
                >
                  Reject
                </Button>
                <Button variant="primary" className="flex-1 !h-11 !text-[13px]" loading={acting} onClick={approve}>
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-line text-[13px] last:border-b-0">
      <span className="text-ink-3">{label}</span>
      <span className="mono text-xs text-right">{value || "—"}</span>
    </div>
  );
}
