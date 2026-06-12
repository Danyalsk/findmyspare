import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { MotiView } from "moti";
import { GradientFill } from "./Gradient";
import { C, glowAccent } from "@/lib/theme";

type Variant = "primary" | "default" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const sizeCls: Record<Size, string> = {
  sm: "px-3.5 py-2.5 rounded-[12px]",
  md: "px-4 py-3 rounded-[14px]",
  lg: "px-5 py-4 rounded-[16px]",
};
const sizeText: Record<Size, string> = {
  sm: "text-[12px]",
  md: "text-[13px]",
  lg: "text-[15px]",
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

// primary/accent → warm gradient pill with glow + dark text.
// default → glassy surface · danger → red · ghost → bare.
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
  const gradient = variant === "primary" || variant === "accent";
  const textColor = gradient ? C.onAccent : variant === "danger" ? "#FFFFFF" : C.ink;
  const surfaceCls =
    variant === "default"
      ? "bg-paper-2 border border-line-2"
      : variant === "danger"
      ? "bg-danger"
      : variant === "ghost"
      ? "bg-transparent"
      : "";

  return (
    <Pressable onPress={dim ? undefined : onPress} disabled={dim}>
      {({ pressed }) => (
        <MotiView
          animate={{ scale: pressed ? 0.96 : 1, opacity: dim ? 0.45 : 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 320 }}
          style={gradient ? glowAccent : undefined}
          className={`overflow-hidden flex-row items-center justify-center gap-2 ${sizeCls[size]} ${surfaceCls} ${fullWidth ? "w-full" : ""} ${className}`}
        >
          {gradient && <GradientFill colors={[C.gold, C.accent, C.accent2]} />}
          {loading ? (
            <ActivityIndicator size="small" color={gradient ? C.onAccent : C.ink} />
          ) : (
            <>
              {leftIcon && <View>{leftIcon}</View>}
              {(label || children) && (
                <Text style={{ color: textColor }} className={`${sizeText[size]} font-semibold`}>
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
