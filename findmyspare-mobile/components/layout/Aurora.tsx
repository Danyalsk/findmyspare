import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { C } from "@/lib/theme";

/**
 * Clean light backdrop — the canvas plus a single faint warm glow behind the
 * header. Keeps the Swiggy-style white feel with a touch of brand warmth.
 */
export function Aurora() {
  const { width, height } = useWindowDimensions();
  const h = height || 900;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={h}>
        <Defs>
          <RadialGradient id="warm" cx="50%" cy="0%" r="75%">
            <Stop offset="0%" stopColor={C.accent} stopOpacity={0.08} />
            <Stop offset="45%" stopColor={C.accent} stopOpacity={0.02} />
            <Stop offset="100%" stopColor={C.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={h} fill={C.paper} />
        <Rect x="0" y="0" width={width} height={Math.round(h * 0.5)} fill="url(#warm)" />
      </Svg>
    </View>
  );
}
