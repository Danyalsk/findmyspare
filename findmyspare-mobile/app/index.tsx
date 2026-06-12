import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { me } from "@/lib/api/auth";
import { C } from "@/lib/theme";

export default function Index() {
  const router = useRouter();
  const { user, accessToken, isHydrated, setUser, logout } = useAuthStore();
  const routed = useRef(false);

  useEffect(() => {
    if (!isHydrated || routed.current) return;
    routed.current = true;

    (async () => {
      // Guests browse without an account (Amazon/Swiggy style) — land on the
      // public buyer storefront. Auth is gated per-action, not on launch.
      if (!accessToken || !user) {
        router.replace("/(buyer)" as never);
        return;
      }
      // Logged-in: refresh the user, then route to the right home.
      try {
        const { user: fresh } = await me();
        await setUser(fresh);
        router.replace(getPostLoginPath(fresh) as never);
      } catch {
        if (useAuthStore.getState().accessToken) {
          router.replace(getPostLoginPath(user) as never);
        } else {
          await logout();
          router.replace("/(buyer)" as never);
        }
      }
    })();
  }, [isHydrated, accessToken, user, router, setUser, logout]);

  return (
    <View className="flex-1 items-center justify-center bg-paper gap-4">
      <Text className="serif text-[32px] text-ink">FindMySpare</Text>
      <ActivityIndicator color={C.accent} />
    </View>
  );
}
