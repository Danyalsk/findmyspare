import React from "react";
import { Pressable, type PressableProps, type GestureResponderEvent, type ViewStyle, type StyleProp } from "react-native";
import { MotiView } from "moti";
import { SPRING, useReducedMotion } from "@/lib/motion";
import { haptics, type HapticKind } from "@/lib/haptics";

export interface TouchableProps extends Omit<PressableProps, "style" | "children"> {
  /** Scale at press. Default 0.97 (cards/rows); use ~0.94 for small icon buttons. */
  scaleTo?: number;
  /** Haptic on press-in. Default "light"; pass false to disable. */
  haptic?: HapticKind;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Drop-in Pressable that makes anything feel responsive: a snappy scale on press
 * (SPRING.press) + a tasteful haptic on touch-down. The default for tappable
 * rows, cards, icon buttons, FABs. Respects Reduce Motion (drops the scale,
 * keeps the haptic). For callers needing the `{pressed}` render-prop, use a raw
 * Pressable with SPRING.press instead.
 */
export function Touchable({
  scaleTo = 0.97,
  haptic = "light",
  className,
  style,
  children,
  onPressIn,
  disabled,
  ...rest
}: TouchableProps) {
  const reduced = useReducedMotion();

  const handlePressIn = (e: GestureResponderEvent) => {
    if (haptic && !disabled) haptics[haptic]();
    onPressIn?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} disabled={disabled} {...rest}>
      {({ pressed }) => (
        <MotiView
          animate={{ scale: pressed && !reduced && !disabled ? scaleTo : 1 }}
          transition={SPRING.press}
          className={className}
          style={style}
        >
          {children}
        </MotiView>
      )}
    </Pressable>
  );
}
