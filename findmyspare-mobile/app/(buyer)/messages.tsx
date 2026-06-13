import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { PageShell } from "@/components/layout/PageShell";
import { Avatar } from "@/components/ui/Avatar";
import { Touchable } from "@/components/ui/Touchable";
import { getConversations } from "@/lib/api/messages";
import { useSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store";
import { AuthGate } from "@/components/features/AuthGate";
import type { Conversation } from "@/lib/types";
import { C } from "@/lib/theme";
import { EASE, DURATION, stagger } from "@/lib/motion";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function MessagesScreen() {
  const router = useRouter();
  const socket = useSocket();
  const user = useAuthStore((s) => s.user);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { conversations } = await getConversations();
      setConvos(conversations);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket || !user) return;
    socket.on("message:new", load);
    socket.on("message:read", load);
    return () => {
      socket.off("message:new", load);
      socket.off("message:read", load);
    };
  }, [socket, load, user]);

  if (!user) {
    return (
      <AuthGate
        icon="chatbubbles-outline"
        title="Sign in to see messages"
        subtitle="Chat directly with suppliers about your requests and quotes."
      />
    );
  }

  return (
    <PageShell
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load(); }}
    >
      <View className="pt-2 pb-4">
        <Text className="text-overline font-mono uppercase tracking-[0.14em] text-ink-3">Inbox</Text>
        <Text className="font-sans-extrabold text-hero text-ink mt-1">Messages</Text>
      </View>

      {loading ? (
        <View className="gap-2.5 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="bg-paper-2 rounded-card h-[72px]" />
          ))}
        </View>
      ) : convos.length === 0 ? (
        <View className="items-center mt-20 gap-3">
          <Icon name="chatbubbles-outline" size={48} color={C.ink3} />
          <Text className="text-ink-3 text-body">No conversations yet</Text>
        </View>
      ) : (
        <View>
          {convos.map((c, i) => (
            <MotiView
              key={c.userId}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: DURATION.base, delay: stagger(i, 30), easing: EASE.out }}
            >
              <Touchable
                onPress={() => router.push(`/messages/${c.userId}` as never)}
                scaleTo={0.98}
                className="flex-row items-center gap-3 py-3.5 border-b border-line"
              >
                <View>
                  <Avatar name={c.name} image={c.image} size={48} />
                  {c.unreadCount > 0 && (
                    <View className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-paper" />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text className={`text-body text-ink ${c.unreadCount > 0 ? "font-sans-extrabold" : "font-sans-semibold"}`} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text className="text-micro text-ink-3 font-mono">{timeAgo(c.lastMessageAt)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-0.5">
                    <Text className={`text-sub flex-1 mr-2 ${c.unreadCount > 0 ? "text-ink-2 font-sans-medium" : "text-ink-3"}`} numberOfLines={1}>
                      {c.lastMessage}
                    </Text>
                    {c.unreadCount > 0 && (
                      <View className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent items-center justify-center">
                        <Text className="text-white text-micro font-sans-bold">
                          {c.unreadCount > 99 ? "99+" : c.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {c.businessName && (
                    <Text className="text-micro text-ink-3" numberOfLines={1}>
                      {c.businessName}
                    </Text>
                  )}
                </View>
              </Touchable>
            </MotiView>
          ))}
        </View>
      )}
    </PageShell>
  );
}
