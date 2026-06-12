import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProductForm } from "@/components/features/ProductForm";
import { productsApi, type ProductInput } from "@/lib/api/products";

export default function NewProductScreen() {
  const router = useRouter();
  // Arrived from the Inventory tab → save as a private draft the supplier can
  // publish later. Otherwise create a live listing straight away.
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const isDraft = draft === "1";

  async function create(values: ProductInput) {
    await productsApi.create({ ...values, ...(isDraft ? { status: "draft" } : {}) });
    router.back();
  }

  return (
    <ProductForm
      title={isDraft ? "Add inventory item" : "Add product"}
      submitLabel={isDraft ? "Save to inventory" : "Publish product"}
      onSubmit={create}
    />
  );
}
