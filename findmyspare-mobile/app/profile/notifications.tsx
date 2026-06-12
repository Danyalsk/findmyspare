import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { TopBar } from "@/components/layout/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { notificationsApi } from "@/lib/api/notifications";
import type { AppNotification } from "@/lib/types";
import { C } from "@/lib/theme";

const ICON: Record<string, IconName> = {
  new_bid: "pricetag-outline",
  bid_accepted: "checkmark-circle-outline",
  new_order: "cube-outline",
  order_update: "sync-outline",
  dispute_raised: "alert-circle-outline",
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await notificationsApi.list({ limit: 50 });
      setItems(r.notifications);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationsApi.markAllRead().catch(() => {});
  }

  async function tap(n: AppNotification) {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    await notificationsApi.markRead(n.id).catch(() => {});
  }

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar
        title="Notifications"
        back
        right={
          hasUnread ? (
            <Pressable onPress={markAll} className="px-2">
              <Text className="text-caption text-accent-ink font-sans-semibold">Mark all</Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12 pt-3"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />}
      >
        {loading ? (
          <View className="gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} height={70} />)}</View>
        ) : items.length === 0 ? (
          <View className="items-center mt-20 gap-3">
            <Icon name="notifications-off-outline" size={46} color={C.ink3} />
            <Text className="text-ink-3 text-body">No notifications yet</Text>
          </View>
        ) : (
          <View className="gap-2">
            {items.map((n, i) => (
              <MotiView
                key={n.id}
                from={{ opacity: 0, translateY: 6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 200, delay: Math.min(i, 8) * 25 }}
              >
                <Pressable
                  onPress={() => tap(n)}
                  className={`flex-row gap-3 rounded-card px-4 py-3.5 border ${n.isRead ? "bg-paper border-line" : "bg-accent-wash border-accent-ink/30"}`}
                >
                  <View className="w-9 h-9 rounded-full bg-paper-2 items-center justify-center">
                    <Icon name={ICON[n.type] || "notifications-outline"} size={17} color={C.accent} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sub font-sans-semibold text-ink flex-1" numberOfLines={1}>{n.title}</Text>
                      <Text className="text-micro text-ink-3 ml-2">{relTime(n.createdAt)}</Text>
                    </View>
                    <Text className="text-caption text-ink-2 mt-0.5" numberOfLines={2}>{n.message}</Text>
                  </View>
                  {!n.isRead && <View className="w-2 h-2 rounded-full bg-accent-ink mt-1" />}
                </Pressable>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
