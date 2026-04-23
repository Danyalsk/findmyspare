"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BackIcon,
  MoreIcon,
  CheckIcon,
  ShieldIcon,
  StarIcon,
} from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/constants";
import { productsApi } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await productsApi.get(productId);
        if (!cancelled) setProduct(res.product);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load product"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const specs = useMemo(() => Object.entries(product?.specifications || {}), [product]);
  const price = parseFloat(product?.price || "0");

  function handleAddToCart() {
    if (!product) return;

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      vehicle: (product.compatibleVehicles || []).map((v) => `${v.make} ${v.model}`).join(", ") || "Universal",
      condition: "oem",
      quantity: 1,
      unitPrice: price,
      imageLabel: (product.category || "PART").toUpperCase().slice(0, 6),
      supplierId: product.supplierId,
      supplierName: product.supplierBusinessName || product.supplierName || "Supplier",
    });

    toast.success("Added to cart");
    router.push("/buyer/cart");
  }

  if (loading) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error || "Product not found"}</div>;
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden pb-[100px]">
        <div className="relative">
          <div
            className="w-full"
            style={{
              aspectRatio: "1/1.1",
              background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
            }}
          >
            <span className="absolute left-2.5 bottom-10 mono text-[9px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-1.5 py-0.5 rounded border border-line">
              PART IMAGE
            </span>
          </div>
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-line active:scale-90 transition-transform"
            >
              <BackIcon size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-line active:scale-90 transition-transform">
              <MoreIcon size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 pt-[18px]">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">OEM · {product.partNumber || "NA"}</div>
              <h2 className="serif text-[26px] leading-[1.05] mt-1.5">{product.name}</h2>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="mono text-[10px] text-ink-3">INR</div>
              <div className="mono text-[22px] font-semibold">{price.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            <Chip variant="ok">
              <CheckIcon size={12} /> Genuine
            </Chip>
            <Chip>{product.stockQuantity} in stock</Chip>
            {product.warrantyInfo && <Chip>{product.warrantyInfo.split(" ").slice(0, 2).join(" ")}</Chip>}
          </div>
        </div>

        <div className="px-5 pt-5">
          <Card variant="accent" className="!p-4">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-[10px] bg-paper flex items-center justify-center text-accent-ink flex-shrink-0">
                <ShieldIcon size={20} />
              </div>
              <div>
                <div className="font-semibold text-[13px] text-accent-ink">Protected by Escrow</div>
                <div className="text-xs text-accent-ink opacity-85 mt-0.5 leading-[1.4]">
                  Payment held until you confirm delivery and fitment.
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="px-5 pt-5">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">SUPPLIER</div>
          <div className="flex gap-3 items-center mt-2.5 p-3 border border-line rounded-[12px]">
            <Avatar initials={(product.supplierName || "SP").slice(0, 2).toUpperCase()} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{product.supplierBusinessName || product.supplierName || "Supplier"}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">
                <StarIcon size={10} className="inline text-ink" /> Verified supplier
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 pb-5">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">FITMENT & SPECS</div>
          <div className="mt-2.5">
            {specs.length === 0 ? (
              <div className="text-[12px] text-ink-3">No specs available.</div>
            ) : (
              specs.map(([key, value]) => (
                <div key={key} className="flex justify-between py-2.5 border-b border-line text-[13px]">
                  <span className="text-ink-3">{key}</span>
                  <span className="mono text-xs">{value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 py-3.5 border-t border-line bg-paper flex gap-2.5 items-center z-10">
        <Button variant="primary" block onClick={handleAddToCart} disabled={product.stockQuantity <= 0}>
          Add to cart · {formatPrice(price)}
        </Button>
      </div>
    </div>
  );
}
