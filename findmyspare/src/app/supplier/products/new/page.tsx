"use client";

import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { ProductForm } from "@/components/features/ProductForm";
import { productsApi } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Add product" backHref="/supplier/products" />
      <div className="px-5 pb-12 max-w-2xl w-full mx-auto">
        <ProductForm
          submitLabel="Create product"
          onSubmit={async (v) => {
            await productsApi.create({
              name: v.name,
              description: v.description || undefined,
              partNumber: v.partNumber || undefined,
              category: v.category || undefined,
              price: v.price,
              stockQuantity: v.stockQuantity,
              lowStockThreshold: v.lowStockThreshold,
              images: v.images.length ? v.images : undefined,
              specifications: Object.keys(v.specifications).length ? v.specifications : undefined,
              compatibleVehicles: v.compatibleVehicles.length ? v.compatibleVehicles : undefined,
              warrantyInfo: v.warrantyInfo || undefined,
            });
            toast.success("Product created");
            router.replace("/supplier/products");
          }}
        />
      </div>
    </div>
  );
}
