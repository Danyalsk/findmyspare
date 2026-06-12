import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { GlassTabBar } from "@/components/layout/GlassTabBar";
import { useAuthStore, getPostLoginPath } from "@/lib/store";

export default function AdminLayout() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.replace("/(auth)/login"); return; }
    if (!isAdmin) router.replace(getPostLoginPath(user) as never);
  }, [user, isHydrated, isAdmin, router]);

  if (!isHydrated || !isAdmin) return null;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Overview", tabBarIcon: ({ color, focused }) => <Icon name="stats-chart" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="suppliers" options={{ title: "Suppliers", tabBarIcon: ({ color, focused }) => <Icon name="shield-checkmark" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="users" options={{ title: "Users", tabBarIcon: ({ color, focused }) => <Icon name="people" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
      <Tabs.Screen name="profile" options={{ title: "You", tabBarIcon: ({ color, focused }) => <Icon name="person" size={23} color={color} weight={focused ? "fill" : "duotone"} /> }} />
    </Tabs>
  );
}
