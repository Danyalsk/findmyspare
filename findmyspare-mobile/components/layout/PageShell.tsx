import React from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Aurora } from "./Aurora";
import { C } from "@/lib/theme";
import { haptics } from "@/lib/haptics";

export interface PageShellProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  className?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  aurora?: boolean;
}

export function PageShell({
  children,
  scroll = true,
  padded = true,
  className = "",
  refreshing,
  onRefresh,
  aurora = true,
}: PageShellProps) {
  const padCls = padded ? "px-5" : "";
  const handleRefresh = onRefresh
    ? () => { haptics.select(); onRefresh(); }
    : undefined;

  const body = !scroll ? (
    <View className={`flex-1 ${padCls} ${className}`}>{children}</View>
  ) : (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`pb-32 ${padCls} ${className}`}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        handleRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={handleRefresh} tintColor={C.accent} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-paper">
      {aurora && <Aurora />}
      <SafeAreaView edges={["top"]} className="flex-1">
        {body}
      </SafeAreaView>
    </View>
  );
}
