import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { Icon } from "@/components/ui/Icon";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { inquiriesApi } from "@/lib/api/inquiries";
import { haptics } from "@/lib/haptics";
import { pickAndUploadImage } from "@/lib/api/upload";
import { vehicleData, makes } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";
import { AuthGate } from "@/components/features/AuthGate";
import type { Inquiry } from "@/lib/types";
import { C } from "@/lib/theme";

export default function RequestsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const r = await inquiriesApi.mine();
      setItems(r.inquiries);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <AuthGate
        icon="document-text-outline"
        title="Sign in to post requests"
        subtitle="Tell suppliers the part you need and get quotes in minutes."
      />
    );
  }

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View className="pt-3 pb-3 flex-row items-center justify-between">
        <Text className="font-sans-extrabold text-title text-ink">My requests</Text>
        <Pressable
          onPress={() => setOpen(true)}
          className="bg-ink rounded-full w-10 h-10 items-center justify-center"
        >
          <Icon name="add" size={22} color={C.onInk} />
        </Pressable>
      </View>

      {loading ? (
        <View className="gap-2.5">
          {[0, 1, 2].map((i) => (
            <View key={i} className="bg-paper-2 rounded-card h-[100px]" />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View className="items-center mt-20 gap-3">
          <Icon name="document-text-outline" size={48} color={C.ink3} />
          <Text className="text-ink-3 text-body">No requests yet</Text>
          <Button label="Post a request" onPress={() => setOpen(true)} />
        </View>
      ) : (
        <View className="gap-2.5">
          {items.map((it, i) => (
            <MotiView
              key={it.id}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 200, delay: i * 25 }}
            >
              <Pressable onPress={() => router.push(`/buyer/requests/${it.id}` as never)}>
                <Card>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-body font-sans-semibold text-ink flex-1" numberOfLines={1}>
                      {it.partName}
                    </Text>
                    <Chip
                      label={`${it.bidCount ?? 0} ${(it.bidCount ?? 0) === 1 ? "quote" : "quotes"}`}
                      active={(it.bidCount ?? 0) > 0}
                    />
                  </View>
                  <Text className="text-caption text-ink-3">
                    {it.make} · {it.model} · {it.year}
                  </Text>
                  {it.description && (
                    <Text className="text-caption text-ink-2 mt-1" numberOfLines={2}>
                      {it.description}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-micro text-ink-3 font-mono uppercase">{it.status}</Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-micro text-accent-ink font-sans-semibold">View quotes</Text>
                      <Icon name="chevron-forward" size={13} color={C.accent} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            </MotiView>
          ))}
        </View>
      )}

      <NewRequestModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => { setOpen(false); load(); }}
      />
    </PageShell>
  );
}

function NewRequestModal({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [partName, setPartName] = useState("");
  const [make, setMake] = useState(makes[0]);
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const models = Object.keys(vehicleData[make] || {});
  const years = (model && vehicleData[make]?.[model]) || [];

  async function addPhoto() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage("inquiry_image");
      if (url) setImageUrl(url);
    } catch (e) {
      Alert.alert("Upload failed", (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!partName || !model || !year) {
      Alert.alert("Missing", "Part, model and year are required");
      return;
    }
    setBusy(true);
    try {
      await inquiriesApi.create({
        partName,
        make,
        model,
        year,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
      });
      haptics.success();
      setPartName(""); setModel(""); setYear(""); setDescription(""); setImageUrl(null);
      onCreated();
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <Modal visible={open} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <PageShell>
          <View className="pt-2 pb-3 flex-row items-center justify-between">
            <Text className="font-sans-extrabold text-title text-ink">New request</Text>
            <Pressable onPress={onClose} className="p-2">
              <Icon name="close" size={22} color={C.ink} />
            </Pressable>
          </View>

          <Card className="gap-3">
            <Input label="Part name" value={partName} onChangeText={setPartName} placeholder="e.g. Front brake pads" />
            <View>
              <Text className="text-caption font-sans-medium text-ink-2 mb-2">Make</Text>
              <View className="flex-row flex-wrap gap-2">
                {makes.map((m) => (
                  <Chip key={m} label={m} active={make === m} onPress={() => { setMake(m); setModel(""); setYear(""); }} />
                ))}
              </View>
            </View>
            {models.length > 0 && (
              <View>
                <Text className="text-caption font-sans-medium text-ink-2 mb-2">Model</Text>
                <View className="flex-row flex-wrap gap-2">
                  {models.map((m) => (
                    <Chip key={m} label={m} active={model === m} onPress={() => { setModel(m); setYear(""); }} />
                  ))}
                </View>
              </View>
            )}
            {years.length > 0 && (
              <View>
                <Text className="text-caption font-sans-medium text-ink-2 mb-2">Year</Text>
                <View className="flex-row flex-wrap gap-2">
                  {years.map((y) => (
                    <Chip key={y} label={y} active={year === y} onPress={() => setYear(y)} />
                  ))}
                </View>
              </View>
            )}
            <Input
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="OEM number, condition preference, urgency…"
              multiline
              numberOfLines={3}
              className="h-20 pt-3"
            />

            {/* Optional photo */}
            <View>
              <Text className="text-caption font-sans-medium text-ink-2 mb-2">Photo (optional)</Text>
              {imageUrl ? (
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: imageUrl }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit="cover" />
                  <Pressable onPress={() => setImageUrl(null)}>
                    <Text className="text-caption text-danger">Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <Button
                  label={uploading ? "Uploading…" : "Add photo"}
                  variant="default"
                  loading={uploading}
                  onPress={addPhoto}
                  leftIcon={<Icon name="camera-outline" size={16} color={C.ink} />}
                />
              )}
            </View>

            <Button label={busy ? "Posting…" : "Post request"} loading={busy} onPress={submit} fullWidth size="lg" />
          </Card>
        </PageShell>
      </KeyboardAvoidingView>
    </Modal>
  );
}
