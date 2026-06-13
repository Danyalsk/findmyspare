import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

export interface ParallaxScrollViewProps {
  /** Pixel height of the parallax header region. */
  headerHeight: number;
  /** Rendered inside the parallax/zoom layer (e.g. a hero image). */
  header: React.ReactNode;
  /** Optional overlay pinned on top of the header (e.g. back button, gradient). */
  headerOverlay?: React.ReactNode;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Reports scroll Y to a parent (e.g. to fade in a nav title). */
  onScrollY?: (y: number) => void;
}

/**
 * Scroll view with an iOS-style parallax header: the header moves at half the
 * scroll speed, and zooms (scale + translate) when the user pulls down past the
 * top. Hardware-accelerated via Reanimated on the UI thread. Ideal for product /
 * detail heroes.
 */
export function ParallaxScrollView({
  headerHeight,
  header,
  headerOverlay,
  children,
  contentContainerStyle,
  onScrollY,
}: ParallaxScrollViewProps) {
  const scrollY = useSharedValue(0);

  const handler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (onScrollY) onScrollY(e.contentOffset.y);
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-headerHeight, 0], [2.4, 1], Extrapolation.CLAMP);
    const translateY = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [0, 0, headerHeight * 0.5], // parallax: header drifts up at half speed
      Extrapolation.CLAMP,
    );
    return { transform: [{ translateY }, { scale }] };
  });

  return (
    <View className="flex-1">
      <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, height: headerHeight }, headerStyle]}>
        {header}
      </Animated.View>
      {headerOverlay}
      <Animated.ScrollView
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        <View style={{ height: headerHeight }} pointerEvents="none" />
        {children}
      </Animated.ScrollView>
    </View>
  );
}
