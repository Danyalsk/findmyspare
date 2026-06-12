import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Touchable } from "@/components/ui/Touchable";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { inventoryApi } from "@/lib/api/inventory";
import type { InventoryItem, StockAdjustReason } from "@/lib/types";
import { C } from "@/lib/theme";
import { haptics } from "@/lib/haptics";

const ADD_REASONS: { value: StockAdjustReason; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "returned", label: "Return" },
  { value: "correction", label: "Correction" },
];
const REMOVE_REASONS: { value: StockAdjustReason; label: string }[] = [
  { value: "damaged", label: "Damaged" },
  { value: "correction", label: "Correction" },
];

export function StockAdjustSheet({
  item,
  visible,
  onClose,
  onAdjusted,
}: {
  item: InventoryItem;
  visible: boolean;
  onClose: () => void;
  onAdjusted: () => void;
}) {
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState<StockAdjustReason>("received");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const qty = parseInt(amount || "0", 10);
  const delta = direction === "add" ? qty : -qty;
  const resulting = item.stockQuantity + delta;
  const reasons = direction === "add" ? ADD_REASONS : REMOVE_REASONS;

  function switchDir(d: "add" | "remove") {
    setDirection(d);
    setReason(d === "add" ? "received" : "damaged");
  }

  async function submit() {
    if (qty < 1) return Alert.alert("Enter a quantity");
    if (resulting < 0) return Alert.alert("Not enough stock", `Only ${item.stockQuantity} in stock.`);
    setBusy(true);
    try {
      await inventoryApi.adjust(item.id, { delta, reason, note: note.trim() || undefined });
      haptics.success();
      onAdjusted();
      onClose();
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
          <Text className="font-sans-extrabold text-title text-ink">Adjust stock</Text>
          <Text className="text-caption text-ink-3 mb-4" numberOfLines={1}>{item.name}</Text>

          {/* Direction */}
          <View className="flex-row gap-2 mb-4">
            {(["add", "remove"] as const).map((d) => (
              <Touchable
                key={d}
                onPress={() => switchDir(d)}
                haptic="select"
                scaleTo={0.96}
                className={`flex-1 h-11 rounded-input items-center justify-center border ${
                  direction === d ? "border-ink bg-ink" : "border-line bg-paper-2"
                }`}
              >
                <Text className={`text-sub font-sans-semibold ${direction === d ? "text-onInk" : "text-ink-2"}`}>
                  {d === "add" ? "Add" : "Remove"}
                </Text>
              </Touchable>
            ))}
          </View>

          {/* Amount stepper */}
          <View className="flex-row items-center gap-3 mb-4">
            <Touchable onPress={() => setAmount(String(Math.max(1, qty - 1)))} scaleTo={0.9} className="w-12 h-12 rounded-input bg-paper-2 border border-line items-center justify-center">
              <Icon name="close" size={18} color={C.ink} weight="bold" />
            </Touchable>
            <View className="flex-1">
              <Input value={amount} onChangeText={setAmount} keyboardType="numeric" />
            </View>
            <Touchable onPress={() => setAmount(String(qty + 1))} scaleTo={0.9} className="w-12 h-12 rounded-input bg-paper-2 border border-line items-center justify-center">
              <Icon name="add" size={18} color={C.ink} weight="bold" />
            </Touchable>
          </View>

          {/* Reason chips */}
          <Text className="text-caption font-sans-medium text-ink-2 mb-2">Reason</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {reasons.map((r) => (
              <Chip key={r.value} label={r.label} active={reason === r.value} onPress={() => setReason(r.value)} />
            ))}
          </View>

          <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. PO #4821" />

          <View className="flex-row items-center justify-between mt-4 mb-4 px-1">
            <Text className="text-caption text-ink-3">New stock level</Text>
            <Text className="font-mono text-body font-sans-semibold text-ink">{item.stockQuantity} → {resulting}</Text>
          </View>

          <Button label={busy ? "Saving…" : "Confirm"} loading={busy} onPress={submit} fullWidth size="lg" />
    </BottomSheet>
  );
}
