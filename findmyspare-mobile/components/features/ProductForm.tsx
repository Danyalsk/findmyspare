import React, { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Image } from "expo-image";
import { Icon } from "@/components/ui/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { pickAndUploadImage } from "@/lib/api/upload";
import { categories, vehicleData, makes } from "@/lib/constants";
import type { ProductInput } from "@/lib/api/products";
import { C } from "@/lib/theme";

export type ProductFormValues = ProductInput;

interface SpecRow { key: string; value: string }
interface Vehicle { make: string; model: string; year?: string }

export function ProductForm({
  title,
  initial,
  submitLabel,
  onSubmit,
}: {
  title: string;
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [partNumber, setPartNumber] = useState(initial?.partNumber ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [stock, setStock] = useState(initial?.stockQuantity != null ? String(initial.stockQuantity) : "");
  const [lowStock, setLowStock] = useState(initial?.lowStockThreshold != null ? String(initial.lowStockThreshold) : "5");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [warrantyInfo, setWarrantyInfo] = useState(initial?.warrantyInfo ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [specs, setSpecs] = useState<SpecRow[]>(
    initial?.specifications
      ? Object.entries(initial.specifications).map(([key, value]) => ({ key, value }))
      : []
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(initial?.compatibleVehicles ?? []);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  // vehicle add state
  const [vMake, setVMake] = useState(makes[0]);
  const [vModel, setVModel] = useState("");
  const vModels = Object.keys(vehicleData[vMake] || {});

  async function addImage() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage("product_image");
      if (url) setImages((prev) => [...prev, url]);
    } catch (e) {
      Alert.alert("Upload failed", (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addVehicle() {
    if (!vModel) return;
    setVehicles((prev) => [...prev, { make: vMake, model: vModel }]);
    setVModel("");
  }

  async function submit() {
    if (name.trim().length < 2) return Alert.alert("Missing", "Product name is required.");
    if (!price || parseFloat(price) <= 0) return Alert.alert("Missing", "A valid price is required.");
    setBusy(true);
    try {
      const specifications = specs.reduce<Record<string, string>>((acc, r) => {
        if (r.key.trim()) acc[r.key.trim()] = r.value.trim();
        return acc;
      }, {});
      await onSubmit({
        name: name.trim(),
        category: category || undefined,
        partNumber: partNumber.trim() || undefined,
        price: String(parseFloat(price)),
        stockQuantity: stock ? parseInt(stock) : 0,
        lowStockThreshold: lowStock ? parseInt(lowStock) : 5,
        description: description.trim() || undefined,
        warrantyInfo: warrantyInfo.trim() || undefined,
        images,
        specifications: Object.keys(specifications).length ? specifications : undefined,
        compatibleVehicles: vehicles.length ? vehicles : undefined,
      });
    } catch (e) {
      Alert.alert("Save failed", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title={title} back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-3" keyboardShouldPersistTaps="handled">
          {/* Images */}
          <Text className="text-[12px] font-medium text-ink-2 mb-2">Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {images.map((uri, i) => (
                <View key={uri + i}>
                  <Image source={{ uri }} style={{ width: 84, height: 84, borderRadius: 12 }} contentFit="cover" />
                  <Pressable
                    onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-danger rounded-full w-5 h-5 items-center justify-center"
                  >
                    <Icon name="close" size={12} color="#fff" />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={addImage}
                disabled={uploading}
                className="w-[84px] h-[84px] rounded-[12px] border border-dashed border-line-2 bg-paper-2 items-center justify-center"
              >
                <Icon name={uploading ? "hourglass-outline" : "camera-outline"} size={22} color={C.ink3} />
                <Text className="text-[10px] text-ink-3 mt-1">{uploading ? "…" : "Add"}</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Card className="gap-4">
            <Input label="Product name" value={name} onChangeText={setName} placeholder="Front brake pad set" />
            <View>
              <Text className="text-[12px] font-medium text-ink-2 mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((c) => (
                  <Chip key={c.label} label={c.label} active={category === c.label} onPress={() => setCategory(c.label)} />
                ))}
              </View>
            </View>
            <Input label="Part number (optional)" value={partNumber} onChangeText={setPartNumber} placeholder="MD-4521" autoCapitalize="characters" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input label="Price (₹)" value={price} onChangeText={setPrice} placeholder="3200" keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Input label="Stock" value={stock} onChangeText={setStock} placeholder="10" keyboardType="numeric" />
              </View>
            </View>
            <Input label="Low-stock alert below" value={lowStock} onChangeText={setLowStock} placeholder="5" keyboardType="numeric" />
            <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Condition, brand, fitment notes…" multiline numberOfLines={3} className="h-20 pt-3" />
            <Input label="Warranty info (optional)" value={warrantyInfo} onChangeText={setWarrantyInfo} placeholder="6 months manufacturer warranty" />
          </Card>

          {/* Compatible vehicles */}
          <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Compatible vehicles</Text>
          <Card className="gap-3">
            {vehicles.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {vehicles.map((v, i) => (
                  <Pressable key={i} onPress={() => setVehicles((prev) => prev.filter((_, idx) => idx !== i))}>
                    <View className="flex-row items-center gap-1 bg-paper-2 border border-line rounded-full px-3 py-1.5">
                      <Text className="text-[12px] text-ink-2">{v.make} {v.model}</Text>
                      <Icon name="close" size={12} color={C.ink3} />
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
            <View>
              <Text className="text-[11px] text-ink-3 mb-1.5">Make</Text>
              <View className="flex-row flex-wrap gap-2">
                {makes.map((m) => (
                  <Chip key={m} label={m} active={vMake === m} onPress={() => { setVMake(m); setVModel(""); }} />
                ))}
              </View>
            </View>
            {vModels.length > 0 && (
              <View>
                <Text className="text-[11px] text-ink-3 mb-1.5">Model</Text>
                <View className="flex-row flex-wrap gap-2">
                  {vModels.map((m) => (
                    <Chip key={m} label={m} active={vModel === m} onPress={() => setVModel(m)} />
                  ))}
                </View>
              </View>
            )}
            <Button label="Add vehicle" variant="default" size="sm" onPress={addVehicle} disabled={!vModel} leftIcon={<Icon name="add" size={14} color={C.ink} />} />
          </Card>

          {/* Specifications */}
          <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">Specifications</Text>
          <Card className="gap-3">
            {specs.map((row, i) => (
              <View key={i} className="flex-row gap-2 items-end">
                <View className="flex-1">
                  <Input placeholder="Material" value={row.key} onChangeText={(t) => setSpecs((prev) => prev.map((r, idx) => idx === i ? { ...r, key: t } : r))} />
                </View>
                <View className="flex-1">
                  <Input placeholder="Ceramic" value={row.value} onChangeText={(t) => setSpecs((prev) => prev.map((r, idx) => idx === i ? { ...r, value: t } : r))} />
                </View>
                <Pressable onPress={() => setSpecs((prev) => prev.filter((_, idx) => idx !== i))} className="pb-3">
                  <Icon name="trash-outline" size={18} color={C.danger} />
                </Pressable>
              </View>
            ))}
            <Button label="Add spec" variant="default" size="sm" onPress={() => setSpecs((prev) => [...prev, { key: "", value: "" }])} leftIcon={<Icon name="add" size={14} color={C.ink} />} />
          </Card>

          <View className="mt-6">
            <Button label={busy ? "Saving…" : submitLabel} loading={busy} onPress={submit} fullWidth size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
