import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { disputesApi } from "@/lib/api/disputes";
import { haptics } from "@/lib/haptics";
import { useAuthStore } from "@/lib/store";
import type { Dispute, DisputeStatus, OrderEntity } from "@/lib/types";
import { C } from "@/lib/theme";

const ISSUE_LABEL: Record<string, string> = {
  wrong_part: "Wrong part",
  damaged: "Damaged",
  not_as_described: "Not as described",
  missing_parts: "Missing parts",
  not_delivered: "Not delivered",
  other: "Other",
};

const STATUS_META: Record<DisputeStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: C.amber, bg: C.amberWash },
  under_review: { label: "Under review", color: C.amber, bg: C.amberWash },
  return_approved: { label: "Return approved", color: C.success, bg: C.successWash },
  return_rejected: { label: "Return rejected", color: C.danger, bg: C.dangerWash },
  resolved: { label: "Resolved", color: C.success, bg: C.successWash },
  closed: { label: "Closed", color: C.ink3, bg: C.paper3 },
};

export default function DisputeThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [order, setOrder] = useState<OrderEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await disputesApi.get(id);
      setDispute(res.dispute);
      setOrder(res.order);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function respond(action?: "approve_return" | "reject" | "confirm_return") {
    setBusy(true);
    try {
      await disputesApi.respond(id!, {
        ...(action ? { action } : {}),
        ...(response.trim() ? { supplierResponse: response.trim() } : {}),
      });
      haptics.success();
      setResponse("");
      load();
    } catch (e) { Alert.alert("Failed", (e as Error).message); }
    finally { setBusy(false); }
  }

  if (loading) {
    return <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center"><ActivityIndicator color={C.accent} /></SafeAreaView>;
  }
  if (!dispute) {
    return <SafeAreaView edges={["top"]} className="flex-1 bg-paper"><TopBar title="Dispute" back /><View className="flex-1 items-center justify-center"><Text className="text-ink-3">Dispute not found</Text></View></SafeAreaView>;
  }

  const meta = STATUS_META[dispute.status];
  const isSupplier = !!order && user?.id === order.supplierId;
  const canRespond = isSupplier && (dispute.status === "open" || dispute.status === "under_review");
  const canConfirmReturn = isSupplier && dispute.status === "return_approved";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="Dispute" back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3" keyboardShouldPersistTaps="handled">
          <Card className="flex-row items-center justify-between">
            <View>
              <Text className="text-micro text-ink-3">Issue</Text>
              <Text className="text-body font-sans-medium text-ink">{ISSUE_LABEL[dispute.issueType] ?? dispute.issueType}</Text>
            </View>
            <View style={{ backgroundColor: meta.bg }} className="px-2.5 py-1 rounded-full">
              <Text style={{ color: meta.color }} className="text-caption font-sans-semibold">{meta.label}</Text>
            </View>
          </Card>

          <Text className="text-caption font-mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Buyer&apos;s report</Text>
          <Card>
            <Text className="text-sub text-ink-2 leading-[19px]">{dispute.description}</Text>
            <Text className="text-micro text-ink-3 mt-2">{new Date(dispute.createdAt).toLocaleString()}</Text>
          </Card>

          {dispute.supplierResponse ? (
            <>
              <Text className="text-caption font-mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Supplier&apos;s response</Text>
              <Card><Text className="text-sub text-ink-2 leading-[19px]">{dispute.supplierResponse}</Text></Card>
            </>
          ) : null}

          {canRespond ? (
            <Card className="gap-3 mt-5">
              <Text className="text-caption font-mono uppercase text-ink-3 tracking-[0.08em]">Respond</Text>
              <Input value={response} onChangeText={setResponse} placeholder="Explain or offer a resolution…" multiline numberOfLines={4} className="h-24 pt-3" />
              <Button label="Approve return & refund" loading={busy} onPress={() => respond("approve_return")} fullWidth />
              <View className="flex-row gap-2">
                <View className="flex-1"><Button label="Send reply" variant="default" loading={busy} onPress={() => respond()} fullWidth /></View>
                <View className="flex-1"><Button label="Reject claim" variant="default" loading={busy} onPress={() => respond("reject")} fullWidth /></View>
              </View>
            </Card>
          ) : null}

          {canConfirmReturn ? (
            <View className="mt-5">
              <Button label="Confirm return received → refund" loading={busy} onPress={() => respond("confirm_return")} fullWidth size="lg" />
            </View>
          ) : null}

          {!isSupplier && dispute.status === "open" ? (
            <Text className="text-caption text-ink-3 text-center mt-5">Waiting for the supplier to respond.</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
