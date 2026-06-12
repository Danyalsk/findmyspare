import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { signOut, becomeSupplier } from "@/lib/api/auth";
import { notificationsApi } from "@/lib/api/notifications";
import { C } from "@/lib/theme";

type Variant = "ok" | "warn" | "danger" | "accent";

function roleBadge(user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>): {
  label: string;
  variant: Variant;
} {
  if (user.role === "admin" || user.role === "super_admin") return { label: "Administrator", variant: "accent" };
  if (user.role === "buyer") return { label: "Buyer", variant: "ok" };
  switch (user.verificationStatus) {
    case "approved": return { label: "Verified supplier", variant: "ok" };
    case "pending": return { label: "Verification pending", variant: "warn" };
    case "rejected": return { label: "Verification rejected", variant: "danger" };
    default: return { label: "Complete onboarding", variant: "warn" };
  }
}

const badgeCls: Record<Variant, string> = {
  ok: "bg-accent-wash",
  warn: "bg-amber-wash",
  danger: "bg-danger-wash",
  accent: "bg-accent-wash",
};
const badgeText: Record<Variant, string> = {
  ok: "text-accent-ink",
  warn: "text-amber",
  danger: "text-danger",
  accent: "text-accent-ink",
};

export function ProfileView() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const setUser = useAuthStore((s) => s.setUser);
  const [unread, setUnread] = useState(0);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    notificationsApi.list({ limit: 1 }).then((r) => setUnread(r.unreadCount)).catch(() => {});
  }, []);

  if (!user) return null;
  const badge = roleBadge(user);
  const isBuyer = user.role === "buyer";
  const isApprovedSupplier = user.role === "supplier" && user.verificationStatus === "approved";

  async function doLogout() {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  async function upgrade() {
    setUpgrading(true);
    try {
      const { user: updated } = await becomeSupplier();
      await setUser(updated);
      router.replace(getPostLoginPath(updated) as never);
    } catch (e) {
      Alert.alert("Couldn't switch", (e as Error).message);
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <PageShell>
      <View className="pt-3 pb-3">
        <Text className="font-sans-extrabold text-title text-ink">Profile</Text>
      </View>

      <Card className="items-center gap-3 py-8">
        <View>
          <Avatar name={user.name} image={user.image} size={72} />
          <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-accent-ink border-2 border-paper" />
        </View>
        <View className="items-center gap-1.5">
          <Text className="text-headline font-sans-semibold text-ink">{user.name}</Text>
          <Text className="text-caption text-ink-3">{user.email}</Text>
          <View className={`px-2.5 py-1 rounded-full ${badgeCls[badge.variant]}`}>
            <Text className={`text-micro font-sans-semibold ${badgeText[badge.variant]}`}>{badge.label}</Text>
          </View>
        </View>
      </Card>

      {isApprovedSupplier && (
        <Card className="mt-3 gap-2">
          <Text className="text-micro font-mono uppercase text-ink-3 tracking-[0.08em]">Business</Text>
          <Text className="text-body font-sans-semibold text-ink">{user.businessName}</Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            {user.gstNumber && <Chip label={`GST ${user.gstNumber}`} />}
            {user.phone && <Chip label={user.phone} />}
          </View>
        </Card>
      )}

      <View className="mt-4 gap-2">
        <Row icon="person-outline" label="Edit profile" onPress={() => router.push("/profile/edit" as never)} />
        {isBuyer && (
          <Row icon="cube-outline" label="My orders" onPress={() => router.push("/buyer/orders" as never)} />
        )}
        {isApprovedSupplier && (
          <Row icon="cube-outline" label="Orders" onPress={() => router.push("/supplier/orders" as never)} />
        )}
        {isBuyer && (
          <Row icon="location-outline" label="Addresses" onPress={() => router.push("/profile/addresses" as never)} />
        )}
        <Row
          icon="notifications-outline"
          label="Notifications"
          badge={unread}
          onPress={() => router.push("/profile/notifications" as never)}
        />
        <Row icon="help-circle-outline" label="Help & support" onPress={() => router.push("/profile/help" as never)} />
      </View>

      {isBuyer && (
        <Pressable
          onPress={upgrade}
          disabled={upgrading}
          className="mt-5 bg-ink rounded-card p-5"
        >
          <Text className="text-paper text-body font-sans-semibold mb-1">
            {upgrading ? "Switching…" : "Sell on FindMySpare"}
          </Text>
          <Text className="text-paper/70 text-caption">
            Reach verified buyers across India. Switch your account to a supplier.
          </Text>
        </Pressable>
      )}

      <View className="mt-6">
        <Button label="Sign out" variant="danger" onPress={doLogout} fullWidth />
      </View>
    </PageShell>
  );
}

function Row({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: IconName;
  label: string;
  badge?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-paper border border-line rounded-card px-4 py-3.5"
    >
      <Icon name={icon} size={18} color={C.ink2} />
      <Text className="flex-1 text-body text-ink">{label}</Text>
      {badge ? (
        <View className="bg-accent-ink rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
          <Text className="text-paper text-micro font-sans-bold">{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
      <Icon name="chevron-forward" size={16} color={C.ink3} />
    </Pressable>
  );
}
