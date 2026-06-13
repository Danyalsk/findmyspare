import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParallaxScrollView } from "@/components/layout/ParallaxScrollView";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/constants";
import { openWhatsApp, waTemplates } from "@/lib/whatsapp";
import { useAuthStore } from "@/lib/store";
import type { ProductDetail } from "@/lib/types";
import { C, shadowFloat } from "@/lib/theme";
import { EASE, DURATION } from "@/lib/motion";

function Section({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: DURATION.slow, delay, easing: EASE.out }}
      className="mt-6"
    >
      <Text className="text-caption font-sans-bold text-ink-2 mb-2.5 uppercase font-mono tracking-[0.1em]">{title}</Text>
      {children}
    </MotiView>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [p, setP] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const r = await productsApi.get(id);
      setP(r.product);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }
  if (!p) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center">
        <Text className="text-ink-3">Product not found</Text>
      </SafeAreaView>
    );
  }

  const headerH = width;
  const inStock = p.stockQuantity > 0;

  const header = (
    <View style={{ width, height: headerH }} className="bg-paper-3">
      {p.images && p.images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {p.images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={{ width, height: headerH }} contentFit="cover" />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Icon name="cube-outline" size={56} color={C.ink3} />
        </View>
      )}
    </View>
  );

  const overlay = (
    <>
      <View style={{ position: "absolute", top: insets.top + 6, left: 16, zIndex: 10 }}>
        <Pressable onPress={() => router.back()} className="rounded-full overflow-hidden" style={shadowFloat}>
          <BlurView intensity={60} tint="light" className="w-10 h-10 items-center justify-center">
            <Icon name="chevron-back" size={22} color={C.ink} />
          </BlurView>
        </Pressable>
      </View>
      {p.images && p.images.length > 1 && (
        <View style={{ position: "absolute", top: headerH - 64, left: 0, right: 0, zIndex: 10 }} className="flex-row justify-center gap-1.5">
          {p.images.map((_, i) => (
            <View key={i} className={`h-1.5 rounded-full ${i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </View>
      )}
    </>
  );

  return (
    <View className="flex-1 bg-paper">
      <ParallaxScrollView
        headerHeight={headerH}
        header={header}
        headerOverlay={overlay}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* Sheet pulled up over the hero */}
        <View className="bg-paper rounded-t-[28px] -mt-7 px-5 pt-6">
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: DURATION.slow, easing: EASE.out }}
          >
            {p.category ? (
              <Text className="text-micro font-mono uppercase tracking-[0.12em] text-accent-ink mb-1.5">{p.category}</Text>
            ) : null}
            <Text className="font-sans-extrabold text-hero text-ink">{p.name}</Text>
            {p.partNumber && <Text className="font-mono text-caption text-ink-3 mt-1.5">PN · {p.partNumber}</Text>}

            <View className="flex-row items-center justify-between mt-4">
              <AnimatedCounter
                value={parseFloat(p.price)}
                format={(n) => formatPrice(n)}
                className="font-mono text-display font-sans-extrabold text-ink"
              />
              <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${inStock ? "bg-success-wash" : "bg-paper-3"}`}>
                <View className={`w-2 h-2 rounded-full ${inStock ? "bg-success" : "bg-ink-3"}`} />
                <Text className={`text-caption font-sans-bold ${inStock ? "text-success" : "text-ink-3"}`}>
                  {inStock ? `${p.stockQuantity} in stock` : "Out of stock"}
                </Text>
              </View>
            </View>
          </MotiView>

          {p.description && (
            <Section title="About this part" delay={60}>
              <Text className="text-body text-ink-2 leading-[22px]">{p.description}</Text>
            </Section>
          )}

          {p.compatibleVehicles && p.compatibleVehicles.length > 0 && (
            <Section title="Compatible with" delay={120}>
              <View className="flex-row flex-wrap gap-2">
                {p.compatibleVehicles.map((v, i) => (
                  <Chip key={i} label={`${v.make} ${v.model}${v.year ? ` · ${v.year}` : ""}`} tone="accent" active />
                ))}
              </View>
            </Section>
          )}

          {p.specifications && Object.keys(p.specifications).length > 0 && (
            <Section title="Specifications" delay={180}>
              <Card className="gap-0">
                {Object.entries(p.specifications).map(([k, v], i, arr) => (
                  <View key={k} className={`flex-row justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
                    <Text className="text-sub text-ink-3 capitalize">{k.replace(/_/g, " ")}</Text>
                    <Text className="text-sub text-ink font-sans-semibold">{String(v)}</Text>
                  </View>
                ))}
              </Card>
            </Section>
          )}

          {p.warrantyInfo && (
            <Section title="Warranty" delay={220}>
              <View className="flex-row items-center gap-2">
                <Icon name="shield-checkmark" size={18} color={C.success} />
                <Text className="text-body text-ink-2 flex-1">{p.warrantyInfo}</Text>
              </View>
            </Section>
          )}

          {p.supplierBusinessName && (
            <Section title="Supplied by" delay={260}>
              <View className="flex-row items-center gap-2">
                <Icon name="storefront-outline" size={18} color={C.accent} />
                <Text className="text-body font-sans-bold text-ink">{p.supplierBusinessName}</Text>
              </View>
            </Section>
          )}
        </View>
      </ParallaxScrollView>

      {/* Sticky frosted buy bar */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} className="rounded-t-[24px] overflow-hidden" >
        <BlurView intensity={50} tint="light" style={{ paddingBottom: insets.bottom + 12 }} className="px-5 pt-3 flex-row gap-2.5 border-t border-line">
          <View className="flex-1">
            <Button
              label="Message"
              variant="primary"
              fullWidth
              size="lg"
              onPress={() => router.push((user ? `/messages/${p.supplierId}` : "/(auth)/login") as never)}
              leftIcon={<Icon name="chatbubble-outline" size={17} color={C.onAccent} />}
            />
          </View>
          {p.supplierPhone ? (
            <View className="flex-1">
              <Button
                label="WhatsApp"
                variant="default"
                fullWidth
                size="lg"
                onPress={() => openWhatsApp(p.supplierPhone!, waTemplates.productEnquiry(p.name))}
                leftIcon={<Icon name="logo-whatsapp" size={17} color={C.ink} />}
              />
            </View>
          ) : null}
        </BlurView>
      </View>
    </View>
  );
}
