import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { inquiriesApi } from "@/lib/api/inquiries";
import { bidsApi } from "@/lib/api/bids";
import { formatPrice } from "@/lib/constants";
import type { Bid, Inquiry } from "@/lib/types";
import { C } from "@/lib/theme";

const CONDITIONS: { value: string; label: string }[] = [
  { value: "oem", label: "OEM" },
  { value: "oem_equivalent", label: "OEM Equivalent" },
  { value: "used", label: "Used / Refurb" },
];

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  // form
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("oem");
  const [warranty, setWarranty] = useState("");
  const [eta, setEta] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [inq, bidRes] = await Promise.all([
        inquiriesApi.get(id),
        bidsApi.listForInquiry(id).catch(() => ({ bids: [] as Bid[] })),
      ]);
      setInquiry(inq.inquiry);
      setMyBid(bidRes.bids?.[0] ?? null); // supplier sees only own bid
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!id) return;
    const p = parseFloat(price);
    if (!p || p <= 0) {
      Alert.alert("Enter a price", "Your quote price is required.");
      return;
    }
    setBusy(true);
    try {
      await bidsApi.submit(id, {
        price: String(p),
        condition,
        warrantyMonths: warranty ? parseInt(warranty) : 0,
        etaDays: eta ? parseInt(eta) : 3,
        notes: notes || undefined,
      });
      Alert.alert("Quote sent", "The buyer has been notified.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.toLowerCase().includes("already")) {
        Alert.alert("Already quoted", "You've already submitted a quote for this request.");
        load();
      } else {
        Alert.alert("Couldn't send quote", msg);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator color={C.accent} />
      </SafeAreaView>
    );
  }
  if (!inquiry) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
        <TopBar title="Lead" back />
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-3">Lead not found or closed</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title={inquiry.partName} back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3" keyboardShouldPersistTaps="handled">
          <Card className="gap-2">
            <Text className="serif text-[22px] text-ink">{inquiry.partName}</Text>
            <Text className="text-[13px] text-ink-2">{inquiry.make} · {inquiry.model} · {inquiry.year}</Text>
            {inquiry.description ? (
              <Text className="text-[13px] text-ink-2 mt-1 leading-[19px]">{inquiry.description}</Text>
            ) : null}
            {inquiry.buyerName ? (
              <Text className="text-[12px] text-accent-ink font-semibold mt-1">Requested by {inquiry.buyerName}</Text>
            ) : null}
            {inquiry.imageUrl ? (
              <Image source={{ uri: inquiry.imageUrl }} style={{ width: "100%", height: 180, borderRadius: 12, marginTop: 8 }} contentFit="cover" />
            ) : null}
          </Card>

          {myBid ? (
            <Card className="mt-5 border-accent-ink gap-2">
              <View className="flex-row items-center gap-2">
                <Icon name="checkmark-circle" size={18} color={C.accent} />
                <Text className="text-[14px] font-semibold text-accent-ink">Your quote is in</Text>
              </View>
              <Text className="mono text-[22px] font-semibold text-ink">{formatPrice(parseFloat(myBid.price))}</Text>
              <Text className="text-[12px] text-ink-3">
                {CONDITIONS.find((c) => c.value === myBid.condition)?.label} · {myBid.warrantyMonths}mo warranty · {myBid.etaDays} day ETA
              </Text>
              {myBid.notes ? <Text className="text-[12px] text-ink-2 mt-1">{myBid.notes}</Text> : null}
              <View className="mt-2">
                <Button
                  label="Message buyer"
                  variant="primary"
                  onPress={() => router.push(`/messages/${inquiry.buyerId}` as never)}
                  leftIcon={<Icon name="chatbubble-outline" size={14} color={C.onInk} />}
                />
              </View>
            </Card>
          ) : (
            <>
              <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Submit your quote</Text>
              <Card className="gap-4">
                <Input label="Price (₹)" value={price} onChangeText={setPrice} placeholder="3200" keyboardType="numeric" />
                <View>
                  <Text className="text-[12px] font-medium text-ink-2 mb-2">Condition</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {CONDITIONS.map((c) => (
                      <Chip key={c.value} label={c.label} active={condition === c.value} onPress={() => setCondition(c.value)} />
                    ))}
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input label="Warranty (months)" value={warranty} onChangeText={setWarranty} placeholder="6" keyboardType="numeric" />
                  </View>
                  <View className="flex-1">
                    <Input label="ETA (days)" value={eta} onChangeText={setEta} placeholder="3" keyboardType="numeric" />
                  </View>
                </View>
                <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Genuine part, in stock, ships today…" multiline numberOfLines={3} className="h-20 pt-3" />
                <Button label={busy ? "Sending…" : "Send quote"} loading={busy} onPress={submit} fullWidth size="lg" />
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
