"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { ProductForm } from "@/components/features/ProductForm";
import { productsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { ProductDetail } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productsApi.get(params.id);
        if (!cancelled) setProduct(res.product);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return <div className="px-5 pt-16 text-center text-[13px] text-danger">{error}</div>;
  }

  if (!product) {
    return <div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Edit product" backHref="/supplier/products" />
      <div className="px-5 pb-12 max-w-2xl w-full mx-auto">
        <ProductForm
          submitLabel="Save changes"
          initial={{
            name: product.name,
            partNumber: product.partNumber || "",
            category: product.category || "",
            price: product.price,
            stockQuantity: product.stockQuantity,
            description: product.description || "",
            warrantyInfo: product.warrantyInfo || "",
            images: product.images || [],
            compatibleVehicles: product.compatibleVehicles || [],
            specifications: product.specifications || {},
          }}
          onSubmit={async (v) => {
            await productsApi.update(product.id, {
              name: v.name,
              description: v.description,
              partNumber: v.partNumber,
              category: v.category,
              price: v.price,
              stockQuantity: v.stockQuantity,
              images: v.images,
              specifications: v.specifications,
              compatibleVehicles: v.compatibleVehicles,
              warrantyInfo: v.warrantyInfo,
            });
            toast.success("Saved");
            router.replace("/supplier/products");
          }}
        />
      </div>
    </div>
  );
}
