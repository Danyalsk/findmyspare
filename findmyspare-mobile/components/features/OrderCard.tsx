import React from "react";
import { View, Text, Pressable } from "react-native";
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
    <Pressable onPress={onPress}>
      <Card className="!p-3.5">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-[12px] bg-paper-3 items-center justify-center">
            <Icon name="cube" size={20} color={C.ink3} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] font-bold text-accent-ink uppercase tracking-wider">#{order.id.slice(0, 8)}</Text>
              <View style={{ backgroundColor: meta.bg }} className="px-2 py-0.5 rounded-full">
                <Text style={{ color: meta.color }} className="text-[10px] font-semibold">{meta.label}</Text>
              </View>
            </View>
            <Text className="text-[14px] font-semibold text-ink mt-0.5" numberOfLines={1}>
              {order.primaryItemName || "Order"}
            </Text>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-[11px] text-ink-3" numberOfLines={1}>{counterparty}</Text>
              <Text className="mono text-[12px] font-semibold text-ink">{formatPrice(parseFloat(order.totalAmount))}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
