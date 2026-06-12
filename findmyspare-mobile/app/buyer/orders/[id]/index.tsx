import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusTimeline } from "@/components/features/OrderStatusTimeline";
import { ordersApi } from "@/lib/api/orders";
import type { OrderDetail } from "@/lib/types";
import { statusMeta, buildTimeline } from "@/lib/order-status";
import { formatPrice } from "@/lib/constants";
import { C } from "@/lib/theme";

export default function BuyerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try { setData(await ordersApi.get(id)); } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function complete() {
    Alert.alert("Confirm delivery", "This releases payment to the supplier.", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: async () => {
        setBusy(true);
        try { await ordersApi.updateStatus(id!, { status: "completed" }); load(); }
        catch (e) { Alert.alert("Failed", (e as Error).message); }
        finally { setBusy(false); }
      } },
    ]);
  }

  if (loading) {
    return <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center"><ActivityIndicator color={C.accent} /></SafeAreaView>;
  }
  if (!data) {
    return <SafeAreaView edges={["top"]} className="flex-1 bg-paper"><TopBar title="Order" back /><View className="flex-1 items-center justify-center"><Text className="text-ink-3">Order not found</Text></View></SafeAreaView>;
  }

  const { order, items, escrow, supplier, shippingAddress, dispute } = data;
  const meta = statusMeta(order.status);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title={`Order #${order.id.slice(0, 8)}`} back />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3">
        <Card className="flex-row items-center justify-between">
          <View>
            <Text className="text-[11px] text-ink-3">Status</Text>
            <View style={{ backgroundColor: meta.bg }} className="px-2.5 py-1 rounded-full self-start mt-1">
              <Text style={{ color: meta.color }} className="text-[12px] font-semibold">{meta.label}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-[11px] text-ink-3">Total</Text>
            <Text className="serif text-[20px] text-ink">{formatPrice(parseFloat(order.totalAmount))}</Text>
          </View>
        </Card>

        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Items</Text>
        <Card className="gap-3">
          {items.map((it) => (
            <View key={it.id} className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-[10px] overflow-hidden bg-paper-3">
                {it.productImage?.[0] && <Image source={{ uri: it.productImage[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" />}
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-medium text-ink" numberOfLines={1}>{it.productName || "Item"}</Text>
                <Text className="text-[11px] text-ink-3">Qty {it.quantity} · {formatPrice(parseFloat(it.unitPrice))}</Text>
              </View>
              <Text className="mono text-[13px] font-semibold text-ink">{formatPrice(parseFloat(it.subtotal))}</Text>
            </View>
          ))}
        </Card>

        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Supplier</Text>
        <Card><Text className="text-[14px] text-ink">{supplier?.businessName || supplier?.name || "—"}</Text></Card>

        {order.trackingNumber ? (
          <>
            <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Tracking</Text>
            <Card>
              <Text className="text-[14px] text-ink">{order.courierService || "Courier"} · {order.trackingNumber}</Text>
            </Card>
          </>
        ) : null}

        {shippingAddress ? (
          <>
            <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Delivering to</Text>
            <Card>
              <Text className="text-[13px] text-ink-2 leading-[19px]">
                {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}{"\n"}
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </Text>
            </Card>
          </>
        ) : null}

        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Progress</Text>
        <Card><OrderStatusTimeline steps={buildTimeline(order.status)} /></Card>

        {escrow ? (
          <Card className="mt-4 flex-row items-center justify-between">
            <Text className="text-[12px] text-ink-2">Escrow {escrow.status.replace(/_/g, " ")}</Text>
            <Text className="mono text-[14px] font-semibold text-ink">{formatPrice(parseFloat(escrow.amount))}</Text>
          </Card>
        ) : null}

        <View className="gap-2.5 mt-5">
          {order.status === "delivered" && (
            <>
              <Button label="Mark completed" loading={busy} onPress={complete} fullWidth size="lg" />
              <Button label="Raise dispute" variant="default" onPress={() => router.push(`/buyer/orders/${order.id}/dispute` as never)} fullWidth />
            </>
          )}
          {dispute && (
            <Button label="View dispute" variant="default" onPress={() => router.push(`/disputes/${dispute.id}` as never)} fullWidth />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
