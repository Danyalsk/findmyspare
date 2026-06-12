import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { GlassTabBar } from "@/components/layout/GlassTabBar";
import { useAuthStore, getPostLoginPath } from "@/lib/store";

export default function SupplierLayout() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.replace("/(auth)/login"); return; }
    if (user.role !== "supplier") router.replace(getPostLoginPath(user) as never);
  }, [user, isHydrated, router]);

  if (!isHydrated || !user || user.role !== "supplier") return null;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Dash", tabBarIcon: ({ color, focused }) => <Icon name="speedometer" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="products" options={{ title: "Inventory", tabBarIcon: ({ color, focused }) => <Icon name="cube" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="leads" options={{ title: "Leads", tabBarIcon: ({ color, focused }) => <Icon name="radio-outline" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color, focused }) => <Icon name="chatbubble" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="profile" options={{ title: "You", tabBarIcon: ({ color, focused }) => <Icon name="person" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="pending" options={{ href: null }} />
      <Tabs.Screen name="rejected" options={{ href: null }} />
    </Tabs>
  );
}
