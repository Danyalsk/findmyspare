import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { useFocusEffect } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { adminApi } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/store";
import type { AdminStats } from "@/lib/types";
import { C, shadowCard } from "@/lib/theme";
import { EASE } from "@/lib/motion";

export default function AdminOverview() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setStats(await adminApi.stats());
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const cards: { label: string; value: number; icon: IconName; highlight?: boolean }[] = [
    { label: "Pending suppliers", value: stats?.pendingSuppliers ?? 0, icon: "hourglass-outline", highlight: (stats?.pendingSuppliers ?? 0) > 0 },
    { label: "Total users", value: stats?.totalUsers ?? 0, icon: "people-outline" },
    { label: "Suppliers", value: stats?.totalSuppliers ?? 0, icon: "storefront-outline" },
    { label: "Buyers", value: stats?.totalBuyers ?? 0, icon: "cart-outline" },
    { label: "Products", value: stats?.totalProducts ?? 0, icon: "cube-outline" },
    { label: "Inquiries", value: stats?.totalInquiries ?? 0, icon: "document-text-outline" },
  ];

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View className="pt-2 pb-5">
        <Text className="text-overline font-mono uppercase tracking-[0.14em] text-ink-3">Admin · {user?.name}</Text>
        <Text className="font-sans-extrabold text-hero text-ink mt-1">Platform{"\n"}overview</Text>
      </View>

      {loading ? (
        <View className="flex-row flex-wrap gap-3">
          {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: "47%" }}><Skeleton height={120} radius={20} /></View>)}
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {cards.map((c, i) => (
            <MotiView
              key={c.label}
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: i * 50, easing: EASE.out }}
              style={[{ width: "47%" }, shadowCard]}
              className={`bg-paper-2 rounded-xl2 p-4 ${c.highlight ? "border border-accent" : ""}`}
            >
              <View className={`w-9 h-9 rounded-full items-center justify-center ${c.highlight ? "bg-accent-wash" : "bg-paper-3"}`}>
                <Icon name={c.icon} size={18} color={c.highlight ? C.accent : C.ink2} />
              </View>
              <AnimatedCounter value={c.value} className="font-sans-extrabold text-mega text-ink mt-3" />
              <Text className="text-caption text-ink-3 mt-0.5">{c.label}</Text>
            </MotiView>
          ))}
        </View>
      )}

      {(stats?.pendingSuppliers ?? 0) > 0 && (
        <View className="mt-5 bg-accent-wash rounded-xl2 p-4 flex-row items-center gap-2.5">
          <Icon name="alert-circle" size={20} color={C.accent} />
          <Text className="text-sub text-accent-ink flex-1 font-sans-medium">
            {stats?.pendingSuppliers} supplier{(stats?.pendingSuppliers ?? 0) > 1 ? "s" : ""} awaiting review — see the Suppliers tab.
          </Text>
        </View>
      )}
    </PageShell>
  );
}
