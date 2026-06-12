import React, { useEffect } from "react";
import { Modal, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from "react-native-reanimated";
import { C, shadowFloat } from "@/lib/theme";

const H = Dimensions.get("window").height;
const SHEET_SPRING = { damping: 24, stiffness: 260, mass: 1 };
// Dismiss if dragged past this many px, or flicked faster than this (px/s).
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;

/**
 * Native-feeling bottom sheet: springs up on open, follows the finger, and
 * dismisses on a downward drag past threshold OR a quick flick (velocity).
 * Damps when dragged upward past the top (no hard wall). Backdrop fades with
 * the drag. Built on gesture-handler + reanimated (UI-thread, interruptible).
 */
export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(H);
  const height = useSharedValue(H * 0.5);

  useEffect(() => {
    if (visible) translateY.value = withSpring(0, SHEET_SPRING);
  }, [visible, translateY]);

  const animateClose = () => {
    translateY.value = withTiming(height.value, { duration: 200 }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Down = positive. Allow overscroll up with heavy damping (no hard stop).
      translateY.value = e.translationY >= 0 ? e.translationY : e.translationY * 0.18;
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(height.value, { duration: 200 }, (done) => {
          if (done) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, SHEET_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height.value], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={animateClose} />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            onLayout={(e) => { height.value = e.nativeEvent.layout.height; }}
            style={[styles.sheet, shadowFloat, sheetStyle, { paddingBottom: insets.bottom + 16 }]}
          >
            <View style={styles.grabber} />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: C.scrim },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.paper2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 999,
    backgroundColor: C.line2,
    marginBottom: 12,
  },
});
