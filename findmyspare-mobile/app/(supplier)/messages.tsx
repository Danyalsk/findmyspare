import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { PageShell } from "@/components/layout/PageShell";
import { Avatar } from "@/components/ui/Avatar";
import { getConversations } from "@/lib/api/messages";
import { useSocket } from "@/lib/socket";
import type { Conversation } from "@/lib/types";
import { C } from "@/lib/theme";

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
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { conversations } = await getConversations();
      setConvos(conversations);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return;
    socket.on("message:new", load);
    socket.on("message:read", load);
    return () => {
      socket.off("message:new", load);
      socket.off("message:read", load);
    };
  }, [socket, load]);

  return (
    <PageShell
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load(); }}
    >
      <View className="pt-3 pb-3">
        <Text className="serif text-[24px] text-ink">Messages</Text>
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
          <Text className="text-ink-3 text-[14px]">No conversations yet</Text>
        </View>
      ) : (
        <View>
          {convos.map((c, i) => (
            <MotiView
              key={c.userId}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 200, delay: i * 25 }}
            >
              <Pressable
                onPress={() => router.push(`/messages/${c.userId}` as never)}
                className="flex-row items-center gap-3 py-3.5 border-b border-line"
              >
                <Avatar name={c.name} image={c.image} size={44} />
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[14px] font-semibold text-ink" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text className="text-[11px] text-ink-3">{timeAgo(c.lastMessageAt)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-0.5">
                    <Text className="text-[13px] text-ink-3 flex-1 mr-2" numberOfLines={1}>
                      {c.lastMessage}
                    </Text>
                    {c.unreadCount > 0 && (
                      <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-ink items-center justify-center">
                        <Text className="text-paper text-[10px] font-semibold">
                          {c.unreadCount > 99 ? "99+" : c.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {c.businessName && (
                    <Text className="text-[11px] text-ink-3" numberOfLines={1}>
                      {c.businessName}
                    </Text>
                  )}
                </View>
              </Pressable>
            </MotiView>
          ))}
        </View>
      )}
    </PageShell>
  );
}
