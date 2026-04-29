"use client";

import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BannerForm } from "@/components/features/BannerForm";
import { adminApi } from "@/lib/api/admin";
import { toast } from "@/lib/toast";

export default function NewBannerPage() {
  const router = useRouter();
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="New banner" backHref="/admin/banners" />
      <div className="px-5 pb-12 max-w-2xl w-full mx-auto">
        <BannerForm
          submitLabel="Create banner"
          onSubmit={async (v) => {
            await adminApi.createBanner({
              title: v.title.trim(),
              subtitle: v.subtitle.trim() || null,
              imageUrl: v.imageUrl.trim() || null,
              ctaLabel: v.ctaLabel.trim() || null,
              ctaHref: v.ctaHref.trim() || null,
              status: v.status,
              sortOrder: v.sortOrder,
            });
            toast.success("Banner created");
            router.replace("/admin/banners");
          }}
        />
      </div>
    </div>
  );
}
