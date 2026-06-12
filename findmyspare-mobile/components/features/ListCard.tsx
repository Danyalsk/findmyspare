import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/constants";
import { C, shadowCard } from "@/lib/theme";
import { SPRING, EASE, DURATION, stagger, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import type { ProductSummary } from "@/lib/types";

/** Swiggy-style horizontal product row — big image left, details right. */
export function ListCard({ product, index = 0 }: { product: ProductSummary; index?: number }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const inStock = product.stockQuantity > 0;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: DURATION.slow, delay: stagger(index), easing: EASE.out }}
    >
      <Pressable onPress={() => router.push(`/product/${product.id}` as never)} onPressIn={() => haptics.light()}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed && !reduced ? 0.98 : 1 }}
            transition={SPRING.press}
            style={shadowCard}
            className="flex-row bg-paper-2 border border-line rounded-card p-2.5 gap-3"
          >
            <View className="w-24 h-24 rounded-card overflow-hidden bg-paper-3">
              {product.images?.[0] ? (
                <Image source={{ uri: product.images[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={250} />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Icon name="cube-outline" size={28} color={C.ink3} />
                </View>
              )}
              {product.category ? (
                <View className="absolute top-1.5 left-1.5 bg-paper/85 rounded-full px-2 py-0.5">
                  <Text className="text-micro font-mono uppercase text-ink-2">{product.category}</Text>
                </View>
              ) : null}
            </View>

            <View className="flex-1 justify-center">
              <Text className="text-body font-sans-bold text-ink leading-[19px]" numberOfLines={2}>{product.name}</Text>
              {product.partNumber ? (
                <Text className="text-micro text-ink-3 font-mono mt-0.5">PN {product.partNumber}</Text>
              ) : null}
              {product.supplierName ? (
                <View className="flex-row items-center gap-1 mt-1">
                  <Icon name="shield-checkmark" size={13} color={C.success} />
                  <Text className="text-caption text-ink-2" numberOfLines={1}>{product.supplierName}</Text>
                </View>
              ) : null}
              <View className="flex-row items-center justify-between mt-1.5">
                <Text className="font-mono text-body font-sans-extrabold text-ink">{formatPrice(parseFloat(product.price))}</Text>
                <View className={`px-2 py-0.5 rounded-full ${inStock ? "bg-accent-wash" : "bg-paper-3"}`}>
                  <Text className={`text-micro font-sans-bold ${inStock ? "text-accent-ink" : "text-ink-3"}`}>
                    {inStock ? "In stock" : "Out"}
                  </Text>
                </View>
              </View>
            </View>
          </MotiView>
        )}
      </Pressable>
    </MotiView>
  );
}
