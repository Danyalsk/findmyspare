import React from "react";
import { View, Text } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import type { OrderListItem } from "@/lib/types";
import { statusMeta } from "@/lib/order-status";
import { formatPrice } from "@/lib/constants";
import { C } from "@/lib/theme";

export function OrderCard({
  order,
  counterparty,
  onPress,
}: {
  order: OrderListItem;
  counterparty: string;
  onPress: () => void;
}) {
  const meta = statusMeta(order.status);
  return (
    <Card onPress={onPress} className="!p-4 !rounded-xl2">
      <View className="flex-row items-center gap-3.5">
          <View className="w-12 h-12 rounded-full bg-accent-wash items-center justify-center">
            <Icon name="cube" size={20} color={C.accent} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-micro font-mono font-sans-bold text-ink-3 uppercase tracking-wider">#{order.id.slice(0, 8)}</Text>
              <View style={{ backgroundColor: meta.bg }} className="px-2.5 py-1 rounded-full">
                <Text style={{ color: meta.color }} className="text-micro font-sans-bold">{meta.label}</Text>
              </View>
            </View>
            <Text className="text-body font-sans-bold text-ink mt-1" numberOfLines={1}>
              {order.primaryItemName || "Order"}
            </Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-caption text-ink-3" numberOfLines={1}>{counterparty}</Text>
              <Text className="font-mono text-body font-sans-extrabold text-ink">{formatPrice(parseFloat(order.totalAmount))}</Text>
            </View>
          </View>
        </View>
    </Card>
  );
}
