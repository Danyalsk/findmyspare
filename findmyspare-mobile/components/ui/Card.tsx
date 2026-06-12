import React from "react";
import { View, type ViewProps } from "react-native";
import { shadowCard } from "@/lib/theme";
import { Touchable } from "@/components/ui/Touchable";
import type { HapticKind } from "@/lib/haptics";

export interface CardProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
  flat?: boolean; // omit shadow when nested
  /** Recessed well (image areas, empty states) — sand bg, no border/shadow. */
  inset?: boolean;
  /** Make the whole card a pressable surface (scale + haptic on tap). */
  onPress?: () => void;
  haptic?: HapticKind;
}

export function Card({ className = "", children, flat, inset, style, onPress, haptic = "light", ...rest }: CardProps) {
  const surface = inset ? "bg-paper-3" : "bg-paper-2 border border-line";
  const cls = `${surface} rounded-card p-4 ${className}`;
  const cardStyle = [flat || inset ? undefined : shadowCard, style];

  if (onPress) {
    return (
      <Touchable onPress={onPress} haptic={haptic} className={cls} style={cardStyle} accessibilityRole="button">
        {children}
      </Touchable>
    );
  }

  return (
    <View {...rest} style={cardStyle} className={cls}>
      {children}
    </View>
  );
}
