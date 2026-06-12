import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { supplierApi } from "@/lib/api/supplier";
import { notificationsApi } from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/store";
import type { SupplierDashboard } from "@/lib/types";
import { C } from "@/lib/theme";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function SupplierHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<SupplierDashboard | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, n] = await Promise.all([
        supplierApi.dashboard(),
        notificationsApi.list({ limit: 1 }).catch(() => ({ unreadCount: 0 })),
      ]);
      setStats(s);
      setUnread((n as { unreadCount: number }).unreadCount ?? 0);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View className="pt-3 pb-4 flex-row items-start justify-between">
        <View className="flex-1">
          {user?.businessName && (
            <Text className="text-ink-3 text-[11px] mono uppercase tracking-[0.08em]">{user.businessName}</Text>
          )}
          <Text className="serif text-[26px] text-ink mt-1">{greeting()}, {firstName} 👋</Text>
          <Text className="text-ink-3 text-[12px] mt-1">Here&apos;s your shop today</Text>
        </View>
        <Pressable
          onPress={() => router.push("/profile/notifications" as never)}
          className="w-10 h-10 rounded-full bg-paper-2 border border-line items-center justify-center"
        >
          <Icon name="notifications-outline" size={18} color={C.ink} />
          {unread > 0 && (
            <View className="absolute -top-1 -right-1 bg-accent-ink rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center">
              <Text className="text-paper text-[10px] font-bold">{unread > 9 ? "9+" : unread}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {loading ? (
        <View className="gap-3">
          {[0, 1].map((i) => <Skeleton key={i} height={90} />)}
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          <Kpi label="Active orders" value={stats?.pendingOrderCount ?? 0} icon="cube-outline" delay={0} />
          <Kpi label="Active quotes" value={stats?.activeBids ?? 0} icon="pricetag-outline" delay={60} />
          <Kpi label="Open leads" value={stats?.openInquiries ?? 0} icon="radio-outline" delay={120} />
          <Kpi label="Messages" value={unread} icon="chatbubble-outline" delay={180} />
        </View>
      )}

      <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Quick actions</Text>
      <View className="flex-row flex-wrap gap-3">
        <Action label="Add item" icon="add-circle-outline" onPress={() => router.push("/supplier/products/new?draft=1" as never)} />
        <Action label="Orders" icon="cube-outline" onPress={() => router.push("/supplier/orders" as never)} />
        <Action label="Inventory" icon="grid-outline" onPress={() => router.push("/(supplier)/products" as never)} />
        <Action label="Messages" icon="chatbubble-outline" onPress={() => router.push("/(supplier)/messages" as never)} />
      </View>
    </PageShell>
  );
}

function Kpi({ label, value, icon, delay }: { label: string; value: number; icon: IconName; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, delay }}
      style={{ width: "47%" }}
    >
      <Card>
        <Icon name={icon} size={18} color={C.accent} />
        <Text className="serif text-[28px] text-ink mt-2">{value}</Text>
        <Text className="text-[12px] text-ink-3 mt-0.5">{label}</Text>
      </Card>
    </MotiView>
  );
}

function Action({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: "47%" }} className="bg-paper border border-line rounded-card px-4 py-4 flex-row items-center gap-2.5">
      <Icon name={icon} size={18} color={C.ink} />
      <Text className="text-[13px] font-semibold text-ink flex-1">{label}</Text>
    </Pressable>
  );
}
