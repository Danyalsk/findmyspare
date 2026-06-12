import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProductForm, type ProductFormValues } from "@/components/features/ProductForm";
import { productsApi, type ProductInput } from "@/lib/api/products";
import type { ProductDetail } from "@/lib/types";
import { C } from "@/lib/theme";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    productsApi.get(id).then((r) => setProduct(r.product)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading || !product) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={C.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const initial: Partial<ProductFormValues> = {
    name: product.name,
    category: product.category ?? undefined,
    partNumber: product.partNumber ?? undefined,
    price: product.price,
    stockQuantity: product.stockQuantity,
    description: product.description ?? undefined,
    warrantyInfo: product.warrantyInfo ?? undefined,
    images: product.images ?? [],
    specifications: product.specifications ?? undefined,
    compatibleVehicles: product.compatibleVehicles ?? undefined,
  };

  async function save(values: ProductInput) {
    if (!id) return;
    await productsApi.update(id, values);
    router.back();
  }

  return <ProductForm title="Edit product" initial={initial} submitLabel="Save changes" onSubmit={save} />;
}
