import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { Touchable } from "@/components/ui/Touchable";
import { C } from "@/lib/theme";

export interface TopBarProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function TopBar({ title, subtitle, back, right }: TopBarProps) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-2.5 px-4 py-3 bg-paper">
      {back && (
        <Touchable
          onPress={() => router.back()}
          scaleTo={0.92}
          hitSlop={8}
          className="w-10 h-10 items-center justify-center rounded-full bg-paper-2 border border-line-2"
        >
          <Icon name="chevron-back" size={20} color={C.ink} />
        </Touchable>
      )}
      <View className="flex-1">
        <Text className="text-title font-sans-bold text-ink" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text className="text-caption text-ink-3 mt-0.5" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
