import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderCard } from "@/components/features/OrderCard";
import { ordersApi } from "@/lib/api/orders";
import type { OrderListItem, OrderStatus } from "@/lib/types";
import { C } from "@/lib/theme";

const GROUPS: Record<string, OrderStatus[]> = {
  Active: ["placed", "confirmed", "shipped", "in_transit", "delivered"],
  Completed: ["completed"],
  Cancelled: ["cancelled", "disputed"],
};
const FILTERS = ["All", "Active", "Completed", "Cancelled"] as const;
type FilterLabel = (typeof FILTERS)[number];

export default function BuyerOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterLabel>("All");

  const load = useCallback(async () => {
    try {
      const r = await ordersApi.list({ limit: 50 });
      setOrders(r.orders);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visible = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((o) => GROUPS[filter].includes(o.status));
  }, [orders, filter]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="My orders" back />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3">
        <View className="flex-row flex-wrap gap-2 pb-3">
          {FILTERS.map((f) => (
            <Chip key={f} label={f} active={f === filter} onPress={() => setFilter(f)} />
          ))}
        </View>
        {loading ? (
          <View className="gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} height={84} />)}</View>
        ) : visible.length === 0 ? (
          <View className="items-center mt-24 gap-3">
            <Icon name="cube-outline" size={46} color={C.ink3} />
            <Text className="text-ink-3 text-[14px]">No orders here</Text>
          </View>
        ) : (
          <View className="gap-2.5">
            {visible.map((o) => (
              <OrderCard key={o.id} order={o} counterparty={o.supplierName || "Supplier"} onPress={() => router.push(`/buyer/orders/${o.id}` as never)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
