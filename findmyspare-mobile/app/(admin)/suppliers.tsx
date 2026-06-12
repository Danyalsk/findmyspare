import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminApi, type AdminSupplierRow, type AdminSupplierDetail } from "@/lib/api/admin";
import { C } from "@/lib/theme";

const FILTERS = ["pending", "approved", "rejected", "all"] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminSuppliers() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [items, setItems] = useState<AdminSupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await adminApi.suppliers(filter === "all" ? {} : { status: filter });
      setItems(r.suppliers);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View className="pt-3 pb-3">
        <Text className="serif text-[24px] text-ink">Suppliers</Text>
      </View>

      <View className="flex-row gap-2 mb-4">
        {FILTERS.map((f) => (
          <Chip key={f} label={f[0].toUpperCase() + f.slice(1)} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      {loading ? (
        <View className="gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} height={76} />)}</View>
      ) : items.length === 0 ? (
        <View className="items-center mt-20 gap-2">
          <Icon name="shield-outline" size={44} color={C.ink3} />
          <Text className="text-ink-3 text-[14px]">No {filter === "all" ? "" : filter} suppliers</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {items.map((s) => (
            <Pressable key={s.id} onPress={() => setSelected(s.id)}>
              <Card className="flex-row items-center gap-3">
                <Avatar name={s.businessName || s.name} size={42} />
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-ink" numberOfLines={1}>
                    {s.businessName || s.name}
                  </Text>
                  <Text className="text-[12px] text-ink-3" numberOfLines={1}>{s.email}</Text>
                  {s.gstNumber ? <Text className="text-[11px] text-ink-3 mono mt-0.5">{s.gstNumber}</Text> : null}
                </View>
                <StatusPill status={s.verificationStatus} />
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <SupplierDetailModal
        id={selected}
        onClose={() => setSelected(null)}
        onChanged={() => { setSelected(null); load(); }}
      />
    </PageShell>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const map: Record<string, { cls: string; text: string }> = {
    pending: { cls: "bg-amber-wash", text: "text-amber" },
    approved: { cls: "bg-accent-wash", text: "text-accent-ink" },
    rejected: { cls: "bg-danger-wash", text: "text-danger" },
    not_submitted: { cls: "bg-paper-2", text: "text-ink-3" },
  };
  const s = map[status ?? "not_submitted"] ?? map.not_submitted;
  return (
    <View className={`px-2 py-0.5 rounded-full ${s.cls}`}>
      <Text className={`text-[10px] mono uppercase font-semibold ${s.text}`}>{status ?? "—"}</Text>
    </View>
  );
}

function SupplierDetailModal({
  id, onClose, onChanged,
}: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<AdminSupplierDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!id) { setDetail(null); setRejecting(false); setReason(""); return; }
    setLoading(true);
    adminApi.supplier(id).then((r) => setDetail(r.supplier)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  async function approve() {
    if (!id) return;
    setBusy(true);
    try { await adminApi.approveSupplier(id); onChanged(); }
    catch (e) { Alert.alert("Failed", (e as Error).message); }
    finally { setBusy(false); }
  }

  async function reject() {
    if (!id) return;
    if (reason.trim().length < 5) return Alert.alert("Reason needed", "Enter at least 5 characters.");
    setBusy(true);
    try { await adminApi.rejectSupplier(id, reason.trim()); onChanged(); }
    catch (e) { Alert.alert("Failed", (e as Error).message); }
    finally { setBusy(false); }
  }

  const gstv = detail?.gstVerification as { ok?: boolean; legalName?: string; nameMatch?: boolean } | null;

  return (
    <Modal visible={!!id} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
        <View className="flex-row items-center justify-between px-5 h-14">
          <Text className="serif text-[20px] text-ink">Supplier review</Text>
          <Pressable onPress={onClose} className="p-2"><Icon name="close" size={22} color={C.ink} /></Pressable>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12" keyboardShouldPersistTaps="handled">
            {loading || !detail ? (
              <Skeleton height={200} />
            ) : (
              <>
                <Card className="gap-1">
                  <Text className="text-[17px] font-semibold text-ink">{detail.businessName || detail.name}</Text>
                  <Text className="text-[13px] text-ink-3">{detail.email}</Text>
                  {detail.phone ? <Text className="text-[13px] text-ink-3">{detail.phone}</Text> : null}
                  <View className="mt-1"><StatusPill status={detail.verificationStatus} /></View>
                </Card>

                <Card className="mt-3 gap-2">
                  <Detail label="GST number" value={detail.gstNumber} mono />
                  <Detail label="PAN" value={detail.panNumber} mono />
                  {detail.businessAddress && (
                    <Detail
                      label="Address"
                      value={`${detail.businessAddress.line1}, ${detail.businessAddress.city}, ${detail.businessAddress.state} ${detail.businessAddress.pincode}`}
                    />
                  )}
                </Card>

                {gstv && (
                  <Card className={`mt-3 gap-1 ${gstv.ok ? "border-accent-ink" : "border-amber"}`}>
                    <Text className="text-[12px] mono uppercase text-ink-3">GST verification</Text>
                    <Text className={`text-[13px] font-semibold ${gstv.ok ? "text-accent-ink" : "text-amber"}`}>
                      {gstv.ok ? "Verified with GST registry" : "Could not verify"}
                    </Text>
                    {gstv.legalName ? <Text className="text-[12px] text-ink-2">Legal name: {gstv.legalName}</Text> : null}
                    {typeof gstv.nameMatch === "boolean" && (
                      <Text className="text-[12px] text-ink-2">Name match: {gstv.nameMatch ? "Yes" : "No"}</Text>
                    )}
                  </Card>
                )}

                {detail.verificationStatus === "rejected" && detail.rejectionReason ? (
                  <Card className="mt-3 bg-danger-wash border-0">
                    <Text className="text-[12px] font-semibold text-danger mb-1">Rejection reason</Text>
                    <Text className="text-[12px] text-ink-2">{detail.rejectionReason}</Text>
                  </Card>
                ) : null}

                {rejecting ? (
                  <View className="mt-5 gap-3">
                    <Text className="text-[12px] font-medium text-ink-2">Reason for rejection</Text>
                    <TextInput
                      value={reason}
                      onChangeText={setReason}
                      placeholder="Explain what needs fixing…"
                      placeholderTextColor={C.ink3}
                      multiline
                      className="bg-paper-2 border border-line rounded-[12px] px-3.5 py-3 text-[14px] text-ink h-24"
                    />
                    <View className="flex-row gap-2">
                      <View className="flex-1"><Button label="Cancel" variant="default" onPress={() => setRejecting(false)} fullWidth /></View>
                      <View className="flex-1"><Button label={busy ? "…" : "Confirm reject"} variant="danger" loading={busy} onPress={reject} fullWidth /></View>
                    </View>
                  </View>
                ) : detail.verificationStatus !== "approved" ? (
                  <View className="flex-row gap-2 mt-5">
                    <View className="flex-1"><Button label="Reject" variant="danger" onPress={() => setRejecting(true)} fullWidth size="lg" /></View>
                    <View className="flex-1"><Button label={busy ? "…" : "Approve"} variant="accent" loading={busy} onPress={approve} fullWidth size="lg" /></View>
                  </View>
                ) : (
                  <View className="mt-5 items-center">
                    <Text className="text-[13px] text-accent-ink font-semibold">✓ Approved supplier</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Detail({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-[12px] text-ink-3">{label}</Text>
      <Text className={`text-[12px] text-ink font-medium flex-1 text-right ${mono ? "mono" : ""}`}>{value || "—"}</Text>
    </View>
  );
}
