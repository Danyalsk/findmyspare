"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { uploadFile } from "@/lib/api/supplier-onboarding";
import { toast } from "@/lib/toast";
import type { Banner } from "@/lib/types";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass =
  "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";
const taClass =
  "w-full px-3.5 py-2.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

export interface BannerFormValues {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  status: "active" | "draft";
  sortOrder: number;
}

export interface BannerFormProps {
  initial?: Partial<Banner>;
  submitLabel: string;
  onSubmit: (v: BannerFormValues) => Promise<void>;
}

export function BannerForm({ initial, submitLabel, onSubmit }: BannerFormProps) {
  const [v, setV] = useState<BannerFormValues>({
    title: initial?.title || "",
    subtitle: initial?.subtitle || "",
    imageUrl: initial?.imageUrl || "",
    ctaLabel: initial?.ctaLabel || "",
    ctaHref: initial?.ctaHref || "",
    status: initial?.status || "draft",
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleImage(file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");
    setUploading(true);
    try {
      const res = await uploadFile(file, "product_image");
      setV({ ...v, imageUrl: res.url });
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!v.title.trim()) return setError("Title required");
    setSubmitting(true);
    try {
      await onSubmit(v);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Card variant="accent" className="!p-3 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      <div>
        <label className={labelClass}>Title</label>
        <input className={fieldClass} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </div>

      <div>
        <label className={labelClass}>Subtitle</label>
        <textarea className={taClass} rows={2} value={v.subtitle} onChange={(e) => setV({ ...v, subtitle: e.target.value })} />
      </div>

      <div>
        <label className={labelClass}>Banner image</label>
        {v.imageUrl && (
          <div className="mb-2 rounded-[10px] overflow-hidden border border-line aspect-[16/5]">
            <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleImage(e.target.files?.[0] || null)}
          className="block w-full text-sm text-ink-3 file:mr-3 file:py-2.5 file:px-4 file:rounded-[10px] file:border-0 file:bg-paper-2 file:text-ink file:cursor-pointer hover:file:bg-paper-3"
        />
        {uploading && <div className="text-xs text-ink-3 mt-1">Uploading…</div>}
        <input
          className={fieldClass + " mt-2"}
          placeholder="Or paste image URL"
          value={v.imageUrl}
          onChange={(e) => setV({ ...v, imageUrl: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>CTA label</label>
          <input className={fieldClass} placeholder="Shop now" value={v.ctaLabel} onChange={(e) => setV({ ...v, ctaLabel: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>CTA link</label>
          <input className={fieldClass} placeholder="/search?q=brake" value={v.ctaHref} onChange={(e) => setV({ ...v, ctaHref: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Status</label>
          <select
            className={fieldClass}
            value={v.status}
            onChange={(e) => setV({ ...v, status: e.target.value as "active" | "draft" })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input
            className={fieldClass}
            type="number"
            value={v.sortOrder}
            onChange={(e) => setV({ ...v, sortOrder: parseInt(e.target.value || "0", 10) })}
          />
        </div>
      </div>

      <Button variant="primary" block type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
