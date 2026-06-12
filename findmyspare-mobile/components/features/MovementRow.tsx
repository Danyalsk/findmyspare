import React from "react";
import { View, Text } from "react-native";
import type { StockMovement } from "@/lib/types";
import { C } from "@/lib/theme";

const REASON_LABEL: Record<string, string> = {
  initial: "Opening stock",
  received: "Received",
  damaged: "Damaged / lost",
  correction: "Correction",
  returned: "Customer return",
  order: "Order placed",
  order_cancelled: "Order cancelled",
};

export function MovementRow({ m }: { m: StockMovement }) {
  const positive = m.delta > 0;
  return (
    <View className="flex-row items-start gap-3 py-2.5">
      <Text
        style={{ color: positive ? C.success : C.danger }}
        className="mono text-[13px] font-semibold w-12"
      >
        {positive ? `+${m.delta}` : m.delta}
      </Text>
      <View className="flex-1">
        <Text className="text-[13px] font-medium text-ink">{REASON_LABEL[m.reason] ?? m.reason}</Text>
        <Text className="text-[11px] text-ink-3 mt-0.5">
          {m.previousQuantity} → {m.newQuantity}{m.note ? ` · ${m.note}` : ""}
        </Text>
        <Text className="text-[10px] text-ink-3 mt-0.5">{new Date(m.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );
}
