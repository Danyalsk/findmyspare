import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { BidCard } from "@/components/features/BidCard";
import { inquiriesApi } from "@/lib/api/inquiries";
import { bidsApi } from "@/lib/api/bids";
import type { Bid, Inquiry } from "@/lib/types";
import { C } from "@/lib/theme";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [inq, bidRes] = await Promise.all([
        inquiriesApi.get(id),
        bidsApi.listForInquiry(id).catch(() => ({ bids: [] as Bid[], inquiry: undefined })),
      ]);
      setInquiry(inq.inquiry);
      // Bids come price-ascending from the API.
      setBids(bidRes.bids ?? []);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator color={C.accent} />
      </SafeAreaView>
    );
  }
  if (!inquiry) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
        <TopBar title="Request" back />
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-3">Request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title={inquiry.partName} back />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3">
        <Card className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans-extrabold text-title text-ink flex-1">{inquiry.partName}</Text>
            <Chip
              label={`${bids.length} ${bids.length === 1 ? "quote" : "quotes"}`}
              active={bids.length > 0}
            />
          </View>
          <Text className="text-sub text-ink-2">{inquiry.make} · {inquiry.model} · {inquiry.year}</Text>
          {inquiry.description ? (
            <Text className="text-sub text-ink-2 mt-1 leading-[19px]">{inquiry.description}</Text>
          ) : null}
          {inquiry.imageUrl ? (
            <Image
              source={{ uri: inquiry.imageUrl }}
              style={{ width: "100%", height: 180, borderRadius: 12, marginTop: 8 }}
              contentFit="cover"
            />
          ) : null}
        </Card>

        <Text className="text-caption font-mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">
          Supplier quotes
        </Text>

        {bids.length === 0 ? (
          <View className="items-center mt-10 gap-3">
            <Icon name="hourglass-outline" size={42} color={C.ink3} />
            <Text className="text-ink-2 text-body font-sans-medium">Waiting for quotes</Text>
            <Text className="text-ink-3 text-caption text-center px-8">
              Verified suppliers are reviewing your request. You&apos;ll be notified when quotes arrive.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {bids.map((b, i) => (
              <BidCard
                key={b.id}
                bid={b}
                partName={inquiry.partName}
                best={i === 0 && bids.length > 1}
                onMessage={(supplierId) => router.push(`/messages/${supplierId}` as never)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
