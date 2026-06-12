import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { GlassTabBar } from "@/components/layout/GlassTabBar";
import { useAuthStore, getPostLoginPath } from "@/lib/store";

export default function BuyerLayout() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  // Guests may browse this storefront; only a logged-in non-buyer is bounced.
  useEffect(() => {
    if (!isHydrated) return;
    if (user && user.role !== "buyer") router.replace(getPostLoginPath(user) as never);
  }, [user, isHydrated, router]);

  if (!isHydrated) return null;
  if (user && user.role !== "buyer") return null;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Icon name="home" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="search" options={{ title: "Browse", tabBarIcon: ({ color, focused }) => <Icon name="search" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="requests" options={{ title: "Request", tabBarIcon: ({ color, focused }) => <Icon name="add-circle" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color, focused }) => <Icon name="chatbubble" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="profile" options={{ title: "You", tabBarIcon: ({ color, focused }) => <Icon name="person" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
    </Tabs>
  );
}
