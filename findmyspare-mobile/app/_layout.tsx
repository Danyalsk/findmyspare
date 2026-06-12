import "../global.css";
import { useEffect, useRef } from "react";
import { LogBox } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/lib/store";
import { disconnectSocket } from "@/lib/socket";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { C } from "@/lib/theme";

// Silence the in-app dev warning toast (version hints / require cycles) so it
// doesn't sit over the floating tab bar. Real errors still surface.
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const accessToken = useAuthStore((s) => s.accessToken);
  const prevToken = useRef<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Tear down the socket when the session ends so it doesn't reconnect stale.
  useEffect(() => {
    if (prevToken.current && !accessToken) disconnectSocket();
    prevToken.current = accessToken;
  }, [accessToken]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.paper },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
            <Stack.Screen name="complete-profile" options={{ animation: "fade", gestureEnabled: false }} />
            <Stack.Screen name="(buyer)" options={{ animation: "fade" }} />
            <Stack.Screen name="(supplier)" options={{ animation: "fade" }} />
            <Stack.Screen name="(admin)" options={{ animation: "fade" }} />
            <Stack.Screen name="messages/[id]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="buyer/requests/[id]" />
            <Stack.Screen name="supplier/leads/[id]" />
            <Stack.Screen name="supplier/products/new" />
            <Stack.Screen name="supplier/products/[id]/edit" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/addresses" />
            <Stack.Screen name="profile/addresses/new" />
            <Stack.Screen name="profile/notifications" />
            <Stack.Screen name="profile/help" />
          </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
