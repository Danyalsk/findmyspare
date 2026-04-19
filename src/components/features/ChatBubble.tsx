import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   ChatBubble — message bubble from Screen 09
   Incoming (left, paper-2 bg) vs outgoing (right, ink bg)
   ═══════════════════════════════════════════════════════ */

export interface ChatBubbleProps {
  message: string;
  timestamp?: string;
  direction: "incoming" | "outgoing";
  image?: string;
  readStatus?: "sent" | "delivered" | "read";
  className?: string;
}

export function ChatBubble({
  message,
  timestamp,
  direction,
  image,
  className,
}: ChatBubbleProps) {
  const isOut = direction === "outgoing";

  return (
    <div
      className={clsx(
        "flex max-w-[82%]",
        isOut ? "ml-auto" : "mr-auto",
        className
      )}
    >
      <div
        className={clsx(
          "px-3.5 py-2.5 text-[13px] leading-[1.45]",
          isOut
            ? "bg-ink text-paper rounded-[16px_16px_4px_16px]"
            : "bg-paper-2 text-ink rounded-[16px_16px_16px_4px] border border-line"
        )}
      >
        {image && (
          <div className="w-full rounded-[10px] overflow-hidden mb-2 bg-paper-3">
            <img src={image} alt="" className="w-full h-auto" />
          </div>
        )}
        <div>{message}</div>
        {timestamp && (
          <div
            className={clsx(
              "mono text-[10px] mt-1.5",
              isOut ? "text-white/40 text-right" : "text-ink-3"
            )}
          >
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
