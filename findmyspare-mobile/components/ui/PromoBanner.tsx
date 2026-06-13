import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { Icon, type IconName } from "./Icon";
import { GradientFill } from "./Gradient";
import { C, GRADIENT, glowAccent } from "@/lib/theme";
import { SPRING, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";

export interface PromoBannerProps {
  title: string;
  subtitle?: string;
  /** Pill CTA label shown bottom-left. */
  ctaLabel?: string;
  ctaIcon?: IconName;
  /** Large decorative icon, right side. */
  icon?: IconName;
  onPress?: () => void;
  className?: string;
}

/**
 * The hero CTA card — the ONE sanctioned gradient surface in the app (alongside
 * the `accent` Button). Cobalt gradient, glow, press-scale + haptic. Use sparingly:
 * one per screen, top of a flow.
 */
export function PromoBanner({
  title,
  subtitle,
  ctaLabel,
  ctaIcon = "add",
  icon = "sparkles",
  onPress,
  className = "",
}: PromoBannerProps) {
  const reduced = useReducedMotion();
  return (
    <Pressable onPress={onPress} onPressIn={() => onPress && haptics.light()} className={className}>
      {({ pressed }) => (
        <MotiView
          animate={{ scale: pressed && onPress && !reduced ? 0.98 : 1 }}
          transition={SPRING.press}
          style={glowAccent}
          className="overflow-hidden rounded-card p-5 flex-row items-center"
        >
          <GradientFill colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View className="flex-1 pr-3">
            <Text style={{ color: C.onAccent }} className="text-headline font-sans-extrabold">{title}</Text>
            {subtitle ? (
              <Text style={{ color: "rgba(255,255,255,0.9)" }} className="text-sub mt-1">{subtitle}</Text>
            ) : null}
            {ctaLabel ? (
              <View className="self-start mt-3 bg-white rounded-full px-4 py-2 flex-row items-center gap-1.5">
                <Icon name={ctaIcon} size={15} color={C.accent} />
                <Text style={{ color: C.accentInk }} className="text-caption font-sans-bold">{ctaLabel}</Text>
              </View>
            ) : null}
          </View>
          <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
            <Icon name={icon} size={26} color={C.onAccent} />
          </View>
        </MotiView>
      )}
    </Pressable>
  );
}
