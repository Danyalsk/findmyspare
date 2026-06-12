import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addressesApi } from "@/lib/api/addresses";
import { INDIAN_STATES } from "@/lib/constants";

const PIN_RE = /^\d{6}$/;

export default function NewAddressScreen() {
  const router = useRouter();
  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (line1.trim().length < 5) return Alert.alert("Missing", "Enter the address.");
    if (city.trim().length < 2) return Alert.alert("Missing", "Enter the city.");
    if (state.trim().length < 2) return Alert.alert("Missing", "Select the state.");
    if (!PIN_RE.test(postalCode.trim())) return Alert.alert("Invalid", "Enter a 6-digit pincode.");
    setBusy(true);
    try {
      await addressesApi.create({
        label: label.trim() || undefined,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim() || undefined,
        isDefault,
      });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="New address" back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-4" keyboardShouldPersistTaps="handled">
          <Card className="gap-4">
            <Input label="Label" value={label} onChangeText={setLabel} placeholder="Home / Office" />
            <Input label="Address line 1" value={line1} onChangeText={setLine1} placeholder="Flat, building, street" />
            <Input label="Address line 2 (optional)" value={line2} onChangeText={setLine2} placeholder="Area, landmark" />
            <Input label="City" value={city} onChangeText={setCity} placeholder="Mumbai" autoCapitalize="words" />

            <View className="gap-1.5">
              <Text className="text-[12px] font-medium text-ink-2">State</Text>
              <Text
                onPress={() => setStateOpen((o) => !o)}
                className={`bg-paper-2 border border-line rounded-[12px] px-3.5 py-3 text-[14px] ${state ? "text-ink" : "text-ink-3"}`}
              >
                {state || "Select state"}
              </Text>
              {stateOpen && (
                <ScrollView className="max-h-56 bg-paper border border-line rounded-[12px] mt-1" nestedScrollEnabled>
                  {INDIAN_STATES.map((s) => (
                    <Text
                      key={s}
                      onPress={() => { setState(s); setStateOpen(false); }}
                      className={`px-3.5 py-2.5 text-[13px] ${s === state ? "text-accent-ink font-semibold" : "text-ink-2"}`}
                    >
                      {s}
                    </Text>
                  ))}
                </ScrollView>
              )}
            </View>

            <Input label="Pincode" value={postalCode} onChangeText={setPostalCode} placeholder="400001" keyboardType="number-pad" maxLength={6} />
            <Input label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" maxLength={10} />

            <Pressable onPress={() => setIsDefault((d) => !d)} className="flex-row items-center gap-2">
              <View className={`w-5 h-5 rounded-[6px] border items-center justify-center ${isDefault ? "bg-accent-ink border-accent-ink" : "border-line-2"}`}>
                {isDefault && <Text className="text-paper text-[12px]">✓</Text>}
              </View>
              <Text className="text-[13px] text-ink-2">Set as default address</Text>
            </Pressable>
          </Card>

          <View className="mt-6">
            <Button label={busy ? "Saving…" : "Save address"} loading={busy} onPress={save} fullWidth size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
