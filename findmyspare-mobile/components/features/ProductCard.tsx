import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import type { ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { C, shadowCard } from "@/lib/theme";
import { SPRING, EASE, DURATION, stagger, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";

export interface ProductCardProps {
  product: ProductSummary;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const inStock = product.stockQuantity > 0;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: DURATION.slow, delay: stagger(index), easing: EASE.out }}
      className="flex-1"
    >
      <Pressable onPress={() => router.push(`/product/${product.id}` as never)} onPressIn={() => haptics.light()}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed && !reduced ? 0.97 : 1 }}
            transition={SPRING.press}
            style={shadowCard}
            className="bg-paper-2 border border-line rounded-card p-2.5"
          >
            <View className="aspect-square rounded-input overflow-hidden bg-paper-3 mb-2.5">
              {product.images?.[0] ? (
                <Image source={{ uri: product.images[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={250} />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Icon name="cube-outline" size={26} color={C.ink3} />
                </View>
              )}
              {product.category ? (
                <View className="absolute top-2 left-2 bg-paper-2/90 px-2 py-0.5 rounded-full">
                  <Text className="text-micro font-mono uppercase text-ink-2">{product.category}</Text>
                </View>
              ) : null}
              {!inStock && (
                <View className="absolute top-2 right-2 bg-danger-wash px-2 py-0.5 rounded-full">
                  <Text className="text-micro font-sans-semibold uppercase text-danger">Out</Text>
                </View>
              )}
            </View>
            <Text className="text-sub font-sans-semibold text-ink" numberOfLines={2}>
              {product.name}
            </Text>
            {product.supplierName && (
              <Text className="text-micro text-ink-3 mt-0.5" numberOfLines={1}>
                {product.supplierName}
              </Text>
            )}
            <Text className="font-mono text-body text-ink mt-1.5">
              {formatPrice(parseFloat(product.price))}
            </Text>
          </MotiView>
        )}
      </Pressable>
    </MotiView>
  );
}
