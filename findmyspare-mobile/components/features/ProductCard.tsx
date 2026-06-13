import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { Icon } from "@/components/ui/Icon";
import { Touchable } from "@/components/ui/Touchable";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import type { ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { C, shadowCard } from "@/lib/theme";
import { EASE, DURATION, stagger } from "@/lib/motion";

export interface ProductCardProps {
  product: ProductSummary;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const inStock = product.stockQuantity > 0;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: DURATION.slow, delay: stagger(index), easing: EASE.out }}
      className="flex-1"
    >
      <Touchable
        onPress={() => router.push(`/product/${product.id}` as never)}
        scaleTo={0.96}
        style={shadowCard}
        className="bg-paper-2 rounded-xl2 overflow-hidden"
      >
        {/* Image well — 4:5, edge-to-edge */}
        <View className="aspect-[4/5] bg-paper-3">
          {product.images?.[0] ? (
            <Image source={{ uri: product.images[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={250} />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Icon name="cube-outline" size={30} color={C.ink3} />
            </View>
          )}
          {product.category ? (
            <View className="absolute top-2.5 left-2.5 bg-paper-2/92 px-2.5 py-1 rounded-full">
              <Text className="text-micro font-mono uppercase tracking-[0.06em] text-ink-2">{product.category}</Text>
            </View>
          ) : null}
          <View className="absolute top-2.5 right-2.5 flex-row items-center gap-1 bg-paper-2/92 px-2 py-1 rounded-full">
            <View className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-success" : "bg-ink-3"}`} />
            <Text className={`text-micro font-sans-bold ${inStock ? "text-success" : "text-ink-3"}`}>{inStock ? "In stock" : "Out"}</Text>
          </View>
        </View>

        {/* Body */}
        <View className="p-3">
          <Text className="text-sub font-sans-bold text-ink leading-[19px]" numberOfLines={2}>
            {product.name}
          </Text>
          {product.supplierName && (
            <View className="flex-row items-center gap-1 mt-1">
              <Icon name="shield-checkmark" size={12} color={C.success} />
              <Text className="text-micro text-ink-3" numberOfLines={1}>{product.supplierName}</Text>
            </View>
          )}
          <Text className="font-mono text-headline font-sans-extrabold text-ink mt-2">
            {formatPrice(parseFloat(product.price))}
          </Text>
        </View>
      </Touchable>
    </MotiView>
  );
}
