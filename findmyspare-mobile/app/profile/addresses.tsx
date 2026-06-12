import React, { useCallback, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView, RefreshControl } from "react-native";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { addressesApi } from "@/lib/api/addresses";
import type { Address } from "@/lib/types";
import { C } from "@/lib/theme";

export default function AddressesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await addressesApi.list();
      setItems(r.addresses);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function setDefault(a: Address) {
    try {
      await addressesApi.update(a.id, { isDefault: true });
      setItems((prev) => prev.map((x) => ({ ...x, isDefault: x.id === a.id })));
    } catch (e) { Alert.alert("Failed", (e as Error).message); }
  }

  function confirmDelete(a: Address) {
    Alert.alert("Delete address", "Remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await addressesApi.remove(a.id);
            setItems((prev) => prev.filter((x) => x.id !== a.id));
          } catch (e) { Alert.alert("Failed", (e as Error).message); }
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar
        title="Addresses"
        back
        right={
          <Pressable onPress={() => router.push("/profile/addresses/new" as never)} className="w-9 h-9 items-center justify-center">
            <Icon name="add" size={22} color={C.ink} />
          </Pressable>
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12 pt-3"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />}
      >
        {loading ? (
          <View className="gap-3">{[0, 1].map((i) => <Skeleton key={i} height={90} />)}</View>
        ) : items.length === 0 ? (
          <View className="items-center mt-20 gap-3">
            <Icon name="location-outline" size={46} color={C.ink3} />
            <Text className="text-ink-3 text-[14px]">No saved addresses</Text>
            <Button label="Add address" onPress={() => router.push("/profile/addresses/new" as never)} />
          </View>
        ) : (
          <View className="gap-2.5">
            {items.map((a) => (
              <Card key={a.id} className="gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] font-semibold text-ink">{a.label || "Address"}</Text>
                  {a.isDefault ? (
                    <View className="bg-accent-wash px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] mono uppercase text-accent-ink font-semibold">Default</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-[13px] text-ink-2">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}
                </Text>
                <Text className="text-[13px] text-ink-2">{a.city}, {a.state} {a.postalCode}</Text>
                {a.phone ? <Text className="text-[12px] text-ink-3 mt-0.5">{a.phone}</Text> : null}
                <View className="flex-row gap-2 mt-2 pt-2 border-t border-line">
                  {!a.isDefault && (
                    <Pressable onPress={() => setDefault(a)} className="flex-row items-center gap-1">
                      <Icon name="star-outline" size={14} color={C.accent} />
                      <Text className="text-[12px] text-accent-ink font-medium">Set default</Text>
                    </Pressable>
                  )}
                  <View className="flex-1" />
                  <Pressable onPress={() => confirmDelete(a)} className="flex-row items-center gap-1">
                    <Icon name="trash-outline" size={14} color={C.danger} />
                    <Text className="text-[12px] text-danger font-medium">Delete</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
