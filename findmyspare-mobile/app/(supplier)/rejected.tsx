import React from "react";
import { View, Text } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { C } from "@/lib/theme";

export default function RejectedScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <PageShell>
      <View className="items-center mt-24 gap-4 px-6">
        <Icon name="close-circle-outline" size={56} color={C.danger} />
        <Text className="serif text-[26px] text-ink text-center">Application rejected</Text>
        {user?.rejectionReason && (
          <View className="bg-danger-wash border border-line rounded-card px-4 py-3 w-full">
            <Text className="text-[12px] text-ink-2 mono uppercase mb-1">Reason</Text>
            <Text className="text-[14px] text-ink">{user.rejectionReason}</Text>
          </View>
        )}
        <Button label="Resubmit" onPress={() => router.replace("/(supplier)/onboarding")} />
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
