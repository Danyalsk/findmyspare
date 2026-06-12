import React, { useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Icon } from "@/components/ui/Icon";
import { useFocusEffect, useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StockBadge } from "@/components/features/StockBadge";
import { MotiView } from "moti";
import { EASE, DURATION, stagger } from "@/lib/motion";
import { inventoryApi, type InventoryListParams } from "@/lib/api/inventory";
import type { InventoryItem } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { C } from "@/lib/theme";

const FILTERS = ["All", "Drafts", "Active", "Low stock"] as const;
type FilterLabel = (typeof FILTERS)[number];

function filterToParams(f: FilterLabel): Partial<InventoryListParams> {
  switch (f) {
    case "Drafts": return { status: "draft" };
    case "Active": return { status: "active" };
    case "Low stock": return { lowStock: true };
    default: return {};
  }
}

export default function SupplierInventory() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<FilterLabel>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f: FilterLabel) => {
    try {
      const r = await inventoryApi.list({ ...filterToParams(f), limit: 50 });
      setItems(r.items);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(filter); }, [load, filter]));

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(filter); }}>
      <View className="pt-3 pb-3 flex-row items-center justify-between">
        <Text className="font-sans-extrabold text-title text-ink">Inventory</Text>
        <Pressable
          onPress={() => router.push("/supplier/products/new?draft=1" as never)}
          className="bg-ink rounded-full w-10 h-10 items-center justify-center"
        >
          <Icon name="add" size={22} color={C.onInk} />
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2 pb-3">
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={f === filter} onPress={() => { setFilter(f); setLoading(true); }} />
        ))}
      </View>

      {loading ? (
        <View className="gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} height={88} />)}</View>
      ) : items.length === 0 ? (
        <View className="items-center mt-20 gap-3">
          <Icon name="cube-outline" size={46} color={C.ink3} />
          <Text className="text-ink-3 text-body">Nothing here yet</Text>
          <Text className="text-ink-3 text-caption text-center px-10">
            Add an item — keep it as a draft or publish it to the marketplace.
          </Text>
          <Button label="Add item" onPress={() => router.push("/supplier/products/new?draft=1" as never)} />
        </View>
      ) : (
        <View className="gap-2.5">
          {items.map((p, i) => (
            <MotiView
              key={p.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: DURATION.slow, delay: stagger(i), easing: EASE.out }}
            >
              <Card onPress={() => router.push(`/supplier/inventory/${p.id}` as never)} className="!p-2.5">
                <View className="flex-row gap-3 items-center">
                  <View className="w-16 h-16 rounded-input overflow-hidden bg-paper-3">
                    {p.images?.[0] && (
                      <Image source={{ uri: p.images[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-body font-sans-semibold text-ink" numberOfLines={1}>{p.name}</Text>
                    <Text className="text-micro text-ink-3 mt-0.5">{p.category || "—"}{p.partNumber ? ` · ${p.partNumber}` : ""}</Text>
                    <View className="flex-row items-center justify-between mt-1.5">
                      <Text className="font-mono text-sub font-sans-semibold text-ink">{formatPrice(parseFloat(p.price))}</Text>
                      <StockBadge status={p.status} stockQuantity={p.stockQuantity} lowStockThreshold={p.lowStockThreshold} />
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={18} color={C.ink3} />
                </View>
              </Card>
            </MotiView>
          ))}
        </View>
      )}
    </PageShell>
  );
}
