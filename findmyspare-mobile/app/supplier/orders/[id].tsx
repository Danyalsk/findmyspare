import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OrderStatusTimeline } from "@/components/features/OrderStatusTimeline";
import { ordersApi } from "@/lib/api/orders";
import type { OrderDetail, OrderStatus } from "@/lib/types";
import { statusMeta, buildTimeline } from "@/lib/order-status";
import { formatPrice } from "@/lib/constants";
import { C } from "@/lib/theme";

export default function SupplierOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try { setData(await ordersApi.get(id)); } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function transition(status: OrderStatus, extra?: Record<string, string>) {
    setBusy(true);
    try {
      await ordersApi.updateStatus(id!, { status, ...extra });
      setShipping(false);
      load();
    } catch (e) { Alert.alert("Failed", (e as Error).message); }
    finally { setBusy(false); }
  }

  function cancel() {
    Alert.alert("Cancel order", "Stock is restored and the buyer is refunded.", [
      { text: "Keep", style: "cancel" },
      { text: "Cancel order", style: "destructive", onPress: () => transition("cancelled") },
    ]);
  }

  if (loading) {
    return <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center"><ActivityIndicator color={C.accent} /></SafeAreaView>;
  }
  if (!data) {
    return <SafeAreaView edges={["top"]} className="flex-1 bg-paper"><TopBar title="Order" back /><View className="flex-1 items-center justify-center"><Text className="text-ink-3">Order not found</Text></View></SafeAreaView>;
  }

  const { order, items, buyer, shippingAddress, dispute } = data;
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
            <View key={it.id} className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[13px] font-medium text-ink" numberOfLines={1}>{it.productName || "Item"}</Text>
                <Text className="text-[11px] text-ink-3">Qty {it.quantity} · {formatPrice(parseFloat(it.unitPrice))}</Text>
              </View>
              <Text className="mono text-[13px] font-semibold text-ink">{formatPrice(parseFloat(it.subtotal))}</Text>
            </View>
          ))}
        </Card>

        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Buyer</Text>
        <Card>
          <Text className="text-[14px] text-ink">{buyer?.name || "—"}</Text>
          {shippingAddress ? (
            <Text className="text-[12px] text-ink-2 mt-1.5 leading-[18px]">
              {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}{"\n"}
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              {shippingAddress.phone ? ` · ${shippingAddress.phone}` : ""}
            </Text>
          ) : null}
        </Card>

        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Progress</Text>
        <Card><OrderStatusTimeline steps={buildTimeline(order.status)} /></Card>

        {dispute ? (
          <Button label="View & respond to dispute" variant="default" className="mt-4" onPress={() => router.push(`/disputes/${dispute.id}` as never)} fullWidth />
        ) : null}

        {/* Shipping form */}
        {shipping ? (
          <Card className="gap-3 mt-5">
            <Input label="Courier" value={courier} onChangeText={setCourier} placeholder="Delhivery, BlueDart…" />
            <Input label="Tracking number" value={tracking} onChangeText={setTracking} />
            <View className="flex-row gap-2">
              <View className="flex-1"><Button label="Cancel" variant="default" onPress={() => setShipping(false)} fullWidth /></View>
              <View className="flex-1"><Button label="Confirm" loading={busy} onPress={() => transition("shipped", { courierService: courier, trackingNumber: tracking })} fullWidth /></View>
            </View>
          </Card>
        ) : (
          <View className="gap-2.5 mt-5">
            {order.status === "placed" && (
              <>
                <Button label="Confirm order" loading={busy} onPress={() => transition("confirmed")} fullWidth size="lg" />
                <Button label="Cancel order" variant="default" onPress={cancel} fullWidth />
              </>
            )}
            {order.status === "confirmed" && <Button label="Mark shipped" onPress={() => setShipping(true)} fullWidth size="lg" />}
            {order.status === "shipped" && <Button label="Mark in transit" loading={busy} onPress={() => transition("in_transit")} fullWidth size="lg" />}
            {order.status === "in_transit" && <Button label="Mark delivered" loading={busy} onPress={() => transition("delivered")} fullWidth size="lg" />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
