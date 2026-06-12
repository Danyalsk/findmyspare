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
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.85 }}
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
    <View className="bg-paper border border-line rounded-card p-3">
      <Skeleton height={120} radius={10} className="mb-2.5" />
      <Skeleton height={12} width="75%" className="mb-1.5" />
      <Skeleton height={10} width="50%" className="mb-2" />
      <Skeleton height={14} width="40%" />
    </View>
  );
}
