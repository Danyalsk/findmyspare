import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { supplierApi, type OnboardingInput } from "@/lib/api/supplier";
import { pickAndUploadImage } from "@/lib/api/upload";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { INDIAN_STATES } from "@/lib/constants";
import { C } from "@/lib/theme";

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isResubmit = user?.verificationStatus === "rejected";

  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [gst, setGst] = useState(user?.gstNumber || "");
  const [pan, setPan] = useState(user?.panNumber || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [line1, setLine1] = useState(user?.businessAddress?.line1 || "");
  const [line2, setLine2] = useState(user?.businessAddress?.line2 || "");
  const [city, setCity] = useState(user?.businessAddress?.city || "");
  const [state, setState] = useState(user?.businessAddress?.state || "");
  const [pincode, setPincode] = useState(user?.businessAddress?.pincode || "");
  const [certUrl, setCertUrl] = useState<string | null>(user?.gstCertificateUrl || null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (businessName.trim().length < 2) e.businessName = "Enter your business name.";
    if (!GST_RE.test(gst.trim().toUpperCase())) e.gst = "Enter a valid 15-character GSTIN.";
    if (!PAN_RE.test(pan.trim().toUpperCase())) e.pan = "Enter a valid PAN (e.g. ABCDE1234F).";
    if (phone && !PHONE_RE.test(phone.trim())) e.phone = "Enter a valid 10-digit mobile.";
    if (line1.trim().length < 5) e.line1 = "Enter the address.";
    if (city.trim().length < 2) e.city = "Enter the city.";
    if (state.trim().length < 2) e.state = "Select the state.";
    if (!PIN_RE.test(pincode.trim())) e.pincode = "Enter a valid 6-digit pincode.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function addCert() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage("gst_cert");
      if (url) setCertUrl(url);
    } catch (e) {
      Alert.alert("Upload failed", (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!validate()) return;
    setBusy(true);
    const payload: OnboardingInput = {
      businessName: businessName.trim(),
      gstNumber: gst.trim().toUpperCase(),
      panNumber: pan.trim().toUpperCase(),
      phone: phone.trim() || undefined,
      gstCertificateUrl: certUrl || undefined,
      businessAddress: {
        line1: line1.trim(),
        line2: line2.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
    };
    try {
      const { user: updated } = isResubmit
        ? await supplierApi.resubmitOnboarding(payload)
        : await supplierApi.submitOnboarding(payload);
      await setUser(updated);
      router.replace(getPostLoginPath(updated) as never);
    } catch (e) {
      Alert.alert("Submission failed", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <PageShell>
        <View className="pt-4 pb-3">
          <Text className="font-sans-extrabold text-display text-ink">Verify your business</Text>
          <Text className="text-ink-3 text-sub mt-1">
            GST + PAN are required to list parts. Review takes ~24 hours.
          </Text>
        </View>

        {isResubmit && user?.rejectionReason && (
          <Card className="mb-3 bg-danger-wash border-0">
            <Text className="text-caption font-sans-semibold text-danger mb-1">Previous rejection</Text>
            <Text className="text-caption text-ink-2">{user.rejectionReason}</Text>
          </Card>
        )}

        <Card className="gap-4">
          <Input label="Business name" value={businessName} onChangeText={setBusinessName} placeholder="ABC Auto Parts" autoCapitalize="words" error={errors.businessName} />
          <Input label="GST number" value={gst} onChangeText={(t) => setGst(t.toUpperCase())} placeholder="22ABCDE1234F1Z5" autoCapitalize="characters" maxLength={15} error={errors.gst} />
          <Input label="PAN number" value={pan} onChangeText={(t) => setPan(t.toUpperCase())} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} error={errors.pan} />
          <Input label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" maxLength={10} error={errors.phone} />

          <View className="h-px bg-line my-1" />
          <Text className="text-caption font-sans-semibold text-ink-2">Business address</Text>
          <Input label="Address line 1" value={line1} onChangeText={setLine1} placeholder="Shop / building, street" error={errors.line1} />
          <Input label="Address line 2 (optional)" value={line2} onChangeText={setLine2} placeholder="Area, landmark" />
          <Input label="City" value={city} onChangeText={setCity} placeholder="Mumbai" autoCapitalize="words" error={errors.city} />
          <StatePicker value={state} onChange={setState} error={errors.state} />
          <Input label="Pincode" value={pincode} onChangeText={setPincode} placeholder="400001" keyboardType="number-pad" maxLength={6} error={errors.pincode} />

          <View className="h-px bg-line my-1" />
          <View>
            <Text className="text-caption font-sans-medium text-ink-2 mb-2">GST certificate (optional)</Text>
            {certUrl ? (
              <View className="flex-row items-center gap-2">
                <Icon name="document-attach-outline" size={18} color={C.accent} />
                <Text className="text-caption text-accent-ink flex-1" numberOfLines={1}>Attached</Text>
                <Text className="text-caption text-danger" onPress={() => setCertUrl(null)}>Remove</Text>
              </View>
            ) : (
              <Button label={uploading ? "Uploading…" : "Attach certificate"} variant="default" loading={uploading} onPress={addCert} leftIcon={<Icon name="cloud-upload-outline" size={16} color={C.ink} />} />
            )}
          </View>

          <Button label={busy ? "Submitting…" : "Submit for review"} loading={busy} onPress={submit} fullWidth size="lg" />
        </Card>
      </PageShell>
    </KeyboardAvoidingView>
  );
}

function StatePicker({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-1.5">
      <Text className="text-caption font-sans-medium text-ink-2">State</Text>
      <Text
        onPress={() => setOpen((o) => !o)}
        className={`bg-paper-2 border rounded-input px-3.5 py-3 text-body ${value ? "text-ink" : "text-ink-3"} ${error ? "border-danger" : "border-line"}`}
      >
        {value || "Select state"}
      </Text>
      {error && <Text className="text-micro text-danger">{error}</Text>}
      {open && (
        <ScrollView className="max-h-56 bg-paper border border-line rounded-input mt-1" nestedScrollEnabled>
          {INDIAN_STATES.map((s) => (
            <Text
              key={s}
              onPress={() => { onChange(s); setOpen(false); }}
              className={`px-3.5 py-2.5 text-sub ${s === value ? "text-accent-ink font-sans-semibold" : "text-ink-2"}`}
            >
              {s}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
