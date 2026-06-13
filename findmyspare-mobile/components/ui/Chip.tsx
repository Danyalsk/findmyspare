import React from "react";
import { Pressable, Text, View } from "react-native";
import { MotiView } from "moti";
import { SPRING, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";

export interface ChipProps {
  label: string;
  active?: boolean;
  /** Active styling: "ink" solid pill (default) or "accent" cobalt-wash (filters). */
  tone?: "ink" | "accent";
  onPress?: () => void;
  className?: string;
}

const base = "px-3.5 py-2 rounded-full border";
const idleCls = "bg-paper-2 border-line-2";

export function Chip({ label, active, tone = "ink", onPress, className = "" }: ChipProps) {
  // Active: ink → near-black solid · accent → cobalt-wash tinted (reads as selection).
  const activeCls = tone === "accent" ? "bg-accent-wash border-accent" : "bg-ink border-ink";
  const textCls = active
    ? tone === "accent" ? "text-accent-ink" : "text-paper-2"
    : "text-ink-2";
  const reduced = useReducedMotion();
  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={() => haptics.select()}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed && !reduced ? 0.95 : 1 }}
            transition={SPRING.press}
            className={`${base} ${active ? activeCls : idleCls} ${className}`}
          >
            <Text className={`text-caption font-sans-semibold ${textCls}`}>{label}</Text>
          </MotiView>
        )}
      </Pressable>
    );
  }
  return (
    <View className={`${base} ${active ? activeCls : idleCls} ${className}`}>
      <Text className={`text-caption font-sans-semibold ${textCls}`}>{label}</Text>
    </View>
  );
}
