import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { ListCard } from "@/components/features/ListCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { productsApi } from "@/lib/api";
import { categories } from "@/lib/constants";
import { C, shadowCard } from "@/lib/theme";
import type { ProductSummary } from "@/lib/types";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q ?? "");
  const [category, setCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof params.q === "string") setQ(params.q);
  }, [params.q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ q: q || undefined, category: category || undefined, limit: 24 });
      setProducts(res.products);
    } catch {} finally { setLoading(false); }
  }, [q, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      {/* Header + search */}
      <View className="px-5 pt-2 pb-3">
        <Text className="text-title font-sans-extrabold text-ink mb-3">Browse parts</Text>
        <View className="flex-row items-center bg-paper-2 border border-line-2 rounded-card px-4 py-3" style={shadowCard}>
          <Icon name="search" size={20} color={C.accent} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search parts, OEM, brand…"
            placeholderTextColor={C.ink3}
            selectionColor={C.accent}
            autoFocus={!q}
            className="flex-1 ml-2.5 text-body text-ink"
          />
          {q ? (
            <Text onPress={() => setQ("")}>
              <Icon name="close-circle-outline" size={18} color={C.ink3} />
            </Text>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-2" className="mb-1 max-h-12">
        <Chip label="All" active={!category} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <Chip key={c.label} label={c.label} active={category === c.label} onPress={() => setCategory(c.label)} />
        ))}
      </ScrollView>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-3 pb-32" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? (
          <View className="gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}</View>
        ) : products.length === 0 ? (
          <View className="items-center mt-16 gap-3">
            <View className="w-14 h-14 rounded-full bg-accent-wash items-center justify-center">
              <Icon name="search" size={26} color={C.accent} />
            </View>
            <Text className="text-body font-sans-bold text-ink">No parts found</Text>
            <Text className="text-caption text-ink-3 text-center px-10">
              Try another keyword — or post a request and let suppliers quote you.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-caption text-ink-3 font-mono uppercase tracking-[0.08em]">{products.length} results</Text>
            {products.map((p, i) => <ListCard key={p.id} product={p} index={i} />)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
