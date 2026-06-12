import React from "react";
import { clsx } from "clsx";
import { Chip } from "@/components/ui/Chip";
import { FilterIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   FilterPills — horizontal scrollable filter chips.
   Active filters use accent-wash; inactive ghost; plus an
   "Add filter" affordance.
   ═══════════════════════════════════════════════════════ */

export interface FilterItem {
  label: string;
  active: boolean;
}

export interface FilterPillsProps {
  filters: FilterItem[];
  onRemove?: (label: string) => void;
  onToggle?: (label: string) => void;
  onAdd?: () => void;
  className?: string;
}

export function FilterPills({
  filters,
  onRemove,
  onToggle,
  onAdd,
  className,
}: FilterPillsProps) {
  return (
    <div
      className={clsx(
        "flex gap-2 overflow-x-auto scroll-hidden py-1",
        className
      )}
    >
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-paper border border-line text-[12px] font-bold text-ink fms-press hover:border-[color:var(--accent)]/40"
        >
          <FilterIcon size={14} className="text-[color:var(--accent)]" />
          Filters
        </button>
      )}
      {filters.map((f) => (
        <button
          key={f.label}
          type="button"
          onClick={() => onToggle?.(f.label)}
          className="flex-shrink-0"
        >
          <Chip
            variant={f.active ? "accent" : "default"}
            size="md"
            onRemove={f.active && onRemove ? () => onRemove(f.label) : undefined}
          >
            {f.label}
          </Chip>
        </button>
      ))}
    </div>
  );
}
