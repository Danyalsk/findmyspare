import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StockBadge } from "@/components/features/StockBadge";
import { MovementRow } from "@/components/features/MovementRow";
import { StockAdjustSheet } from "@/components/features/StockAdjustSheet";
import { productsApi } from "@/lib/api/products";
import { inventoryApi } from "@/lib/api/inventory";
import type { InventoryItem, ProductDetail, StockMovement } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { C } from "@/lib/theme";
import { haptics } from "@/lib/haptics";

export default function InventoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [p, m] = await Promise.all([
        productsApi.get(id),
        inventoryApi.movements(id, { limit: 50 }).catch(() => ({ movements: [] as StockMovement[] })),
      ]);
      setProduct(p.product);
      setMovements(m.movements);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function publish() {
    if (!product) return;
    setBusy(true);
    try {
      await inventoryApi.publish(product.id);
      haptics.success();
      load();
    } catch (e) { Alert.alert("Failed", (e as Error).message); }
    finally { setBusy(false); }
  }

  function confirmUnpublish() {
    if (!product) return;
    Alert.alert("Delist item", `Buyers will no longer see "${product.name}".`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delist", style: "destructive", onPress: async () => {
        setBusy(true);
        try { await inventoryApi.unpublish(product.id); haptics.success(); load(); }
        catch (e) { Alert.alert("Failed", (e as Error).message); }
        finally { setBusy(false); }
      } },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator color={C.accent} />
      </SafeAreaView>
    );
  }
  if (!product) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
        <TopBar title="Item" back />
        <View className="flex-1 items-center justify-center"><Text className="text-ink-3">Item not found</Text></View>
      </SafeAreaView>
    );
  }

  const threshold = product.lowStockThreshold ?? 5;
  const isDraft = product.status === "draft";
  const invItem: InventoryItem = {
    id: product.id,
    name: product.name,
    partNumber: product.partNumber,
    category: product.category,
    price: product.price,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: threshold,
    status: product.status,
    images: product.images,
    updatedAt: product.updatedAt,
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="Inventory item" back />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3">
        <Card className="gap-3">
          <View className="flex-row gap-3 items-center">
            <View className="w-20 h-20 rounded-input overflow-hidden bg-paper-3">
              {product.images?.[0] && <Image source={{ uri: product.images[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" />}
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-ink" numberOfLines={2}>{product.name}</Text>
              <Text className="text-caption text-ink-3 mt-0.5">{product.category || "—"}</Text>
              <Text className="font-mono text-body font-sans-semibold text-ink mt-1">{formatPrice(parseFloat(product.price))}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-3 border-t border-line">
            <View>
              <Text className="text-micro text-ink-3">In stock</Text>
              <Text className="font-sans-extrabold text-display text-ink leading-tight">{product.stockQuantity}</Text>
            </View>
            <StockBadge status={product.status} stockQuantity={product.stockQuantity} lowStockThreshold={threshold} />
          </View>
          <Text className="text-micro text-ink-3">Low-stock alert below {threshold}</Text>
        </Card>

        {/* Actions */}
        <View className="gap-2.5 mt-4">
          <Button label="Adjust stock" onPress={() => setSheet(true)} fullWidth leftIcon={<Icon name="sync-outline" size={16} color={C.onInk} />} />
          {isDraft ? (
            <Button label={busy ? "Publishing…" : "Publish to marketplace"} variant="primary" loading={busy} onPress={publish} fullWidth />
          ) : (
            <Button label="Unpublish (move to drafts)" variant="default" onPress={confirmUnpublish} fullWidth />
          )}
          <Button label="Edit details" variant="default" onPress={() => router.push(`/supplier/products/${product.id}/edit` as never)} fullWidth />
        </View>

        {/* Movements */}
        <Text className="text-caption font-mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-1">Stock history</Text>
        <Card>
          {movements.length === 0 ? (
            <Text className="text-sub text-ink-3 text-center py-4">No movements yet.</Text>
          ) : (
            <View className="divide-y divide-line">
              {movements.map((m) => <MovementRow key={m.id} m={m} />)}
            </View>
          )}
        </Card>
      </ScrollView>

      <StockAdjustSheet item={invItem} visible={sheet} onClose={() => setSheet(false)} onAdjusted={load} />
    </SafeAreaView>
  );
}
