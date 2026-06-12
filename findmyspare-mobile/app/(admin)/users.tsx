import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminApi } from "@/lib/api/admin";
import type { AdminUserRow } from "@/lib/types";
import { C } from "@/lib/theme";

const ROLES = ["all", "buyer", "supplier"] as const;
type RoleFilter = (typeof ROLES)[number];

export default function AdminUsers() {
  const [role, setRole] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await adminApi.users({
        role: role === "all" ? undefined : role,
        search: search.trim() || undefined,
      });
      setItems(r.users);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [role, search]);

  useEffect(() => {
    const t = setTimeout(() => { setLoading(true); load(); }, 250);
    return () => clearTimeout(t);
  }, [load]);

  function toggleBlock(u: AdminUserRow) {
    const next = !u.isBlocked;
    Alert.alert(next ? "Block user" : "Unblock user", `${next ? "Block" : "Unblock"} ${u.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: next ? "Block" : "Unblock",
        style: next ? "destructive" : "default",
        onPress: async () => {
          try {
            await adminApi.setBlocked(u.id, next);
            setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, isBlocked: next } : x)));
          } catch (e) { Alert.alert("Failed", (e as Error).message); }
        },
      },
    ]);
  }

  return (
    <PageShell refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View className="pt-3 pb-3">
        <Text className="font-sans-extrabold text-title text-ink">Users</Text>
      </View>

      <View className="flex-row items-center bg-paper-2 border border-line rounded-input px-3 mb-3">
        <Icon name="search" size={16} color={C.ink3} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or email…"
          placeholderTextColor={C.ink3}
          autoCapitalize="none"
          className="flex-1 py-2.5 px-2 text-body text-ink"
        />
      </View>

      <View className="flex-row gap-2 mb-4">
        {ROLES.map((r) => (
          <Chip key={r} label={r[0].toUpperCase() + r.slice(1)} active={role === r} onPress={() => setRole(r)} />
        ))}
      </View>

      {loading ? (
        <View className="gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} height={68} />)}</View>
      ) : items.length === 0 ? (
        <View className="items-center mt-20 gap-2">
          <Icon name="people-outline" size={44} color={C.ink3} />
          <Text className="text-ink-3 text-body">No users found</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {items.map((u) => (
            <Card key={u.id} className="flex-row items-center gap-3">
              <Avatar name={u.name} size={40} />
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-body font-sans-semibold text-ink" numberOfLines={1}>{u.name}</Text>
                  <Text className="text-micro font-mono uppercase text-ink-3">{u.role}</Text>
                </View>
                <Text className="text-caption text-ink-3" numberOfLines={1}>{u.email}</Text>
              </View>
              <Pressable
                onPress={() => toggleBlock(u)}
                className={`px-3 py-1.5 rounded-full ${u.isBlocked ? "bg-accent-wash" : "bg-danger-wash"}`}
              >
                <Text className={`text-micro font-sans-semibold ${u.isBlocked ? "text-accent-ink" : "text-danger"}`}>
                  {u.isBlocked ? "Unblock" : "Block"}
                </Text>
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </PageShell>
  );
}
