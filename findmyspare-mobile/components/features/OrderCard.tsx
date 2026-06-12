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
    <Card onPress={onPress} className="!p-3.5">
      <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-input bg-paper-3 items-center justify-center">
            <Icon name="cube" size={20} color={C.ink3} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-micro font-sans-bold text-accent-ink uppercase tracking-wider">#{order.id.slice(0, 8)}</Text>
              <View style={{ backgroundColor: meta.bg }} className="px-2 py-0.5 rounded-full">
                <Text style={{ color: meta.color }} className="text-micro font-sans-semibold">{meta.label}</Text>
              </View>
            </View>
            <Text className="text-body font-sans-semibold text-ink mt-0.5" numberOfLines={1}>
              {order.primaryItemName || "Order"}
            </Text>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-micro text-ink-3" numberOfLines={1}>{counterparty}</Text>
              <Text className="font-mono text-caption font-sans-semibold text-ink">{formatPrice(parseFloat(order.totalAmount))}</Text>
            </View>
          </View>
        </View>
    </Card>
  );
}
