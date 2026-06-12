import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { useFocusEffect } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminApi } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/store";
import type { AdminStats } from "@/lib/types";
import { C } from "@/lib/theme";

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
      <View className="pt-3 pb-4">
        <Text className="text-ink-3 text-[11px] mono uppercase tracking-[0.08em]">Admin</Text>
        <Text className="serif text-[26px] text-ink mt-1">Platform overview</Text>
        <Text className="text-ink-3 text-[12px] mt-1">{user?.name}</Text>
      </View>

      {loading ? (
        <View className="flex-row flex-wrap gap-3">
          {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: "47%" }}><Skeleton height={96} /></View>)}
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {cards.map((c, i) => (
            <MotiView
              key={c.label}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 260, delay: i * 50 }}
              style={{ width: "47%" }}
            >
              <Card className={c.highlight ? "border-accent-ink" : ""}>
                <Icon name={c.icon} size={18} color={c.highlight ? C.accent : C.ink3} />
                <Text className="serif text-[28px] text-ink mt-2">{c.value}</Text>
                <Text className="text-[12px] text-ink-3 mt-0.5">{c.label}</Text>
              </Card>
            </MotiView>
          ))}
        </View>
      )}

      {(stats?.pendingSuppliers ?? 0) > 0 && (
        <View className="mt-5 bg-accent-wash rounded-card p-4 flex-row items-center gap-2">
          <Icon name="alert-circle" size={18} color={C.accent} />
          <Text className="text-[13px] text-accent-ink flex-1">
            {stats?.pendingSuppliers} supplier{(stats?.pendingSuppliers ?? 0) > 1 ? "s" : ""} awaiting review — see the Suppliers tab.
          </Text>
        </View>
      )}
    </PageShell>
  );
}
