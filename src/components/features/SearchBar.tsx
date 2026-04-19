import React from "react";
import { clsx } from "clsx";
import { SearchIcon, MicIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   SearchBar — hero search input from Buyer Home (Screen 02)
   52px height, rounded, paper-2 bg, mic button
   ═══════════════════════════════════════════════════════ */

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Part name, OEM number or car…",
  value,
  onChange,
  onSubmit,
  className,
}: SearchBarProps) {
  return (
    <div
      className={clsx(
        "h-[52px] rounded-[14px] bg-paper-2 border border-line",
        "flex items-center px-3.5 gap-2.5",
        "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        "transition-all",
        className
      )}
    >
      <span className="text-ink-3 flex-shrink-0">
        <SearchIcon size={20} />
      </span>
      <input
        type="text"
        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-3"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
      />
      <button
        type="button"
        className="w-7 h-7 rounded-lg bg-ink text-paper flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity active:scale-95"
        aria-label="Voice search"
      >
        <MicIcon size={16} />
      </button>
    </div>
  );
}
