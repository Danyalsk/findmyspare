import React from "react";
import { clsx } from "clsx";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   FilterPills — horizontal scrollable filter chips
   From Search screen (Screen 03)
   Active filters show as ok chips with × dismiss
   ═══════════════════════════════════════════════════════ */

export interface FilterItem {
  label: string;
  active: boolean;
}

export interface FilterPillsProps {
  filters: FilterItem[];
  onRemove?: (label: string) => void;
  onAdd?: () => void;
  className?: string;
}

export function FilterPills({
  filters,
  onRemove,
  onAdd,
  className,
}: FilterPillsProps) {
  return (
    <div
      className={clsx(
        "flex gap-1.5 overflow-x-auto scroll-hidden flex-wrap",
        className
      )}
    >
      {filters.map((f) => (
        <Chip
          key={f.label}
          variant={f.active ? "ok" : "default"}
          onRemove={f.active && onRemove ? () => onRemove(f.label) : undefined}
        >
          {f.label}
        </Chip>
      ))}
      {onAdd && (
        <Chip variant="default" dashed>
          <button
            type="button"
            onClick={onAdd}
            className="cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            + Add filter
          </button>
        </Chip>
      )}
    </div>
  );
}
