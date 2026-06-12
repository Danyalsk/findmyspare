"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BannerForm } from "@/components/features/BannerForm";
import { adminApi } from "@/lib/api/admin";
import type { Banner } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.getBanner(id);
        if (!cancelled) setBanner(res.banner);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error}</div>;
  }
  if (!banner) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Edit banner" backHref="/admin/banners" />
      <div className="px-5 pb-12 max-w-2xl w-full mx-auto">
        <BannerForm
          submitLabel="Save changes"
          initial={banner}
          onSubmit={async (v) => {
            await adminApi.updateBanner(banner.id, {
              title: v.title.trim(),
              subtitle: v.subtitle.trim() || null,
              imageUrl: v.imageUrl.trim() || null,
              ctaLabel: v.ctaLabel.trim() || null,
              ctaHref: v.ctaHref.trim() || null,
              status: v.status,
              sortOrder: v.sortOrder,
            });
            toast.success("Saved");
            router.replace("/admin/banners");
          }}
        />
      </div>
    </div>
  );
}
