import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { completeProfile, signOut } from "@/lib/api/auth";
import { useAuthStore, getPostLoginPath } from "@/lib/store";

const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;

export default function CompleteProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const isBuyer = user?.role === "buyer";
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [pincode, setPincode] = useState(user?.pincode ?? "");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Enter your full name.";
    if (!PHONE_RE.test(phone.trim())) e.phone = "Enter a valid 10-digit Indian mobile.";
    if (isBuyer) {
      if (city.trim().length < 2) e.city = "Enter your city.";
      if (!PIN_RE.test(pincode.trim())) e.pincode = "Enter a valid 6-digit pincode.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setBusy(true);
    try {
      const payload: Record<string, string> = { name: name.trim(), phone: phone.trim() };
      if (isBuyer) {
        payload.city = city.trim();
        payload.pincode = pincode.trim();
      }
      const { user: updated } = await completeProfile(payload);
      await setUser(updated);
      router.replace(getPostLoginPath(updated) as never);
    } catch (err) {
      Alert.alert("Couldn't save", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <PageShell>
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
        >
          <View className="mt-10 mb-6 gap-1">
            <Text className="font-sans-extrabold text-display text-ink">Almost there</Text>
            <Text className="text-ink-3 text-sub">
              Tell us a bit about you to finish setting up your account.
            </Text>
          </View>

          <Card className="gap-4">
            <Input
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              error={errors.name}
            />
            <Input
              label="Mobile number"
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />
            {isBuyer && (
              <>
                <Input
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  placeholder="Mumbai"
                  autoCapitalize="words"
                  error={errors.city}
                />
                <Input
                  label="Pincode"
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="400001"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.pincode}
                />
              </>
            )}
            <Button
              label={busy ? "Saving…" : "Continue"}
              loading={busy}
              onPress={submit}
              fullWidth
              size="lg"
            />
          </Card>

          <Pressable onPress={handleSignOut} className="mt-6 items-center py-3">
            <Text className="text-sub text-ink-3">Sign out</Text>
          </Pressable>
        </MotiView>
      </PageShell>
    </KeyboardAvoidingView>
  );
}
