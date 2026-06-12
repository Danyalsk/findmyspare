import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { inquiriesApi } from "@/lib/api/inquiries";
import { useSocket } from "@/lib/socket";
import type { Inquiry } from "@/lib/types";
import { C } from "@/lib/theme";

export default function SupplierLeads() {
  const router = useRouter();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [live, setLive] = useState(false);
  const socket = useSocket();

  const load = useCallback(async () => {
    try {
      const r = await inquiriesApi.active({ limit: 100 });
      setItems(r.inquiries);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (inq: Inquiry) => setItems((prev) => [inq, ...prev.filter((p) => p.id !== inq.id)]);
    const onConnect = () => setLive(true);
    const onDisconnect = () => setLive(false);
    setLive(socket.connected);
    socket.on("inquiry:created", onNew);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("inquiry:created", onNew);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const filtered = q.trim()
    ? items.filter((it) =>
        `${it.partName} ${it.make} ${it.model}`.toLowerCase().includes(q.trim().toLowerCase())
      )
    : items;

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View className="pt-3 pb-3">
        <View className="flex-row items-center gap-2">
          <Text className="font-sans-extrabold text-title text-ink">Live leads</Text>
          <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${live ? "bg-accent-wash" : "bg-paper-2"}`}>
            <View className={`w-1.5 h-1.5 rounded-full ${live ? "bg-accent-ink" : "bg-ink-3"}`} />
            <Text className={`text-micro font-mono ${live ? "text-accent-ink" : "text-ink-3"}`}>
              {live ? "LIVE" : "OFFLINE"}
            </Text>
          </View>
        </View>
        <Text className="text-ink-3 text-caption mt-1">{filtered.length} open requests</Text>
      </View>

      <View className="flex-row items-center bg-paper-2 border border-line rounded-input px-3 mb-4">
        <Icon name="search" size={16} color={C.ink3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search leads…"
          placeholderTextColor={C.ink3}
          className="flex-1 py-2.5 px-2 text-body text-ink"
        />
      </View>

      {loading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} height={100} />)}
        </View>
      ) : filtered.length === 0 ? (
        <View className="items-center mt-20 gap-2">
          <Icon name="radio-outline" size={44} color={C.ink3} />
          <Text className="text-ink-3 text-body">No open leads</Text>
          <Text className="text-ink-3 text-caption">New requests appear here in real-time.</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {filtered.map((it, i) => (
            <MotiView
              key={it.id}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 220, delay: Math.min(i, 8) * 30 }}
            >
              <Pressable onPress={() => router.push(`/supplier/leads/${it.id}` as never)}>
                <Card>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-body font-sans-semibold text-ink flex-1" numberOfLines={1}>
                      {it.partName}
                    </Text>
                    <Chip label={`${it.bidCount ?? 0} bids`} active={(it.bidCount ?? 0) > 0} />
                  </View>
                  <Text className="text-caption text-ink-3">
                    {it.make} · {it.model} · {it.year}
                  </Text>
                  {it.description && (
                    <Text className="text-caption text-ink-2 mt-1.5" numberOfLines={2}>
                      {it.description}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between mt-2">
                    {it.buyerName ? (
                      <Text className="text-micro text-accent-ink font-sans-semibold">{it.buyerName}</Text>
                    ) : <View />}
                    <View className="flex-row items-center gap-1">
                      <Text className="text-micro text-accent-ink font-sans-semibold">Quote</Text>
                      <Icon name="chevron-forward" size={13} color={C.accent} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            </MotiView>
          ))}
        </View>
      )}
    </PageShell>
  );
}
