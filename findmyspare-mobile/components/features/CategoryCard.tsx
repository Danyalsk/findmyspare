import React from "react";
import { Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Touchable } from "@/components/ui/Touchable";
import { C, shadowCard } from "@/lib/theme";

export interface CategoryCardProps {
  label: string;
  count: string;
  icon: IconName;
  onPress: () => void;
}

/** Large editorial category tile — icon top-left, label + part count. */
export function CategoryCard({ label, count, icon, onPress }: CategoryCardProps) {
  return (
    <Touchable
      onPress={onPress}
      scaleTo={0.96}
      style={[shadowCard, { width: 150 }]}
      className="bg-paper-2 rounded-xl2 p-4 justify-between h-[124px]"
    >
      <View className="w-11 h-11 rounded-full bg-accent-wash items-center justify-center">
        <Icon name={icon} size={22} color={C.accent} />
      </View>
      <View>
        <Text className="text-body font-sans-bold text-ink" numberOfLines={1}>{label}</Text>
        <Text className="text-micro font-mono uppercase tracking-[0.06em] text-ink-3 mt-0.5">{count}</Text>
      </View>
    </Touchable>
  );
}
