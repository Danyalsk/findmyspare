import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

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
            <Stop offset="0%" stopColor="#FF6B1A" stopOpacity={0.10} />
            <Stop offset="45%" stopColor="#FF8A3D" stopOpacity={0.03} />
            <Stop offset="100%" stopColor="#FF8A3D" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={h} fill="#F6F7F9" />
        <Rect x="0" y="0" width={width} height={Math.round(h * 0.5)} fill="url(#warm)" />
      </Svg>
    </View>
  );
}
