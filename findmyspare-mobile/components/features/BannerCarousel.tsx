import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import type { Banner } from "@/lib/types";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const { width } = useWindowDimensions();
  const cardW = width - 40; // px-5 on both sides
  const [idx, setIdx] = useState(0);
  const ref = useRef<ScrollView>(null);

  // Auto-advance every 4s.
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      const next = (idx + 1) % banners.length;
      ref.current?.scrollTo({ x: next * cardW, animated: true });
      setIdx(next);
    }, 4000);
    return () => clearInterval(t);
  }, [idx, banners.length, cardW]);

  if (banners.length === 0) return null;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIdx(Math.round(e.nativeEvent.contentOffset.x / cardW));
  }

  return (
    <View className="mt-3 mb-5">
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        snapToInterval={cardW}
        decelerationRate="fast"
      >
        {banners.map((b) => (
          <View key={b.id} style={{ width: cardW, aspectRatio: 16 / 9 }} className="rounded-card overflow-hidden border border-line bg-paper-3">
            {b.imageUrl ? (
              <Image source={{ uri: b.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            ) : (
              <View className="flex-1 bg-ink" />
            )}
            {/* Scrim for legibility (plain overlay — no gradient dependency). */}
            <View className="absolute left-0 right-0 bottom-0 h-1/2 bg-black/35" />
            <View className="absolute inset-0 justify-end p-4">
              <Text className="serif text-[22px] text-white">{b.title}</Text>
              {b.subtitle ? <Text className="text-white/85 text-[12px] mt-0.5">{b.subtitle}</Text> : null}
            </View>
          </View>
        ))}
      </ScrollView>
      {banners.length > 1 && (
        <View className="flex-row justify-center gap-1.5 mt-2.5">
          {banners.map((_, i) => (
            <View key={i} className={`h-1.5 rounded-full ${i === idx ? "w-4 bg-ink" : "w-1.5 bg-line-2"}`} />
          ))}
        </View>
      )}
    </View>
  );
}
