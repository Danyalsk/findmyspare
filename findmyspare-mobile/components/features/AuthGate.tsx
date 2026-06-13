import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/theme";
import { EASE, DURATION } from "@/lib/motion";

/**
 * Full-screen "sign in to continue" prompt shown to guests on auth-gated tabs.
 * Lets guests keep browsing while nudging them to sign in only when they act.
 */
export function AuthGate({
  icon = "lock-closed-outline",
  title,
  subtitle,
}: {
  icon?: IconName;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  return (
    <PageShell>
      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: DURATION.slow, easing: EASE.out }}
        className="flex-1 items-center justify-center gap-3.5 px-6"
        style={{ minHeight: 480 }}
      >
        <View className="w-20 h-20 rounded-full bg-accent-wash items-center justify-center mb-1">
          <Icon name={icon} size={34} color={C.accent} />
        </View>
        <Text className="font-sans-extrabold text-hero text-ink text-center">{title}</Text>
        <Text className="text-body text-ink-2 text-center leading-[22px]">{subtitle}</Text>
        <View className="mt-3 w-full">
          <Button label="Sign in / Sign up" size="lg" fullWidth onPress={() => router.push("/(auth)/login" as never)} />
        </View>
      </MotiView>
    </PageShell>
  );
}
