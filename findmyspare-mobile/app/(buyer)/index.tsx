import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { PageShell } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/features/ProductCard";
import { CategoryCard } from "@/components/features/CategoryCard";
import { BannerCarousel } from "@/components/features/BannerCarousel";
import { BrandTile } from "@/components/features/BrandTile";
import { Touchable } from "@/components/ui/Touchable";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { productsApi, bannersApi } from "@/lib/api";
import { categories, makes } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";
import { C, shadowCard } from "@/lib/theme";
import { EASE, DURATION } from "@/lib/motion";
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function BuyerHome() {
  const router = useRouter();
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

  const firstName = user?.name?.split(" ")[0];
  const rows: ProductSummary[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));

  return (
    <PageShell padded={false} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      {/* ── Editorial hero ── */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: DURATION.slow, easing: EASE.out }}
        className="px-5 pt-2 pb-5"
      >
        <View className="flex-row items-start justify-between mb-5">
          <View className="flex-1 pr-3">
            <Text className="text-caption font-mono uppercase tracking-[0.14em] text-ink-3">{greeting()}</Text>
            {firstName ? <Text className="text-headline font-sans-bold text-ink mt-0.5">{firstName}</Text> : null}
          </View>
          {user ? (
            <Touchable scaleTo={0.92} onPress={() => router.push("/(buyer)/profile" as never)}>
              <Avatar name={user.name} image={user.image} size={44} />
            </Touchable>
          ) : (
            <Button label="Sign in" shape="pill" size="sm" onPress={() => router.push("/(auth)/login" as never)} />
          )}
        </View>

        <Text className="text-mega font-sans-extrabold text-ink">Find any{"\n"}part, fast.</Text>
        <Text className="text-body text-ink-2 mt-3 pr-8">
          Search thousands of genuine parts or post a request — verified suppliers quote in minutes.
        </Text>
      </MotiView>

      {/* ── Hero search ── */}
      <View className="px-5 mb-7">
        <SearchBar
          onPress={() => router.push("/(buyer)/search" as never)}
          placeholder="Search “brake pads”, “Swift”…"
        />
      </View>

      {banners.length > 0 && (
        <View className="px-5 mb-7">
          <BannerCarousel banners={banners} />
        </View>
      )}

      {/* ── Categories — large editorial tiles ── */}
      <SectionHeader
        title="Shop by category"
        actionLabel="All"
        onAction={() => router.push("/(buyer)/search" as never)}
        className="px-5 mb-3.5"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-3" className="mb-8">
        {categories.map((c, i) => (
          <MotiView
            key={c.label}
            from={{ opacity: 0, translateX: 16 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 260, delay: Math.min(i * 35, 350), easing: EASE.out }}
          >
            <CategoryCard
              label={c.label}
              count={c.count}
              icon={CATEGORY_ICON[c.label] || "pricetag-outline"}
              onPress={() => router.push(`/(buyer)/search?q=${encodeURIComponent(c.label)}` as never)}
            />
          </MotiView>
        ))}
      </ScrollView>

      {/* ── Post-request hero CTA ── */}
      <View className="px-5 mb-8">
        <PromoBanner
          title="Can't find a part?"
          subtitle="Post a request — verified suppliers quote in minutes."
          ctaLabel="Post a request"
          icon="construct-outline"
          onPress={() => router.push("/(buyer)/requests" as never)}
        />
      </View>

      {/* ── Brands ── */}
      <SectionHeader title="Shop by brand" className="px-5 mb-3.5" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 gap-3.5" className="mb-8">
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

      {/* ── Fresh arrivals ── */}
      <SectionHeader
        title="Fresh arrivals"
        actionLabel="See all"
        onAction={() => router.push("/(buyer)/search" as never)}
        className="px-5 mb-3.5"
      />

      <View className="px-5">
        {loading ? (
          <View className="gap-3.5">
            {[0, 1, 2].map((i) => (
              <View key={i} className="flex-row gap-3.5">
                <View className="flex-1"><ProductCardSkeleton /></View>
                <View className="flex-1"><ProductCardSkeleton /></View>
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <View className="bg-paper-2 rounded-xl2 p-8 items-center" style={shadowCard}>
            <View className="w-12 h-12 rounded-full bg-accent-wash items-center justify-center mb-2">
              <Icon name="sparkles" size={22} color={C.accent} />
            </View>
            <Text className="text-body font-sans-bold text-ink">Fresh inventory incoming</Text>
            <Text className="text-caption text-ink-3 mt-1 text-center">
              Post a request and verified suppliers will quote you directly.
            </Text>
          </View>
        ) : (
          <View className="gap-3.5">
            {rows.map((row, ri) => (
              <View key={ri} className="flex-row gap-3.5">
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
