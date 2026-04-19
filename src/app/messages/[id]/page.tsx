"use client";

import Link from "next/link";
import { useState } from "react";
import { BackIcon, ShieldIcon, MicIcon } from "@/lib/icons";
import { ChatBubble } from "@/components/features/ChatBubble";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   Messages / Chat — Screen 09
   Chat header, order context banner, message thread,
   escrow status pill, composer
   ═══════════════════════════════════════════════════════ */

const messages = [
  {
    direction: "incoming" as const,
    message: "Hi, I've got the brake caliper in stock. OEM sealed condition. Want me to activate escrow?",
    timestamp: "14:32",
  },
  {
    direction: "outgoing" as const,
    message: "Yes please! Can you ship via DTDC Priority? Need it by Thursday.",
    timestamp: "15:05",
  },
  {
    direction: "incoming" as const,
    message: "Done — escrow is active now. I'll pack it today and hand over to DTDC by 6 PM. You'll get tracking within 2 hours.",
    timestamp: "15:12",
  },
  {
    direction: "outgoing" as const,
    message: "Perfect, thanks! Will confirm fitment as soon as it arrives.",
    timestamp: "15:14",
  },
];

export default function ChatPage() {
  const [input, setInput] = useState("");

  return (
    <div className="fixed inset-0 bg-paper flex flex-col z-50">
      {/* ── Chat header ── */}
      <div className="px-5 py-3.5 border-b border-line flex items-center gap-3">
        <Link
          href="/buyer/orders"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="relative">
          <Avatar initials="KP" size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-paper" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">Kirinyaga Parts Ltd.</div>
          <div className="text-[10px] text-accent-ink flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Online · typing…
          </div>
        </div>
      </div>

      {/* ── Order context banner ── */}
      <div className="px-5 py-2.5">
        <div className="flex items-center gap-2.5 px-3 py-2 border border-dashed border-line rounded-[10px]">
          <ShieldIcon size={16} className="text-ink-3 flex-shrink-0" />
          <span className="text-[11px] text-ink-3">
            About order{" "}
            <span className="font-semibold text-ink">ORD-10482</span>
          </span>
          <Link href="/buyer/orders/10482" className="ml-auto text-[11px] text-accent-ink font-medium">
            View →
          </Link>
        </div>
      </div>

      {/* ── Message thread ── */}
      <div className="flex-1 overflow-y-auto scroll-hidden px-5 py-3 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            message={m.message}
            timestamp={m.timestamp}
            direction={m.direction}
          />
        ))}

        {/* Escrow status pill */}
        <div className="flex justify-center my-2">
          <Chip variant="ok">
            <ShieldIcon size={12} />
            Escrow holds ₹3,200
          </Chip>
        </div>
      </div>

      {/* ── Composer ── */}
      <div className="px-5 py-3 border-t border-line flex items-center gap-2.5">
        <button className="w-10 h-10 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 text-ink-3 hover:text-ink transition-colors">
          +
        </button>
        <div className="flex-1 h-10 rounded-[12px] bg-paper-2 border border-line flex items-center px-3">
          <input
            type="text"
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-ink-3"
            placeholder="Message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
          <MicIcon size={18} />
        </button>
      </div>
    </div>
  );
}
