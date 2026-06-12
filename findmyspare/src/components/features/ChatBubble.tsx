"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { CheckIcon } from "@/lib/icons";
import type { MessageAttachment } from "@/lib/types";

/* ═══════════════════════════════════════════════════════
   ChatBubble — Swiggy-style: outgoing uses accent gradient
   (orange), incoming uses soft white card. Read receipts
   shown as double check ticks.
   ═══════════════════════════════════════════════════════ */

export interface ChatBubbleProps {
  message: string;
  timestamp?: string;
  direction: "incoming" | "outgoing";
  image?: string;
  attachments?: MessageAttachment[] | null;
  readStatus?: "sent" | "delivered" | "read";
  className?: string;
}

export function ChatBubble({
  message,
  timestamp,
  direction,
  image,
  attachments,
  readStatus,
  className,
}: ChatBubbleProps) {
  const isOut = direction === "outgoing";
  // `image` kept for backward-compat; attachments is the new path.
  const media = attachments && attachments.length > 0
    ? attachments
    : image
    ? [{ url: image, type: "image" as const }]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "flex max-w-[82%]",
        isOut ? "ml-auto" : "mr-auto",
        className
      )}
    >
      <div
        className={clsx(
          "px-3.5 py-2.5 text-[13px] leading-[1.45] shadow-[var(--shadow-sm)]",
          isOut
            ? "bg-[color:var(--accent)] text-white rounded-[18px_18px_4px_18px]"
            : "bg-paper text-ink rounded-[18px_18px_18px_4px]"
        )}
      >
        {media.map((m, i) => (
          <div key={m.url + i} className="w-full rounded-[12px] overflow-hidden mb-2 bg-paper-3 max-w-[260px]">
            {m.type === "video" ? (
              <video src={m.url} controls preload="metadata" className="w-full h-auto" />
            ) : (
              <img src={m.url} alt="" className="w-full h-auto" />
            )}
          </div>
        ))}
        {message ? (
          <div className="whitespace-pre-wrap break-words font-medium">{message}</div>
        ) : null}
        {(timestamp || readStatus) && (
          <div
            className={clsx(
              "text-[10px] mt-1 flex items-center gap-1 font-semibold",
              isOut ? "text-white/80 justify-end" : "text-ink-3 justify-start"
            )}
          >
            {timestamp && <span>{timestamp}</span>}
            {isOut && readStatus && (
              <span className="inline-flex items-center -space-x-1">
                <CheckIcon size={11} />
                {readStatus !== "sent" && (
                  <CheckIcon
                    size={11}
                    className={readStatus === "read" ? "text-white" : "text-white/60"}
                  />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
