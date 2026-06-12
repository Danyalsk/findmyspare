import React from "react";
import { View, Text } from "react-native";
import { Icon } from "@/components/ui/Icon";
import type { TimelineStep } from "@/lib/order-status";
import { C } from "@/lib/theme";

export function OrderStatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <View key={step.label} className="flex-row gap-3">
            <View className="items-center">
              {step.state === "done" ? (
                <View className="w-6 h-6 rounded-full bg-ink items-center justify-center">
                  <Icon name="checkmark-circle" size={14} color={C.onInk} weight="fill" />
                </View>
              ) : step.state === "active" ? (
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: C.accent }}>
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-full border-[1.5px]" style={{ borderColor: C.line2 }} />
              )}
              {!last && <View className="w-px flex-1 min-h-[26px]" style={{ backgroundColor: step.state === "done" ? C.ink : C.line2 }} />}
            </View>
            <View className={last ? "pb-0" : "pb-5"}>
              <Text className={`text-[13px] ${step.state === "pending" ? "text-ink-3" : "text-ink font-medium"}`}>
                {step.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
