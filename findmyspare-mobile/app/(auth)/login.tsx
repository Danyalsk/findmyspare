import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { requestOtp, verifyOtp } from "@/lib/api/auth";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { C } from "@/lib/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function goBackToBrowsing() {
    if (router.canGoBack()) router.back();
    else router.replace("/(buyer)" as never);
  }

  async function sendCode() {
    const em = email.trim().toLowerCase();
    if (!EMAIL_RE.test(em)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await requestOtp(em);
      setStep("code");
      setCooldown(30);
      setTimeout(() => codeRef.current?.focus(), 300);
    } catch (err) {
      Alert.alert("Couldn't send code", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (code.length !== 6) return;
    setBusy(true);
    try {
      const { user, token } = await verifyOtp(email, code);
      await setAuth({ user, accessToken: token });
      router.replace(getPostLoginPath(user) as never);
    } catch (err) {
      Alert.alert("Verification failed", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <PageShell>
        <View className="flex-row justify-end pt-2">
          <Pressable onPress={goBackToBrowsing} className="w-9 h-9 items-center justify-center">
            <Icon name="close" size={24} color={C.ink3} />
          </Pressable>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
        >
          <View className="items-center mt-6 mb-8 gap-2">
            <View className="w-16 h-16 bg-ink rounded-[18px] items-center justify-center">
              <Text className="text-paper text-[32px] serif italic">f</Text>
            </View>
            <Text className="serif text-[30px] text-ink">FindMySpare</Text>
            <Text className="text-ink-3 text-[13px]">Sign in to request parts & message suppliers</Text>
          </View>

          <Card className="gap-4">
            {step === "email" ? (
              <>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onSubmitEditing={sendCode}
                  returnKeyType="send"
                />
                <Button
                  label={busy ? "Sending…" : "Send login code"}
                  loading={busy}
                  onPress={sendCode}
                  fullWidth
                  size="lg"
                />
                <Text className="text-[11px] text-ink-3 text-center">
                  We&apos;ll email you a 6-digit code. No password needed.
                </Text>
              </>
            ) : (
              <>
                <View>
                  <Text className="text-[12px] font-medium text-ink-2 mb-1.5">
                    Enter the code sent to {email}
                  </Text>
                  <OtpBoxes value={code} onChange={setCode} inputRef={codeRef} onFilled={verify} />
                </View>
                <Button
                  label={busy ? "Verifying…" : "Verify & continue"}
                  loading={busy}
                  disabled={code.length !== 6}
                  onPress={verify}
                  fullWidth
                  size="lg"
                />
                <View className="flex-row justify-between items-center">
                  <Pressable onPress={() => { setStep("email"); setCode(""); }}>
                    <Text className="text-[12px] text-ink-2">← Change email</Text>
                  </Pressable>
                  <Pressable disabled={cooldown > 0} onPress={sendCode}>
                    <Text className={`text-[12px] font-semibold ${cooldown > 0 ? "text-ink-3" : "text-accent-ink"}`}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </Card>

          <Text className="text-[11px] text-ink-3 text-center mt-6 px-6 leading-[16px]">
            New here? Signing in creates your account. Want to sell parts? Sign in, then tap
            &quot;Sell on FindMySpare&quot; in your profile.
          </Text>
        </MotiView>
      </PageShell>
    </KeyboardAvoidingView>
  );
}

/* ── 6-digit OTP boxes backed by one hidden input ── */
function OtpBoxes({
  value,
  onChange,
  inputRef,
  onFilled,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<TextInput | null>;
  onFilled: () => void;
}) {
  const cells = Array.from({ length: 6 });
  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View className="flex-row justify-between">
        {cells.map((_, i) => {
          const char = value[i] ?? "";
          const active = i === value.length;
          return (
            <View
              key={i}
              className={`w-[46px] h-[56px] rounded-[12px] border items-center justify-center ${
                active ? "border-accent-ink bg-accent-wash" : char ? "border-ink bg-paper" : "border-line bg-paper-2"
              }`}
            >
              <Text className="text-[22px] text-ink mono">{char}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => {
          const digits = t.replace(/\D/g, "").slice(0, 6);
          onChange(digits);
          if (digits.length === 6) onFilled();
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        className="absolute opacity-0 w-full h-full"
        caretHidden
      />
    </Pressable>
  );
}
