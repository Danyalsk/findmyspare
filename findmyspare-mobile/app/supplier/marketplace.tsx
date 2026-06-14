import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { TopBar } from "@/components/layout/TopBar";
import { SearchBar } from "@/components/ui/SearchBar";
import { ProductCard } from "@/components/features/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { productsApi } from "@/lib/api/products";
import type { ProductSummary } from "@/lib/types";
import { C } from "@/lib/theme";

/** Supplier-facing browse-all view of every product posted to the marketplace. */
export default function SupplierMarketplaceScreen() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await productsApi.list({ limit: 50, sort: "newest" });
      setProducts(r.products);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, q]);

  const rows: ProductSummary[][] = [];
  for (let i = 0; i < filtered.length; i += 2) rows.push(filtered.slice(i, i + 2));

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="Marketplace" subtitle="All listings" back />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3">
        <View className="mb-4">
          <SearchBar value={q} onChangeText={setQ} placeholder="Search listings…" />
        </View>

        {loading ? (
          <View className="gap-3.5">
            {[0, 1, 2].map((i) => (
              <View key={i} className="flex-row gap-3.5">
                <View className="flex-1"><ProductCardSkeleton /></View>
                <View className="flex-1"><ProductCardSkeleton /></View>
              </View>
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center mt-24 gap-3">
            <Icon name="cube-outline" size={46} color={C.ink3} />
            <Text className="text-ink-3 text-body">{q.trim() ? "No matching listings" : "No listings yet"}</Text>
          </View>
        ) : (
          <View className="gap-3.5">
            {rows.map((row, ri) => (
              <View key={ri} className="flex-row gap-3.5">
                {row.map((p, ci) => (
                  <ProductCard key={p.id} product={p} index={ri * 2 + ci} />
                ))}
                {row.length === 1 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
