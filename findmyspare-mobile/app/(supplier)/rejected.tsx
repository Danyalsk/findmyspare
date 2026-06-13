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

export default function RejectedScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <PageShell>
      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: DURATION.slow, easing: EASE.out }}
        className="items-center mt-24 gap-4 px-6"
      >
        <View className="w-20 h-20 rounded-full bg-danger-wash items-center justify-center">
          <Icon name="close-circle-outline" size={36} color={C.danger} />
        </View>
        <Text className="font-sans-extrabold text-hero text-ink text-center">Application rejected</Text>
        {user?.rejectionReason && (
          <View className="bg-danger-wash rounded-xl2 px-4 py-3.5 w-full">
            <Text className="text-micro text-danger font-mono uppercase tracking-[0.06em] mb-1">Reason</Text>
            <Text className="text-body text-ink">{user.rejectionReason}</Text>
          </View>
        )}
        <View className="gap-2.5 w-full mt-2">
          <Button label="Resubmit application" onPress={() => router.replace("/(supplier)/onboarding")} fullWidth size="lg" />
          <Button
            label="Sign out"
            variant="ghost"
            fullWidth
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
