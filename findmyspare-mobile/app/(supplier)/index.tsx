import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Skeleton, ProductCardSkeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/features/ProductCard";
import { Touchable } from "@/components/ui/Touchable";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { supplierApi } from "@/lib/api/supplier";
import { notificationsApi } from "@/lib/api/notifications";
import { inquiriesApi } from "@/lib/api/inquiries";
import { productsApi } from "@/lib/api/products";
import { useAuthStore } from "@/lib/store";
import type { SupplierDashboard, Inquiry, ProductSummary } from "@/lib/types";
import { C, shadowCard } from "@/lib/theme";
import { EASE } from "@/lib/motion";

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
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [feed, setFeed] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
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

  const loadFeed = useCallback(async () => {
    try {
      const [lRes, pRes] = await Promise.allSettled([
        inquiriesApi.active({ limit: 10 }),
        productsApi.list({ limit: 10, sort: "newest" }),
      ]);
      if (lRes.status === "fulfilled") setLeads(lRes.value.inquiries);
      if (pRes.status === "fulfilled") setFeed(pRes.value.products);
    } catch {} finally { setFeedLoading(false); }
  }, []);

  useEffect(() => { load(); loadFeed(); }, [load, loadFeed]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); loadFeed(); }}>
      <View className="pt-2 pb-5 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-overline font-mono uppercase tracking-[0.14em] text-ink-3">
            {greeting()}{user?.businessName ? ` · ${user.businessName}` : ""}
          </Text>
          <Text className="font-sans-extrabold text-hero text-ink mt-1">Hey {firstName}.</Text>
          <Text className="text-ink-2 text-body mt-1.5">Here&apos;s your shop today.</Text>
        </View>
        <Touchable
          scaleTo={0.92}
          onPress={() => router.push("/profile/notifications" as never)}
          style={shadowCard}
          className="w-11 h-11 rounded-full bg-paper-2 items-center justify-center"
        >
          <Icon name="notifications-outline" size={19} color={C.ink} />
          {unread > 0 && (
            <View className="absolute -top-1 -right-1 bg-accent rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center">
              <Text className="text-white text-micro font-sans-bold">{unread > 9 ? "9+" : unread}</Text>
            </View>
          )}
        </Touchable>
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

      <Text className="text-caption font-mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Quick actions</Text>
      <View className="flex-row flex-wrap gap-3">
        <Action label="Add item" icon="add-circle-outline" onPress={() => router.push("/supplier/products/new?draft=1" as never)} />
        <Action label="Orders" icon="cube-outline" onPress={() => router.push("/supplier/orders" as never)} />
        <Action label="Inventory" icon="grid-outline" onPress={() => router.push("/(supplier)/products" as never)} />
        <Action label="Messages" icon="chatbubble-outline" onPress={() => router.push("/(supplier)/messages" as never)} />
      </View>

      {/* ── Latest requests (buyer part-requests / leads) ── */}
      <SectionHeader
        title="Latest requests"
        subtitle="What buyers are looking for"
        actionLabel="See all"
        onAction={() => router.push("/(supplier)/leads" as never)}
        className="mt-7 mb-3"
      />
      {feedLoading ? (
        <View className="gap-2.5">{[0, 1, 2].map((i) => <Skeleton key={i} height={84} />)}</View>
      ) : leads.length === 0 ? (
        <Card className="!p-6 items-center">
          <Icon name="radio-outline" size={26} color={C.ink3} />
          <Text className="text-caption text-ink-3 mt-2">No open requests right now</Text>
        </Card>
      ) : (
        <View className="gap-2.5">
          {leads.map((it, i) => <LeadRow key={it.id} inquiry={it} index={i} onPress={() => router.push(`/supplier/leads/${it.id}` as never)} />)}
        </View>
      )}

      {/* ── New on marketplace (product listings) ── */}
      <SectionHeader
        title="New on marketplace"
        subtitle="Fresh listings from other suppliers"
        actionLabel="See all"
        onAction={() => router.push("/supplier/marketplace" as never)}
        className="mt-7 mb-3"
      />
      {feedLoading ? (
        <View className="flex-row gap-3.5">
          <View className="flex-1"><ProductCardSkeleton /></View>
          <View className="flex-1"><ProductCardSkeleton /></View>
        </View>
      ) : feed.length === 0 ? (
        <Card className="!p-6 items-center">
          <Icon name="cube-outline" size={26} color={C.ink3} />
          <Text className="text-caption text-ink-3 mt-2">No listings yet</Text>
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3.5 pr-1">
          {feed.map((p, i) => (
            <View key={p.id} style={{ width: 158 }}><ProductCard product={p} index={i} /></View>
          ))}
        </ScrollView>
      )}
    </PageShell>
  );
}

function LeadRow({ inquiry, index, onPress }: { inquiry: Inquiry; index: number; onPress: () => void }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 220, delay: Math.min(index, 8) * 30 }}
    >
      <Pressable onPress={onPress}>
        <Card>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-body font-sans-semibold text-ink flex-1 pr-2" numberOfLines={1}>{inquiry.partName}</Text>
            <Chip label={`${inquiry.bidCount ?? 0} bids`} tone="accent" active={(inquiry.bidCount ?? 0) > 0} />
          </View>
          <Text className="text-caption text-ink-3">{inquiry.make} · {inquiry.model} · {inquiry.year}</Text>
          <View className="flex-row items-center justify-between mt-2">
            {inquiry.buyerName ? (
              <Text className="text-micro text-accent-ink font-sans-semibold">{inquiry.buyerName}</Text>
            ) : <View />}
            <View className="flex-row items-center gap-1">
              <Text className="text-micro text-accent-ink font-sans-semibold">Quote</Text>
              <Icon name="chevron-forward" size={13} color={C.accent} />
            </View>
          </View>
        </Card>
      </Pressable>
    </MotiView>
  );
}

function Kpi({ label, value, icon, delay }: { label: string; value: number; icon: IconName; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320, delay, easing: EASE.out }}
      style={[{ width: "47%" }, shadowCard]}
      className="bg-paper-2 rounded-xl2 p-4"
    >
      <View className="w-9 h-9 rounded-full bg-accent-wash items-center justify-center">
        <Icon name={icon} size={18} color={C.accent} />
      </View>
      <AnimatedCounter value={value} className="font-sans-extrabold text-mega text-ink mt-3" />
      <Text className="text-caption text-ink-3 mt-0.5">{label}</Text>
    </MotiView>
  );
}

function Action({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  return (
    <View style={{ width: "47%" }}>
      <Card onPress={onPress} className="!px-4 !py-4 flex-row items-center gap-2.5">
        <Icon name={icon} size={18} color={C.accentInk} />
        <Text className="text-sub font-sans-semibold text-ink flex-1">{label}</Text>
      </Card>
    </View>
  );
}
