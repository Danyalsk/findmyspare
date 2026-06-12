import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { C } from "@/lib/theme";

export interface DnaLoaderProps {
  label?: string;
}

export function DnaLoader({ label }: DnaLoaderProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size="large" color={C.accent} />
      {label && <Text className="text-ink-3 text-[12px]">{label}</Text>}
    </View>
  );
}
