import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Touchable } from "@/components/ui/Touchable";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { signOut, becomeSupplier } from "@/lib/api/auth";
import { notificationsApi } from "@/lib/api/notifications";
import { C, shadowCard } from "@/lib/theme";
import { EASE, DURATION, stagger } from "@/lib/motion";

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
      <Text className="text-overline font-mono uppercase tracking-[0.14em] text-ink-3 pt-2">Account</Text>
      <Text className="font-sans-extrabold text-hero text-ink mb-5">Profile</Text>

      {/* Identity block */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: DURATION.slow, easing: EASE.out }}
        style={shadowCard}
        className="bg-paper-2 rounded-xl2 p-5 flex-row items-center gap-4"
      >
        <View>
          <Avatar name={user.name} image={user.image} size={64} />
          <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-paper-2" />
        </View>
        <View className="flex-1">
          <Text className="text-title font-sans-extrabold text-ink" numberOfLines={1}>{user.name}</Text>
          <Text className="text-caption text-ink-3 mt-0.5" numberOfLines={1}>{user.email}</Text>
          <View className={`self-start mt-2 px-2.5 py-1 rounded-full ${badgeCls[badge.variant]}`}>
            <Text className={`text-micro font-sans-bold ${badgeText[badge.variant]}`}>{badge.label}</Text>
          </View>
        </View>
      </MotiView>

      {isApprovedSupplier && (
        <Card className="mt-3 gap-2">
          <Text className="text-micro font-mono uppercase text-ink-3 tracking-[0.08em]">Business</Text>
          <Text className="text-body font-sans-bold text-ink">{user.businessName}</Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            {user.gstNumber && <Chip label={`GST ${user.gstNumber}`} />}
            {user.phone && <Chip label={user.phone} />}
          </View>
        </Card>
      )}

      <View className="mt-5 gap-2.5">
        {[
          { icon: "person-outline" as IconName, label: "Edit profile", onPress: () => router.push("/profile/edit" as never), show: true },
          { icon: "cube-outline" as IconName, label: "My orders", onPress: () => router.push("/buyer/orders" as never), show: isBuyer },
          { icon: "cube-outline" as IconName, label: "Orders", onPress: () => router.push("/supplier/orders" as never), show: isApprovedSupplier },
          { icon: "location-outline" as IconName, label: "Addresses", onPress: () => router.push("/profile/addresses" as never), show: isBuyer },
          { icon: "notifications-outline" as IconName, label: "Notifications", onPress: () => router.push("/profile/notifications" as never), show: true, badge: unread },
          { icon: "help-circle-outline" as IconName, label: "Help & support", onPress: () => router.push("/profile/help" as never), show: true },
        ].filter((r) => r.show).map((r, i) => (
          <Row key={r.label} icon={r.icon} label={r.label} badge={r.badge} onPress={r.onPress} index={i} />
        ))}
      </View>

      {isBuyer && (
        <Touchable
          onPress={upgrade}
          disabled={upgrading}
          haptic="medium"
          style={shadowCard}
          className="mt-5 bg-ink rounded-xl2 p-5 flex-row items-center gap-4"
        >
          <View className="w-11 h-11 rounded-full bg-white/10 items-center justify-center">
            <Icon name="storefront-outline" size={22} color={C.onInk} />
          </View>
          <View className="flex-1">
            <Text className="text-onInk text-body font-sans-bold mb-0.5" style={{ color: C.onInk }}>
              {upgrading ? "Switching…" : "Sell on FindMySpare"}
            </Text>
            <Text className="text-caption" style={{ color: "rgba(255,255,255,0.7)" }}>
              Reach verified buyers across India.
            </Text>
          </View>
          <Icon name="arrow-forward" size={18} color={C.onInk} />
        </Touchable>
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
  index = 0,
}: {
  icon: IconName;
  label: string;
  badge?: number;
  onPress?: () => void;
  index?: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: DURATION.base, delay: 80 + stagger(index, 35), easing: EASE.out }}
    >
      <Touchable
        onPress={onPress}
        scaleTo={0.98}
        style={shadowCard}
        className="flex-row items-center gap-3 bg-paper-2 rounded-card px-4 py-3.5"
      >
        <View className="w-9 h-9 rounded-full bg-accent-wash items-center justify-center">
          <Icon name={icon} size={18} color={C.accent} />
        </View>
        <Text className="flex-1 text-body font-sans-medium text-ink">{label}</Text>
        {badge ? (
          <View className="bg-accent rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
            <Text className="text-white text-micro font-sans-bold">{badge > 99 ? "99+" : badge}</Text>
          </View>
        ) : null}
        <Icon name="chevron-forward" size={16} color={C.ink3} />
      </Touchable>
    </MotiView>
  );
}
