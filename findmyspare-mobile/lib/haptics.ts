import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Tasteful haptic vocabulary — the iOS-native signature. Fire-and-forget,
 * iOS-gated (Android vibration feels different and is left off intentionally),
 * never throws. Use the semantic names, not raw expo-haptics, so the feel stays
 * consistent app-wide.
 *
 *  select  → tab switch, chip/filter toggle, pull-to-refresh
 *  light   → card / button / row press, FAB
 *  medium  → order status step (confirm/ship/deliver)
 *  success → order placed, published, OTP verified, dispute resolved, stock saved
 *  warning → destructive confirm (delete / cancel / unpublish)
 *  error   → failed submit / validation
 */
const ios = Platform.OS === "ios";

function run(fn: () => Promise<unknown>) {
  if (!ios) return;
  fn().catch(() => {});
}

export const haptics = {
  select: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

export type HapticKind = keyof typeof haptics | false;
