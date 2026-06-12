import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/lib/store";
import { useSocket } from "@/lib/socket";
import { getUnreadCount } from "@/lib/api/messages";
import { C, shadowFloat } from "@/lib/theme";
import { SPRING, DURATION, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";

/** Floating frosted-glass pill tab bar — accent-highlighted active tab. */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();
  const reduced = useReducedMotion();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const refresh = () => getUnreadCount().then((r) => setUnread(r.unread)).catch(() => {});
    refresh();
    if (!socket) return;
    socket.on("message:new", refresh);
    socket.on("message:read", refresh);
    return () => { socket.off("message:new", refresh); socket.off("message:read", refresh); };
  }, [socket, user]);

  const routes = state.routes.filter(
    (r) => (descriptors[r.key].options as { href?: string | null }).href !== null
  );

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
      className="items-center"
    >
      <View style={[shadowFloat, { marginBottom: insets.bottom > 0 ? insets.bottom : 14 }]} className="rounded-full overflow-hidden">
        <BlurView intensity={70} tint="light" className="flex-row items-center px-2 py-2 rounded-full" style={{ backgroundColor: C.glassTab, borderWidth: 1, borderColor: C.line }}>
          {routes.map((route) => {
            const { options } = descriptors[route.key];
            const realIndex = state.routes.findIndex((r) => r.key === route.key);
            const focused = state.index === realIndex;
            const label = (options.title ?? route.name) as string;
            const color = focused ? C.accent : C.ink3;
            const icon = options.tabBarIcon?.({ focused, color, size: 23 }) ?? null;
            const showBadge = route.name === "messages" && unread > 0;

            const onPress = () => {
              const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name as never);
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onPressIn={() => { if (!focused) haptics.select(); }}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
              >
                {({ pressed }) => (
                <MotiView
                  animate={{
                    backgroundColor: focused ? C.accentWash : "rgba(0,0,0,0)",
                    scale: pressed && !reduced ? 0.94 : 1,
                  }}
                  transition={{ backgroundColor: { type: "timing", duration: DURATION.base }, scale: SPRING.press }}
                  className="flex-row items-center rounded-full px-3.5 py-2.5"
                >
                  <View>
                    {icon}
                    {showBadge && (
                      <View className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-danger items-center justify-center">
                        <Text className="text-white text-micro font-sans-bold">{unread > 9 ? "9+" : unread}</Text>
                      </View>
                    )}
                  </View>
                  {focused && (
                    <MotiView from={{ opacity: 0, translateX: -4 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: DURATION.fast }}>
                      <Text style={{ color: C.accentInk }} className="text-caption font-sans-bold ml-1.5">{label}</Text>
                    </MotiView>
                  )}
                </MotiView>
                )}
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
