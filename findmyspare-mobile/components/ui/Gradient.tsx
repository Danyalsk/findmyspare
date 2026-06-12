import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";

let _id = 0;

/**
 * Absolute-fill linear gradient backed by react-native-svg (no extra native
 * module). Drop inside an `overflow-hidden` rounded parent.
 */
export function GradientFill({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  opacity = 1,
}: {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  opacity?: number;
}) {
  const id = React.useMemo(() => `grad${_id++}`, []);
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id={id} x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
            {colors.map((c, i) => (
              <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
