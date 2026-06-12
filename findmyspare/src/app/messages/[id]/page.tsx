"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { getThread, sendMessage, markRead } from "@/lib/api/messages";
import { uploadFile } from "@/lib/api/supplier-onboarding";
import { ChatBubble } from "@/components/features/ChatBubble";
import { useAuthStore } from "@/lib/store";
import { useSocket } from "@/lib/socket";
import { BackIcon } from "@/lib/icons";
import { toast } from "@/lib/toast";
import type { Message, MessageAttachment } from "@/lib/types";

// Local-only extension for optimistic UI state. Marker fields are stripped
// on success; on failure they let the user retry.
type LocalMessage = Message & { _pending?: boolean; _failed?: boolean };

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

interface OtherUser {
  id: string;
  name: string;
  role: string;
  businessName: string | null;
  image: string | null;
}

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const socket = useSocket();

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [other, setOther] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStateRef = useRef(false);

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const load = useCallback(async () => {
    try {
      const data = await getThread(id);
      setMessages(data.messages);
      setOther(data.user);
      await markRead(id);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (msg: Message) => {
      if (msg.senderId === id || msg.receiverId === id) {
        setMessages((prev) => {
          // Dedup: optimistic insert may have already added this message
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        markRead(id).catch(() => {});
      }
    };
    const onTypingStart = (p: { from: string }) => {
      if (p.from === id) setOtherTyping(true);
    };
    const onTypingStop = (p: { from: string }) => {
      if (p.from === id) setOtherTyping(false);
    };
    // If the socket drops mid-session, clear the typing indicator and
    // re-fetch on reconnect so we don't show stale state from a prior session.
    const onDisconnect = () => {
      setOtherTyping(false);
    };
    const onConnect = () => {
      load();
    };
    socket.on("message:new", onNew);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("disconnect", onDisconnect);
    socket.on("connect", onConnect);
    return () => {
      socket.off("message:new", onNew);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("disconnect", onDisconnect);
      socket.off("connect", onConnect);
    };
  }, [socket, id, load]);

  // Always emit typing:stop when leaving the thread, so the other party
  // doesn't see a stuck "typing…" indicator.
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingStateRef.current && socket) {
        socket.emit("typing:stop", { to: id });
        typingStateRef.current = false;
      }
    };
  }, [socket, id]);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    if (!typingStateRef.current) {
      socket.emit("typing:start", { to: id });
      typingStateRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { to: id });
      typingStateRef.current = false;
    }, 1500);
  }, [socket, id]);

  const sendOptimistic = useCallback(
    async (content: string, attachments?: MessageAttachment[], existingOptId?: string) => {
      if (!me) return;
      const optId = existingOptId ?? `opt-${Date.now()}`;
      if (!existingOptId) {
        const optimistic: LocalMessage = {
          id: optId,
          senderId: me.id,
          receiverId: id,
          content,
          attachments: attachments ?? [],
          isRead: false,
          createdAt: new Date().toISOString(),
          _pending: true,
        };
        setMessages((prev) => [...prev, optimistic]);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optId ? { ...m, _pending: true, _failed: false } : m
          )
        );
      }
      try {
        const { message } = await sendMessage(id, content, attachments);
        setMessages((prev) => prev.map((m) => (m.id === optId ? message : m)));
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optId ? { ...m, _pending: false, _failed: true } : m
          )
        );
      }
    },
    [me, id]
  );

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !me) return;
    setSending(true);
    setInput("");
    try {
      await sendOptimistic(content);
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file || !me) return;
    const isVideo = file.type.startsWith("video/");
    const cap = isVideo ? 50 : 10;
    if (file.size > cap * 1024 * 1024) {
      toast.error(`${isVideo ? "Video" : "Image"} too large (max ${cap}MB)`);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFile(file, isVideo ? "message_video" : "message_image");
      await sendOptimistic("", [{ url: res.url, type: isVideo ? "video" : "image" }]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const retrySend = async (msg: LocalMessage) => {
    await sendOptimistic(msg.content, msg.attachments ?? undefined, msg.id);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh]">
        <div className="h-14 bg-paper border-b border-line animate-pulse" />
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={clsx("h-10 rounded-[16px] bg-paper-2 animate-pulse", i % 2 === 0 ? "ml-auto w-2/3" : "w-2/3")} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-line bg-paper shrink-0">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-2 transition-colors text-ink"
        >
          <BackIcon size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-paper-3 border border-line flex items-center justify-center text-[13px] font-semibold text-ink-2 shrink-0">
          {other?.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-ink truncate">{other?.name}</p>
          {other?.businessName && (
            <p className="text-[11px] text-ink-3 truncate">{other.businessName}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-[13px] text-ink-3 py-10">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={clsx(msg.senderId === me?.id ? "text-right" : "text-left")}>
            <ChatBubble
              message={msg.content}
              attachments={msg.attachments}
              timestamp={
                msg._pending
                  ? "Sending…"
                  : msg._failed
                  ? "Failed — tap to retry"
                  : fmt(msg.createdAt)
              }
              direction={msg.senderId === me?.id ? "outgoing" : "incoming"}
            />
            {msg._failed && (
              <button
                type="button"
                onClick={() => retrySend(msg)}
                className="text-[11px] text-[color:var(--danger)] font-semibold mt-0.5 mr-2 hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        ))}
        {otherTyping && (
          <div className="flex items-center gap-1 px-3 py-2 ml-1 text-ink-3 text-[12px]">
            <span className="inline-block w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="inline-block w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="inline-block w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="ml-1.5">typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-safe-or-4 pt-3 border-t border-line bg-paper flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleAttach}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending}
          aria-label="Attach photo or video"
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            "bg-paper-2 border border-line text-ink-2 hover:text-ink transition-colors",
            uploading && "opacity-50"
          )}
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.4 18.04a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49" />
          </svg>
        </button>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); emitTyping(); }}
          onKeyDown={handleKey}
          placeholder="Message…"
          rows={1}
          className={clsx(
            "flex-1 resize-none rounded-[20px] px-4 py-2.5",
            "bg-paper-2 border border-line text-ink text-[14px]",
            "placeholder:text-ink-3 outline-none focus:border-ink",
            "max-h-[120px] transition-colors"
          )}
          style={{ height: "auto" }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            "bg-ink text-paper transition-opacity",
            (!input.trim() || sending) ? "opacity-30" : "opacity-100 active:scale-95"
          )}
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
