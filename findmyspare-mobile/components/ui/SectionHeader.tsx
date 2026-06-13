import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icon } from "./Icon";
import { C } from "@/lib/theme";
import { haptics } from "@/lib/haptics";

export interface SectionHeaderProps {
  title: string;
  /** Optional muted subtitle under the title. */
  subtitle?: string;
  /** Trailing action label (e.g. "See all"). Renders a cobalt link + chevron. */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** The one section header — consistent size/weight/spacing for every list band. */
export function SectionHeader({ title, subtitle, actionLabel, onAction, className = "" }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <View className="flex-1 pr-3">
        <Text className="text-headline font-sans-bold text-ink" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text className="text-caption text-ink-3 mt-0.5" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} onPressIn={() => haptics.select()} hitSlop={8} className="flex-row items-center gap-0.5">
          <Text className="text-caption text-accent-ink font-sans-bold">{actionLabel}</Text>
          <Icon name="chevron-forward" size={14} color={C.accentInk} />
        </Pressable>
      )}
    </View>
  );
}
