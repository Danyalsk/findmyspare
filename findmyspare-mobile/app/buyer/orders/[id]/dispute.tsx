import React, { useState } from "react";
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { disputesApi } from "@/lib/api/disputes";
import { haptics } from "@/lib/haptics";
import type { IssueType } from "@/lib/types";

const ISSUES: { value: IssueType; label: string }[] = [
  { value: "wrong_part", label: "Wrong part" },
  { value: "damaged", label: "Damaged" },
  { value: "not_as_described", label: "Not as described" },
  { value: "missing_parts", label: "Missing parts" },
  { value: "not_delivered", label: "Not delivered" },
  { value: "other", label: "Other" },
];

export default function RaiseDisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [issueType, setIssueType] = useState<IssueType>("wrong_part");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (description.trim().length < 10) {
      Alert.alert("Add detail", "Describe the issue in at least 10 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await disputesApi.raise(id!, { issueType, description: description.trim() });
      haptics.success();
      router.replace(`/disputes/${res.dispute.id}` as never);
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="Raise a dispute" back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3" keyboardShouldPersistTaps="handled">
          <Card className="gap-4">
            <View>
              <Text className="text-caption font-sans-medium text-ink-2 mb-2">What went wrong?</Text>
              <View className="flex-row flex-wrap gap-2">
                {ISSUES.map((i) => (
                  <Chip key={i.value} label={i.label} active={issueType === i.value} onPress={() => setIssueType(i.value)} />
                ))}
              </View>
            </View>
            <Input
              label="Describe the issue"
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us what happened…"
              multiline
              numberOfLines={5}
              className="h-28 pt-3"
            />
          </Card>
          <Text className="text-caption text-ink-3 mt-3 px-1">
            Raising a dispute pauses the order. Your escrow stays held until it&apos;s resolved.
          </Text>
          <View className="mt-5">
            <Button label={busy ? "Submitting…" : "Submit dispute"} loading={busy} onPress={submit} fullWidth size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
