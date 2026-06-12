import React from "react";
import { View, Text } from "react-native";
import { C } from "@/lib/theme";

export function StockBadge({
  status,
  stockQuantity,
  lowStockThreshold,
}: {
  status: string;
  stockQuantity: number;
  lowStockThreshold: number;
}) {
  let bg: string = C.paper3;
  let fg: string = C.ink3;
  let label: string;

  if (status === "draft") {
    label = "Draft";
  } else if (status === "paused") {
    label = "Paused";
  } else if (stockQuantity <= 0) {
    bg = "#FCE8E9"; fg = C.danger; label = "Out of stock";
  } else if (stockQuantity <= lowStockThreshold) {
    bg = "#FFF1DB"; fg = C.accentInk; label = `Low · ${stockQuantity}`;
  } else {
    bg = "#DCF3E6"; fg = C.success; label = `${stockQuantity} in stock`;
  }

  return (
    <View style={{ backgroundColor: bg }} className="px-2 py-1 rounded-full self-start">
      <Text style={{ color: fg }} className="text-[10.5px] font-semibold">{label}</Text>
    </View>
  );
}
