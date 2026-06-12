import React from "react";
import { Pressable, Text, ActivityIndicator, View, type GestureResponderEvent } from "react-native";
import { MotiView } from "moti";
import { GradientFill } from "./Gradient";
import { C, GRADIENT, glowAccent, shadowCard } from "@/lib/theme";
import { SPRING, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";

type Variant = "primary" | "default" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const sizeCls: Record<Size, string> = {
  sm: "h-9 px-3.5 rounded-input",
  md: "h-11 px-4 rounded-input",
  lg: "h-[52px] px-5 rounded-card",
};
const sizeText: Record<Size, string> = {
  sm: "text-caption",
  md: "text-sub",
  lg: "text-body",
};

export interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// primary/accent → saffron two-stop gradient with glow.
// default → white surface + warm border + soft shadow · danger → red · ghost → bare.
export function Button({
  children,
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className = "",
  fullWidth,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const dim = disabled || loading;
  const reduced = useReducedMotion();
  const gradient = variant === "primary" || variant === "accent";
  const textColor = gradient || variant === "danger" ? C.onAccent : C.ink;
  const surfaceCls =
    variant === "default"
      ? "bg-paper-2 border border-line-2"
      : variant === "danger"
      ? "bg-danger"
      : variant === "ghost"
      ? "bg-transparent"
      : "";

  const onPressIn = (_e: GestureResponderEvent) => {
    if (!dim) haptics.light();
  };

  return (
    <Pressable onPress={dim ? undefined : onPress} onPressIn={onPressIn} disabled={dim}>
      {({ pressed }) => (
        <MotiView
          animate={{ scale: pressed && !reduced ? 0.97 : 1, opacity: dim ? 0.45 : 1 }}
          transition={SPRING.press}
          style={gradient ? glowAccent : variant === "default" ? shadowCard : undefined}
          className={`overflow-hidden flex-row items-center justify-center gap-2 ${sizeCls[size]} ${surfaceCls} ${fullWidth ? "w-full" : ""} ${className}`}
        >
          {gradient && <GradientFill colors={GRADIENT} />}
          {loading ? (
            <ActivityIndicator size="small" color={gradient ? C.onAccent : C.ink} />
          ) : (
            <>
              {leftIcon && <View>{leftIcon}</View>}
              {(label || children) && (
                <Text style={{ color: textColor }} className={`${sizeText[size]} font-sans-semibold`}>
                  {label ?? children}
                </Text>
              )}
              {rightIcon && <View>{rightIcon}</View>}
            </>
          )}
        </MotiView>
      )}
    </Pressable>
  );
}
