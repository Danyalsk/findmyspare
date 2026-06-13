import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { Icon } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { C } from "@/lib/theme";
import { EASE, DURATION } from "@/lib/motion";

export default function PendingScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <PageShell>
      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: DURATION.slow, easing: EASE.out }}
        className="items-center mt-24 gap-4 px-6"
      >
        <View className="w-20 h-20 rounded-full bg-amber-wash items-center justify-center">
          <Icon name="hourglass-outline" size={36} color={C.gold} />
        </View>
        <Text className="font-sans-extrabold text-hero text-ink text-center">Under review</Text>
        <Text className="text-ink-2 text-body text-center leading-[22px]">
          Our team is verifying your GST and PAN details. You&apos;ll be notified once approved (usually within 24 hours).
        </Text>
        <View className="mt-2">
          <Button
            label="Sign out"
            variant="default"
            onPress={async () => {
              await logout();
              router.replace("/(auth)/login");
            }}
          />
        </View>
      </MotiView>
    </PageShell>
  );
}
