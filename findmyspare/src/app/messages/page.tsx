"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { getConversations } from "@/lib/api/messages";
import type { Conversation } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import { useSocket } from "@/lib/socket";
import { ChatIcon, SearchIcon } from "@/lib/icons";
import { Avatar } from "@/components/ui/Avatar";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      const { conversations } = await getConversations();
      setConvos(conversations);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    function onMessageRead({ readByUserId }: { readByUserId: string }) {
      setConvos((prev) =>
        prev.map((c) => (c.userId === readByUserId ? { ...c, unreadCount: 0 } : c))
      );
    }
    socket.on("message:new", load);
    socket.on("message:read", onMessageRead);
    return () => {
      socket.off("message:new", load);
      socket.off("message:read", onMessageRead);
    };
  }, [socket, load]);

  if (!user || user.role === "admin" || user.role === "super_admin") return null;

  const filtered = q.trim()
    ? convos.filter((c) =>
        (c.name + " " + (c.businessName || "")).toLowerCase().includes(q.trim().toLowerCase())
      )
    : convos;

  return (
    <div className="min-h-dvh bg-paper-3 pb-24 md:pb-8">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-paper rounded-b-[24px] shadow-[var(--shadow-card)]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(450px 200px at 0% 0%, rgba(252,128,25,0.14) 0%, rgba(252,128,25,0) 60%)",
          }}
        />
        <div className="relative px-5 pt-6 pb-4">
          <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
            Inbox
          </div>
          <div className="display text-[26px] text-ink mt-1 leading-tight">
            Messages
          </div>
          <p className="text-[12px] text-ink-3 mt-1">
            All your supplier and buyer conversations in one place.
          </p>

          {/* Search */}
          <div className="mt-4 flex items-center gap-3 px-4 h-12 rounded-full bg-paper-3">
            <SearchIcon size={18} className="text-[color:var(--accent)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or business…"
              className="flex-1 bg-transparent outline-none text-[14px] font-medium placeholder:text-ink-3 placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 max-w-xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[78px] rounded-[16px] fms-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState empty={convos.length === 0} />
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((c) => (
              <li key={c.userId}>
                <Link
                  href={`/messages/${c.userId}`}
                  className="flex items-center gap-3 p-3.5 rounded-[16px] bg-paper shadow-[var(--shadow-card)] fms-press hover:shadow-[var(--shadow-lifted)] transition-shadow"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      initials={c.name.charAt(0).toUpperCase()}
                      size="lg"
                    />
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-[color:var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="display text-[14px] text-ink truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-3 flex-shrink-0">
                        {timeAgo(c.lastMessageAt)}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "text-[12px] truncate mt-0.5",
                        c.unreadCount > 0
                          ? "text-ink font-semibold"
                          : "text-ink-3"
                      )}
                    >
                      {c.lastMessage
                        ? c.lastMessage
                        : c.lastAttachments?.[0]?.type === "video"
                        ? "🎬 Video"
                        : c.lastAttachments?.length
                        ? "📷 Photo"
                        : ""}
                    </div>
                    {c.businessName && (
                      <div className="text-[10px] text-[color:var(--accent-ink)] font-bold mt-0.5 uppercase tracking-wide truncate">
                        {c.businessName}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ empty }: { empty: boolean }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-16 rounded-[20px] bg-paper shadow-[var(--shadow-card)]">
      <div className="w-16 h-16 rounded-full bg-accent-wash flex items-center justify-center text-[color:var(--accent-ink)] mb-4">
        <ChatIcon size={28} />
      </div>
      <div className="display text-[18px] text-ink mb-1">
        {empty ? "No conversations yet" : "No matches"}
      </div>
      <div className="text-[13px] text-ink-3 max-w-[260px]">
        {empty
          ? "Once you reach out to a supplier or receive a quote, your chats will land here."
          : "Try a different name or business."}
      </div>
    </div>
  );
}
