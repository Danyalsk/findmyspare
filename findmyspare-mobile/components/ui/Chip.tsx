import React from "react";
import { Pressable, Text, View } from "react-native";
import { MotiView } from "moti";

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

const base = "px-3.5 py-2 rounded-full border";
const activeCls = "bg-accent border-accent";
const idleCls = "bg-paper-2 border-line-2";

export function Chip({ label, active, onPress, className = "" }: ChipProps) {
  const textCls = active ? "text-white" : "text-ink-2";
  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed ? 0.95 : 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 320 }}
            className={`${base} ${active ? activeCls : idleCls} ${className}`}
          >
            <Text className={`text-[12px] font-semibold ${textCls}`}>{label}</Text>
          </MotiView>
        )}
      </Pressable>
    );
  }
  return (
    <View className={`${base} ${active ? activeCls : idleCls} ${className}`}>
      <Text className={`text-[12px] font-semibold ${textCls}`}>{label}</Text>
    </View>
  );
}
