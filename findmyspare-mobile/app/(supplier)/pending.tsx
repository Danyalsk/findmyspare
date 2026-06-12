import React from "react";
import { View, Text } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { C } from "@/lib/theme";

export default function PendingScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <PageShell>
      <View className="items-center mt-24 gap-4 px-6">
        <Icon name="hourglass-outline" size={56} color={C.gold} />
        <Text className="serif text-[26px] text-ink text-center">Under review</Text>
        <Text className="text-ink-2 text-[14px] text-center leading-[1.5]">
          Our team is verifying your GST and PAN details. You&apos;ll be notified once approved (usually within 24 hours).
        </Text>
        <Button
          label="Sign out"
          variant="default"
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        />
      </View>
    </PageShell>
  );
}
