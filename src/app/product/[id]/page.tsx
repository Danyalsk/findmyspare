"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CheckIcon, ShieldIcon, StarIcon } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { productsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { buildWhatsAppLink, waTemplates } from "@/lib/whatsapp";
import type { ProductDetail } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

export default function PublicProductDetail() {
  const { id } = useParams<{ id: string }>();
  const buyer = useAuthStore((s) => s.user);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productsApi.get(id);
        if (!cancelled) setProduct(res.product);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load product"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const specs = useMemo(() => Object.entries(product?.specifications || {}), [product]);
  const price = parseFloat(product?.price || "0");

  function handleContact() {
    if (!product) return;
    if (!product.supplierPhone) {
      toast.error("Supplier phone unavailable");
      return;
    }
    const firstVeh = product.compatibleVehicles?.[0];
    const vehicle = firstVeh
      ? `${firstVeh.make} ${firstVeh.model}${firstVeh.year ? " " + firstVeh.year : ""}`
      : null;
    const msg = waTemplates.productEnquiry({
      buyerName: buyer?.name || "a customer",
      productName: product.name,
      partNumber: product.partNumber,
      vehicle,
    });
    window.open(buildWhatsAppLink(product.supplierPhone, msg), "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <PublicNav />
        <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <PublicNav />
        <div className="px-5 pt-16 text-center text-[13px] text-danger">{error || "Product not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <PublicNav />

      <div className="max-w-7xl mx-auto w-full px-5 py-6 grid md:grid-cols-2 gap-8">
        <div>
          <div
            className="rounded-[14px] overflow-hidden border border-line aspect-square relative"
            style={{
              background:
                "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
            }}
          >
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="absolute left-3 bottom-3 mono text-[10px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-2 py-1 rounded border border-line">
                {(product.category || "PART").slice(0, 12)}
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {product.images.slice(0, 5).map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[8px] border border-line overflow-hidden"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
            {product.category || "PART"} · {product.partNumber || "—"}
          </div>
          <h1 className="serif text-[32px] sm:text-[40px] leading-[1.05] mt-2">{product.name}</h1>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip variant="ok">
              <CheckIcon size={12} /> Genuine
            </Chip>
            <Chip>{product.stockQuantity} in stock</Chip>
            {product.warrantyInfo && <Chip>{product.warrantyInfo.split(" ").slice(0, 2).join(" ")}</Chip>}
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="mono text-[12px] text-ink-3">INR</span>
            <span className="mono text-[36px] font-semibold">
              {price.toLocaleString("en-IN")}
            </span>
          </div>

          <Card variant="accent" className="!p-4 mt-5">
            <div className="flex gap-3 items-start">
              <ShieldIcon size={22} className="text-accent-ink flex-shrink-0 mt-0.5" />
              <div className="text-[13px]">
                <div className="font-semibold text-accent-ink">GST-verified supplier</div>
                <div className="text-accent-ink opacity-85 leading-[1.4] mt-0.5">
                  Reviewed by FindMySpare admin. Direct WhatsApp contact below.
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-5 p-4 border border-line rounded-[12px] flex items-center gap-3">
            <Avatar
              initials={(product.supplierBusinessName || product.supplierName || "SP")
                .slice(0, 2)
                .toUpperCase()}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                {product.supplierBusinessName || product.supplierName || "Supplier"}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5 flex items-center gap-1">
                <StarIcon size={10} className="text-ink" /> Verified supplier
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              variant="primary"
              block
              size="lg"
              onClick={handleContact}
              disabled={!product.supplierPhone}
            >
              Contact supplier on WhatsApp
            </Button>
          </div>

          {!buyer && (
            <div className="mt-3 text-[12px] text-ink-3">
              Want to track requests and bids?{" "}
              <Link href="/register" className="text-accent-ink hover:underline">
                Create a buyer account
              </Link>
              .
            </div>
          )}

          {product.description && (
            <div className="mt-6">
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">DESCRIPTION</div>
              <p className="text-[13px] mt-2 leading-[1.55] text-ink-2 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
            <div className="mt-5">
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">COMPATIBLE VEHICLES</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {product.compatibleVehicles.map((v, i) => (
                  <Chip key={i}>
                    {v.make} {v.model}
                    {v.year ? ` · ${v.year}` : ""}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {specs.length > 0 && (
            <div className="mt-5">
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">SPECIFICATIONS</div>
              <div className="mt-2">
                {specs.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-2.5 border-b border-line text-[13px] last:border-b-0"
                  >
                    <span className="text-ink-3">{k}</span>
                    <span className="mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
