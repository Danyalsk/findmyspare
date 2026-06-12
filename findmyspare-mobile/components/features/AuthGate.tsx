import React from "react";
import { View, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/theme";

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
      <View className="flex-1 items-center justify-center gap-3 px-6" style={{ minHeight: 480 }}>
        <View className="w-16 h-16 rounded-full bg-accent-wash items-center justify-center mb-1">
          <Icon name={icon} size={28} color={C.accent} />
        </View>
        <Text className="serif text-[22px] text-ink text-center">{title}</Text>
        <Text className="text-[13px] text-ink-3 text-center leading-[19px]">{subtitle}</Text>
        <View className="mt-3 w-full">
          <Button label="Sign in / Sign up" size="lg" fullWidth onPress={() => router.push("/(auth)/login" as never)} />
        </View>
      </View>
    </PageShell>
  );
}
