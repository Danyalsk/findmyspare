import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/constants";
import { openWhatsApp, waTemplates } from "@/lib/whatsapp";
import { useAuthStore } from "@/lib/store";
import type { ProductDetail } from "@/lib/types";
import { C } from "@/lib/theme";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const [p, setP] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const r = await productsApi.get(id);
      setP(r.product);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator color={C.accent} />
      </SafeAreaView>
    );
  }
  if (!p) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center">
        <Text className="text-ink-3">Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <View className="flex-row items-center px-3 h-12">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Icon name="chevron-back" size={22} color={C.ink} />
        </Pressable>
        <Text className="flex-1 text-body font-sans-semibold text-ink" numberOfLines={1}>
          {p.name}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-24">
        <View style={{ width, height: width }} className="bg-paper-3">
          {p.images && p.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
              >
                {p.images.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={{ width, height: width }} contentFit="cover" />
                ))}
              </ScrollView>
              {p.images.length > 1 && (
                <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
                  {p.images.map((_, i) => (
                    <View key={i} className={`h-1.5 rounded-full ${i === imgIdx ? "w-4 bg-ink" : "w-1.5 bg-ink/30"}`} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Icon name="cube-outline" size={48} color={C.ink3} />
            </View>
          )}
        </View>

        <View className="px-5 pt-4">
          <Text className="font-sans-extrabold text-display text-ink leading-[1.1]">{p.name}</Text>
          {p.partNumber && (
            <Text className="font-mono text-micro text-ink-3 mt-1">PN: {p.partNumber}</Text>
          )}
          <View className="flex-row items-baseline gap-2 mt-3">
            <Text className="font-mono text-display font-sans-semibold text-ink">
              {formatPrice(parseFloat(p.price))}
            </Text>
            <Text className="text-caption text-ink-3">
              {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}
            </Text>
          </View>

          {p.description && (
            <Card className="mt-4">
              <Text className="text-sub text-ink leading-[1.5]">{p.description}</Text>
            </Card>
          )}

          {p.compatibleVehicles && p.compatibleVehicles.length > 0 && (
            <View className="mt-4">
              <Text className="text-caption font-sans-semibold text-ink-2 mb-2 uppercase font-mono tracking-[0.08em]">
                Compatible
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {p.compatibleVehicles.map((v, i) => (
                  <Chip key={i} label={`${v.make} ${v.model}${v.year ? ` · ${v.year}` : ""}`} />
                ))}
              </View>
            </View>
          )}

          {p.specifications && Object.keys(p.specifications).length > 0 && (
            <View className="mt-4">
              <Text className="text-caption font-sans-semibold text-ink-2 mb-2 uppercase font-mono tracking-[0.08em]">
                Specifications
              </Text>
              <Card className="gap-2">
                {Object.entries(p.specifications).map(([k, v]) => (
                  <View key={k} className="flex-row justify-between">
                    <Text className="text-caption text-ink-3">{k.replace(/_/g, " ")}</Text>
                    <Text className="text-caption text-ink font-sans-medium">{String(v)}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {p.warrantyInfo && (
            <View className="mt-4">
              <Text className="text-caption font-sans-semibold text-ink-2 mb-2 uppercase font-mono tracking-[0.08em]">
                Warranty
              </Text>
              <Text className="text-sub text-ink">{p.warrantyInfo}</Text>
            </View>
          )}

          {p.supplierBusinessName && (
            <View className="mt-4 mb-2">
              <Text className="text-caption text-ink-3">Supplied by</Text>
              <Text className="text-body font-sans-semibold text-accent-ink">
                {p.supplierBusinessName}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-paper border-t border-line px-5 pt-3 pb-6 flex-row gap-2">
        <View className="flex-1">
          <Button
            label="Message"
            variant="primary"
            fullWidth
            size="lg"
            onPress={() =>
              router.push((user ? `/messages/${p.supplierId}` : "/(auth)/login") as never)
            }
            leftIcon={<Icon name="chatbubble-outline" size={16} color={C.onInk} />}
          />
        </View>
        {p.supplierPhone ? (
          <View className="flex-1">
            <Button
              label="WhatsApp"
              variant="default"
              fullWidth
              size="lg"
              onPress={() => openWhatsApp(p.supplierPhone!, waTemplates.productEnquiry(p.name))}
              leftIcon={<Icon name="logo-whatsapp" size={16} color={C.ink} />}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
