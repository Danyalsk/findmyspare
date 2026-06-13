import React from "react";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { View } from "react-native";

export interface SkeletonProps {
  width?: number | "100%" | string;
  height?: number;
  radius?: number;
  className?: string;
  style?: object;
}

export function Skeleton({ width = "100%", height = 16, radius = 8, className = "", style }: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 0.9 }}
      transition={{
        type: "timing",
        duration: 900,
        loop: true,
        repeatReverse: true,
        easing: Easing.inOut(Easing.ease),
      }}
      className={`bg-paper-3 ${className}`}
      style={[{ width: width as number | string, height, borderRadius: radius }, style]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="bg-paper-2 rounded-xl2 overflow-hidden">
      <Skeleton height={210} radius={0} />
      <View className="p-3">
        <Skeleton height={12} width="80%" className="mb-1.5" />
        <Skeleton height={10} width="55%" className="mb-2.5" />
        <Skeleton height={16} width="45%" />
      </View>
    </View>
  );
}
