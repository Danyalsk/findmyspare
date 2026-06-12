"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { adminApi } from "@/lib/api/admin";
import type { AdminUserRow } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getUser(id);
      setUser(res.user);
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

  async function toggleBlock() {
    if (!user) return;
    const next = !user.isBlocked;
    if (!confirm(next ? `Block ${user.name}?` : `Unblock ${user.name}?`)) return;
    setActing(true);
    try {
      const res = await adminApi.blockUser(id, next);
      setUser(res.user);
      toast.success(next ? "User blocked" : "User unblocked");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Action failed"));
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;
  }
  if (!user) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">Not found</div>;
  }

  return (
    <div className="flex-1 flex flex-col pb-32">
      <TopBar title="User detail" backHref="/admin/users" />

      <div className="px-5 max-w-3xl w-full mx-auto space-y-4">
        <Card className="!p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="serif text-[24px] leading-tight">{user.businessName || user.name}</div>
              <div className="text-[12px] text-ink-3 mt-1">{user.name} · {user.email}</div>
              {user.phone && <div className="text-[12px] text-ink-3 mt-0.5">+91 {user.phone}</div>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Chip variant={user.role === "admin" ? "ok" : user.role === "supplier" ? "warn" : "default"}>
                {user.role}
              </Chip>
              {user.isBlocked && <Chip variant="danger">Blocked</Chip>}
            </div>
          </div>
        </Card>

        {user.role === "supplier" && (
          <Card className="!p-4">
            <div className="text-xs mono uppercase tracking-[0.06em] text-ink-3 mb-2">Supplier</div>
            <div className="flex items-center justify-between text-[13px] py-2 border-b border-line">
              <span className="text-ink-3">Verification</span>
              <Chip
                variant={
                  user.verificationStatus === "approved" ? "ok" :
                  user.verificationStatus === "pending" ? "warn" :
                  user.verificationStatus === "rejected" ? "danger" : "default"
                }
              >
                {user.verificationStatus || "—"}
              </Chip>
            </div>
            <Link
              href={`/admin/suppliers/${user.id}`}
              className="text-[12px] text-accent-ink hover:underline mt-3 inline-block"
            >
              Open supplier review →
            </Link>
          </Card>
        )}

        <Card className="!p-4">
          <div className="text-xs mono uppercase tracking-[0.06em] text-ink-3 mb-2">Account</div>
          <Row label="ID" value={user.id} />
          <Row label="Created" value={new Date(user.createdAt).toLocaleString()} />
        </Card>
      </div>

      {user.role !== "admin" && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-3.5 border-t border-line bg-paper z-10">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="default"
              block
              loading={acting}
              className={user.isBlocked ? "" : "!text-danger"}
              onClick={toggleBlock}
            >
              {user.isBlocked ? "Unblock user" : "Block user"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-line text-[13px] last:border-b-0">
      <span className="text-ink-3">{label}</span>
      <span className="mono text-xs text-right truncate">{value || "—"}</span>
    </div>
  );
}
