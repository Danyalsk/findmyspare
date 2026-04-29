"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { uploadFile } from "@/lib/api/supplier-onboarding";
import { toast } from "@/lib/toast";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass =
  "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";
const taClass =
  "w-full px-3.5 py-2.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

export interface ProductFormValues {
  name: string;
  partNumber: string;
  category: string;
  price: string;
  stockQuantity: number;
  description: string;
  warrantyInfo: string;
  images: string[];
  compatibleVehicles: Array<{ make: string; model: string; year?: string }>;
  specifications: Record<string, string>;
}

const empty: ProductFormValues = {
  name: "",
  partNumber: "",
  category: "",
  price: "",
  stockQuantity: 1,
  description: "",
  warrantyInfo: "",
  images: [],
  compatibleVehicles: [],
  specifications: {},
};

export interface ProductFormProps {
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductForm({ initial, submitLabel, onSubmit }: ProductFormProps) {
  const [v, setV] = useState<ProductFormValues>({ ...empty, ...initial });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [specRows, setSpecRows] = useState<Array<[string, string]>>(
    Object.entries(initial?.specifications || {})
  );
  const [vehRows, setVehRows] = useState<Array<{ make: string; model: string; year?: string }>>(
    initial?.compatibleVehicles || []
  );

  async function handleImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`${f.name} too large (max 5MB)`);
          continue;
        }
        const res = await uploadFile(f, "product_image");
        urls.push(res.url);
      }
      setV((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setV((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!v.name.trim()) return setError("Name required");
    if (!v.price.trim() || isNaN(parseFloat(v.price))) return setError("Valid price required");
    if (v.stockQuantity < 0) return setError("Stock cannot be negative");

    const specs: Record<string, string> = {};
    specRows.forEach(([k, val]) => {
      if (k.trim()) specs[k.trim()] = val.trim();
    });

    const vehicles = vehRows.filter((row) => row.make.trim() && row.model.trim());

    setSubmitting(true);
    try {
      await onSubmit({ ...v, specifications: specs, compatibleVehicles: vehicles });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Card variant="accent" className="!p-3 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      <div>
        <label className={labelClass}>Name</label>
        <input className={fieldClass} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Part #</label>
          <input className={fieldClass} value={v.partNumber} onChange={(e) => setV({ ...v, partNumber: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={fieldClass} value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Price (₹)</label>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={v.price}
            onChange={(e) => setV({ ...v, price: e.target.value.replace(/[^\d.]/g, "") })}
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            className={fieldClass}
            type="number"
            min={0}
            value={v.stockQuantity}
            onChange={(e) => setV({ ...v, stockQuantity: parseInt(e.target.value || "0", 10) })}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={taClass}
          rows={3}
          value={v.description}
          onChange={(e) => setV({ ...v, description: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>Warranty info</label>
        <input
          className={fieldClass}
          value={v.warrantyInfo}
          onChange={(e) => setV({ ...v, warrantyInfo: e.target.value })}
          placeholder="6 months manufacturer warranty"
        />
      </div>

      <div>
        <label className={labelClass}>Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {v.images.map((url, i) => (
            <div key={url + i} className="relative w-20 h-20 rounded-[10px] overflow-hidden border border-line">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink text-paper text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={(e) => handleImages(e.target.files)}
          className="block w-full text-sm text-ink-3 file:mr-3 file:py-2.5 file:px-4 file:rounded-[10px] file:border-0 file:bg-paper-2 file:text-ink file:cursor-pointer hover:file:bg-paper-3"
        />
        {uploading && <div className="text-xs text-ink-3 mt-1">Uploading…</div>}
      </div>

      <div>
        <label className={labelClass}>Compatible vehicles</label>
        <div className="space-y-2">
          {vehRows.map((row, i) => (
            <div key={i} className="grid grid-cols-7 gap-2">
              <input
                className={fieldClass + " col-span-2"}
                placeholder="Make"
                value={row.make}
                onChange={(e) => {
                  const next = [...vehRows];
                  next[i] = { ...row, make: e.target.value };
                  setVehRows(next);
                }}
              />
              <input
                className={fieldClass + " col-span-3"}
                placeholder="Model"
                value={row.model}
                onChange={(e) => {
                  const next = [...vehRows];
                  next[i] = { ...row, model: e.target.value };
                  setVehRows(next);
                }}
              />
              <input
                className={fieldClass + " col-span-1"}
                placeholder="Year"
                value={row.year || ""}
                onChange={(e) => {
                  const next = [...vehRows];
                  next[i] = { ...row, year: e.target.value };
                  setVehRows(next);
                }}
              />
              <button
                type="button"
                onClick={() => setVehRows(vehRows.filter((_, x) => x !== i))}
                className="col-span-1 h-11 rounded-[10px] bg-paper-2 border border-line text-ink-3 hover:text-danger"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="default"
          dashed
          className="!h-9 !text-[12px] mt-2"
          onClick={() => setVehRows([...vehRows, { make: "", model: "", year: "" }])}
        >
          + Add vehicle
        </Button>
      </div>

      <div>
        <label className={labelClass}>Specifications</label>
        <div className="space-y-2">
          {specRows.map(([k, val], i) => (
            <div key={i} className="grid grid-cols-7 gap-2">
              <input
                className={fieldClass + " col-span-3"}
                placeholder="Key"
                value={k}
                onChange={(e) => {
                  const next = [...specRows];
                  next[i] = [e.target.value, val];
                  setSpecRows(next);
                }}
              />
              <input
                className={fieldClass + " col-span-3"}
                placeholder="Value"
                value={val}
                onChange={(e) => {
                  const next = [...specRows];
                  next[i] = [k, e.target.value];
                  setSpecRows(next);
                }}
              />
              <button
                type="button"
                onClick={() => setSpecRows(specRows.filter((_, x) => x !== i))}
                className="col-span-1 h-11 rounded-[10px] bg-paper-2 border border-line text-ink-3 hover:text-danger"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="default"
          dashed
          className="!h-9 !text-[12px] mt-2"
          onClick={() => setSpecRows([...specRows, ["", ""]])}
        >
          + Add spec
        </Button>
      </div>

      <Button variant="primary" block type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
