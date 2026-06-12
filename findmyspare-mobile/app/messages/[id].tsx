import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, FlatList, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { ChatBubble } from "@/components/features/ChatBubble";
import { Avatar } from "@/components/ui/Avatar";
import { getThread, sendMessage, markRead } from "@/lib/api/messages";
import { pickAndUploadMedia } from "@/lib/api/upload";
import { useAuthStore } from "@/lib/store";
import { useSocket } from "@/lib/socket";
import type { Message, MessageAttachment } from "@/lib/types";
import { C } from "@/lib/theme";

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<{ id: string; name: string; businessName: string | null; image: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStateRef = useRef(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getThread(id);
      setMessages(data.messages);
      setOther(data.user);
      await markRead(id);
    } catch {}
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  useEffect(() => {
    if (!socket || !id) return;
    const onNew = (msg: Message) => {
      if (msg.senderId === id || msg.receiverId === id) {
        setMessages((prev) => [...prev, msg]);
        markRead(id).catch(() => {});
      }
    };
    const onStart = (p: { from: string }) => { if (p.from === id) setOtherTyping(true); };
    const onStop = (p: { from: string }) => { if (p.from === id) setOtherTyping(false); };
    socket.on("message:new", onNew);
    socket.on("typing:start", onStart);
    socket.on("typing:stop", onStop);
    return () => {
      socket.off("message:new", onNew);
      socket.off("typing:start", onStart);
      socket.off("typing:stop", onStop);
    };
  }, [socket, id]);

  function emitTyping() {
    if (!socket || !id) return;
    if (!typingStateRef.current) {
      socket.emit("typing:start", { to: id });
      typingStateRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { to: id });
      typingStateRef.current = false;
    }, 1500);
  }

  async function pushMessage(content: string, attachments?: MessageAttachment[]) {
    if (!me || !id) return;
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      senderId: me.id,
      receiverId: id,
      content,
      attachments: attachments ?? [],
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const { message } = await sendMessage(id, content, attachments);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? message : m)));
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      throw e;
    }
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || sending || !me || !id) return;
    setSending(true);
    setInput("");
    try {
      await pushMessage(content);
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  async function handleAttach() {
    if (uploading || !id) return;
    setUploading(true);
    try {
      const media = await pickAndUploadMedia();
      if (media) await pushMessage("", [media]);
    } catch (e) {
      Alert.alert("Upload failed", (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <View className="flex-row items-center px-3 h-14 border-b border-line bg-paper">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Icon name="chevron-back" size={22} color={C.ink} />
        </Pressable>
        <Avatar name={other?.name || "?"} image={other?.image} size={32} className="mr-2.5" />
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-ink" numberOfLines={1}>
            {other?.name || "…"}
          </Text>
          {other?.businessName && (
            <Text className="text-[11px] text-ink-3" numberOfLines={1}>
              {other.businessName}
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        className="flex-1"
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={C.accent} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item.content}
                attachments={item.attachments}
                timestamp={fmt(item.createdAt)}
                direction={item.senderId === me?.id ? "outgoing" : "incoming"}
              />
            )}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            ListEmptyComponent={
              <Text className="text-center text-ink-3 mt-10">No messages yet. Say hello!</Text>
            }
            ListFooterComponent={
              otherTyping ? (
                <View className="flex-row items-center gap-1 px-3 py-2 mt-1">
                  <Text className="text-ink-3 text-[12px]">typing…</Text>
                </View>
              ) : null
            }
          />
        )}

        <View className="flex-row items-end gap-2 px-3 pt-2 pb-3 border-t border-line bg-paper">
          <Pressable
            onPress={handleAttach}
            disabled={uploading}
            className={`w-10 h-10 rounded-full items-center justify-center bg-paper-2 border border-line ${uploading ? "opacity-50" : ""}`}
          >
            <Icon name={uploading ? "hourglass-outline" : "add-circle-outline"} size={20} color={C.ink2} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={(t) => { setInput(t); emitTyping(); }}
            placeholder="Message…"
            placeholderTextColor={C.ink3}
            multiline
            className="flex-1 bg-paper-2 border border-line rounded-[20px] px-4 py-2.5 text-[14px] text-ink max-h-[120px]"
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || sending}
            className={`w-10 h-10 rounded-full items-center justify-center bg-ink ${(!input.trim() || sending) ? "opacity-30" : ""}`}
          >
            <Icon name="arrow-up" size={18} color={C.onInk} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
