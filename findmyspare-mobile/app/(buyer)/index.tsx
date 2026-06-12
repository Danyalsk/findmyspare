import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { PageShell } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/features/ProductCard";
import { BannerCarousel } from "@/components/features/BannerCarousel";
import { BrandTile } from "@/components/features/BrandTile";
import { Touchable } from "@/components/ui/Touchable";
import { SPRING, useReducedMotion } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { GradientFill } from "@/components/ui/Gradient";
import { Avatar } from "@/components/ui/Avatar";
import { productsApi, bannersApi } from "@/lib/api";
import { categories, makes } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";
import { C, GRADIENT, glowAccent, shadowCard } from "@/lib/theme";
import type { Banner, ProductSummary } from "@/lib/types";

const CATEGORY_ICON: Record<string, IconName> = {
  Engine: "cog-outline",
  Brakes: "disc-outline",
  Suspension: "car-sport-outline",
  Electrical: "flash-outline",
  Transmission: "settings-outline",
  "Body Panels": "car-outline",
  Cooling: "snow-outline",
  "Fuel System": "water-outline",
  Exhaust: "cloud-outline",
  Lighting: "bulb-outline",
  Bumpers: "shield-outline",
  Steering: "navigate-outline",
};

export default function BuyerHome() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [pRes, bRes] = await Promise.allSettled([
        productsApi.list({ limit: 12, sort: "newest" }),
        bannersApi.listActive(),
      ]);
      if (pRes.status === "fulfilled") setProducts(pRes.value.products);
      if (bRes.status === "fulfilled") setBanners(bRes.value.banners);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const location = user?.city || "All India";
  const rows: ProductSummary[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));

  return (
    <PageShell padded={false} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      {/* ── Header: location + account ── */}
      <View className="px-5 pt-1 pb-3 flex-row items-center justify-between">
        <Touchable scaleTo={0.98} className="flex-row items-center gap-2 flex-1">
          <View className="w-9 h-9 rounded-full bg-accent-wash items-center justify-center">
            <Icon name="location" size={18} color={C.accent} />
          </View>
          <View className="flex-1">
            <Text className="text-micro font-mono uppercase tracking-[0.1em] text-ink-3">Find parts in</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-body font-sans-bold text-ink" numberOfLines={1}>{location}</Text>
              <Icon name="chevron-down" size={14} color={C.ink2} />
            </View>
          </View>
        </Touchable>
        {user ? (
          <Touchable scaleTo={0.92} onPress={() => router.push("/(buyer)/profile" as never)}>
            <Avatar name={user.name} image={user.image} size={40} />
          </Touchable>
        ) : (
          <Pressable onPress={() => router.push("/(auth)/login" as never)} onPressIn={() => haptics.light()}>
            {({ pressed }) => (
              <MotiView
                animate={{ scale: pressed && !reduced ? 0.95 : 1 }}
                transition={SPRING.press}
                style={glowAccent}
                className="overflow-hidden rounded-full px-5 py-2.5"
              >
                <GradientFill colors={GRADIENT} />
                <Text style={{ color: C.onAccent }} className="text-sub font-sans-bold">Sign in</Text>
              </MotiView>
            )}
          </Pressable>
        )}
      </View>

      {/* ── Search ── */}
      <Touchable
        onPress={() => router.push("/(buyer)/search" as never)}
        scaleTo={0.98}
        haptic="select"
        className="mx-5 mb-5 flex-row items-center bg-paper-2 border border-line-2 rounded-card px-4 py-3.5"
        style={shadowCard}
      >
        <Icon name="search" size={20} color={C.accent} />
        <Text className="text-ink-3 text-body ml-2.5 flex-1">Search “brake pads”, “Swift”…</Text>
        <Icon name="options-outline" size={18} color={C.ink3} />
      </Touchable>

      {banners.length > 0 && (
        <View className="px-5">
          <BannerCarousel banners={banners} />
        </View>
      )}

      {/* ── Categories (circular rail) ── */}
      <View className="flex-row items-baseline justify-between px-5 mb-3">
        <Text className="text-headline font-sans-bold text-ink">Shop by category</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-4" className="mb-7">
        {categories.map((c, i) => (
          <MotiView
            key={c.label}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 220, delay: Math.min(i * 30, 300) }}
          >
            <Touchable
              onPress={() => router.push(`/(buyer)/search?q=${encodeURIComponent(c.label)}` as never)}
              scaleTo={0.94}
              className="items-center gap-2"
              style={{ width: 68 }}
            >
              <View className="w-16 h-16 rounded-full bg-accent-wash border border-line items-center justify-center">
                <Icon name={CATEGORY_ICON[c.label] || "pricetag-outline"} size={26} color={C.accent} />
              </View>
              <Text className="text-micro text-ink-2 font-sans-medium text-center" numberOfLines={1}>{c.label}</Text>
            </Touchable>
          </MotiView>
        ))}
      </ScrollView>

      {/* ── Offer / Post-request CTA ── */}
      <Pressable onPress={() => router.push("/(buyer)/requests" as never)} className="px-5 mb-7">
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed ? 0.98 : 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 280 }}
            style={glowAccent}
            className="overflow-hidden rounded-card p-5 flex-row items-center"
          >
            <GradientFill colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <View className="flex-1 pr-3">
              <Text style={{ color: C.onAccent }} className="text-headline font-sans-extrabold">Can&apos;t find a part?</Text>
              <Text style={{ color: "rgba(255,255,255,0.9)" }} className="text-sub mt-1">
                Post a request — verified suppliers quote in minutes.
              </Text>
              <View className="self-start mt-3 bg-white rounded-full px-4 py-2 flex-row items-center gap-1.5">
                <Icon name="add" size={15} color={C.accent} />
                <Text style={{ color: C.accentInk }} className="text-caption font-sans-bold">Post a request</Text>
              </View>
            </View>
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <Icon name="construct-outline" size={26} color={C.onAccent} />
            </View>
          </MotiView>
        )}
      </Pressable>

      {/* ── Brands (circular rail) ── */}
      <Text className="text-headline font-sans-bold text-ink px-5 mb-3">Browse by brand</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-3.5" className="mb-7">
        {makes.map((m) => (
          <Touchable
            key={m}
            onPress={() => router.push(`/(buyer)/search?q=${encodeURIComponent(m)}` as never)}
            scaleTo={0.93}
            className="items-center gap-2"
            style={{ width: 64 }}
          >
            <BrandTile name={m} size={64} />
            <Text className="text-micro text-ink-2 font-sans-medium text-center" numberOfLines={1}>{m.split(" ")[0]}</Text>
          </Touchable>
        ))}
      </ScrollView>

      {/* ── Section divider band ── */}
      <View className="mb-7" />

      {/* ── Featured ── */}
      <View className="flex-row items-baseline justify-between px-5 mb-3">
        <Text className="text-headline font-sans-bold text-ink">Fresh arrivals</Text>
        <Pressable onPress={() => router.push("/(buyer)/search" as never)}>
          <Text className="text-caption text-accent-ink font-sans-bold">See all</Text>
        </Pressable>
      </View>

      <View className="px-5">
        {loading ? (
          <View className="gap-3">
            {[0, 1, 2].map((i) => (
              <View key={i} className="flex-row gap-3">
                <View className="flex-1"><ProductCardSkeleton /></View>
                <View className="flex-1"><ProductCardSkeleton /></View>
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <View className="bg-paper-2 border border-line rounded-card p-8 items-center" style={shadowCard}>
            <View className="w-12 h-12 rounded-full bg-accent-wash items-center justify-center mb-2">
              <Icon name="sparkles" size={22} color={C.accent} />
            </View>
            <Text className="text-body font-sans-bold text-ink">Fresh inventory incoming</Text>
            <Text className="text-caption text-ink-3 mt-1 text-center">
              Post a request and verified suppliers will quote you directly.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {rows.map((row, ri) => (
              <View key={ri} className="flex-row gap-3">
                {row.map((p, ci) => (
                  <ProductCard key={p.id} product={p} index={ri * 2 + ci} />
                ))}
                {row.length === 1 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        )}
      </View>
    </PageShell>
  );
}
