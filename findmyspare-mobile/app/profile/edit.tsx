import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { profileApi } from "@/lib/api/profile";
import { pickAndUploadImage } from "@/lib/api/upload";
import { useAuthStore } from "@/lib/store";
import { C } from "@/lib/theme";

const PHONE_RE = /^[6-9]\d{9}$/;

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isSupplier = user?.role === "supplier";

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [image, setImage] = useState<string | null>(user?.image ?? null);
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [specialization, setSpecialization] = useState(user?.specialization ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changePhoto() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage("product_image");
      if (url) setImage(url);
    } catch (e) {
      Alert.alert("Upload failed", (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (name.trim().length < 2) return Alert.alert("Missing", "Enter your name.");
    if (phone && !PHONE_RE.test(phone.trim())) return Alert.alert("Invalid", "Enter a valid 10-digit mobile.");
    setBusy(true);
    try {
      const { profile } = await profileApi.update({
        name: name.trim(),
        phone: phone.trim() || undefined,
        image: image || undefined,
        businessName: isSupplier ? businessName.trim() || undefined : undefined,
        specialization: isSupplier ? specialization.trim() || undefined : undefined,
      });
      if (user) {
        await setUser({
          ...user,
          name: profile.name,
          phone: profile.phone,
          image: profile.image,
          businessName: profile.businessName,
          specialization: profile.specialization,
        });
      }
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="Edit profile" back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-4" keyboardShouldPersistTaps="handled">
          <View className="items-center mb-6">
            <Pressable onPress={changePhoto}>
              <Avatar name={name || "?"} image={image} size={88} />
              <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ink items-center justify-center border-2 border-paper">
                <Icon name={uploading ? "hourglass-outline" : "camera"} size={13} color={C.onInk} />
              </View>
            </Pressable>
            <Text className="text-caption text-ink-3 mt-2">Tap to change photo</Text>
          </View>

          <Card className="gap-4">
            <Input label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Input label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholder="9876543210" />
            <Input label="Email" value={user?.email ?? ""} editable={false} className="opacity-60" />
            {isSupplier && (
              <>
                <View className="h-px bg-line my-1" />
                <Input label="Business name" value={businessName} onChangeText={setBusinessName} autoCapitalize="words" />
                <Input label="Specialization" value={specialization} onChangeText={setSpecialization} placeholder="Engine, brakes, body…" />
              </>
            )}
          </Card>

          <View className="mt-6">
            <Button label={busy ? "Saving…" : "Save changes"} loading={busy} onPress={save} fullWidth size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
