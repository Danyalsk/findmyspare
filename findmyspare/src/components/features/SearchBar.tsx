import React from "react";
import { clsx } from "clsx";
import { SearchIcon, MicIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   SearchBar — pill-shaped, white surface, accent icon,
   mic FAB. Animates focus ring on input focus.
   ═══════════════════════════════════════════════════════ */

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Part name, OEM number or car…",
  value,
  onChange,
  onSubmit,
  className,
  autoFocus,
}: SearchBarProps) {
  return (
    <div
      className={clsx(
        "h-[52px] rounded-full bg-paper shadow-[var(--shadow-card)]",
        "flex items-center px-4 gap-3",
        "border border-transparent",
        "focus-within:border-[color:var(--accent)]/40",
        "transition-all",
        className
      )}
    >
      <SearchIcon size={20} className="text-[color:var(--accent)] flex-shrink-0" />
      <input
        type="text"
        autoFocus={autoFocus}
        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] font-medium text-ink placeholder:text-ink-3 placeholder:font-normal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
      />
      <button
        type="button"
        className="w-9 h-9 rounded-full bg-[color:var(--accent)] text-white flex items-center justify-center flex-shrink-0 fms-press"
        aria-label="Voice search"
      >
        <MicIcon size={16} />
      </button>
    </div>
  );
}
