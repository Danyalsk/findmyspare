"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/lib/icons";
import { adminApi } from "@/lib/api/admin";
import type { Banner } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.listBanners();
      setBanners(res.banners);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(b: Banner) {
    const next: "active" | "draft" = b.status === "active" ? "draft" : "active";
    try {
      await adminApi.updateBanner(b.id, { status: next });
      toast.success(`Marked ${next}`);
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Update failed"));
    }
  }

  async function remove(b: Banner) {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    try {
      await adminApi.deleteBanner(b.id);
      toast.success("Deleted");
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Delete failed"));
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Banners"
        backHref="/admin"
        rightAction={
          <Link href="/admin/banners/new">
            <Button variant="primary" className="!h-9 !text-[12px]">
              <PlusIcon size={14} /> New
            </Button>
          </Link>
        }
      />
      <div className="px-5 pb-12 max-w-4xl w-full mx-auto space-y-3">
        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : banners.length === 0 ? (
          <Card className="text-center !p-8">
            <div className="text-[14px] font-medium mb-1">No banners yet</div>
            <div className="text-[12px] text-ink-3 mb-4">Add a hero banner shown on the public home.</div>
            <Link href="/admin/banners/new">
              <Button variant="primary">
                <PlusIcon size={16} /> Create banner
              </Button>
            </Link>
          </Card>
        ) : (
          banners.map((b) => (
            <Card key={b.id} className="!p-4">
              <div className="flex gap-4">
                <div
                  className="w-32 h-20 rounded-[10px] overflow-hidden border border-line flex-shrink-0"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                  }}
                >
                  {b.imageUrl && (
                    <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">{b.title}</span>
                    <Chip variant={b.status === "active" ? "ok" : "default"}>{b.status}</Chip>
                    <span className="mono text-[10px] text-ink-3 ml-auto">#{b.sortOrder}</span>
                  </div>
                  {b.subtitle && (
                    <div className="text-[11px] text-ink-3 line-clamp-2">{b.subtitle}</div>
                  )}
                  {b.ctaHref && (
                    <div className="text-[10px] mono text-ink-3 mt-1">→ {b.ctaHref}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Link href={`/admin/banners/${b.id}/edit`}>
                      <Button variant="default" className="!h-8 !text-[11px]">Edit</Button>
                    </Link>
                    <Button variant="default" className="!h-8 !text-[11px]" onClick={() => toggleStatus(b)}>
                      {b.status === "active" ? "Set draft" : "Activate"}
                    </Button>
                    <Button variant="default" className="!h-8 !text-[11px] !text-danger" onClick={() => remove(b)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
