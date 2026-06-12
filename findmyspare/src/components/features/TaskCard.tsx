import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon, type IconProps } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   TaskCard — soft tile with circular icon tile, title,
   subtitle, status chip or chevron.
   ═══════════════════════════════════════════════════════ */

export interface TaskCardProps {
  icon: React.ComponentType<IconProps>;
  title: string;
  subtitle: string;
  tag?: string;
  tagVariant?: "warn" | "danger" | "ok" | "default" | "accent";
  href?: string;
  className?: string;
}

export function TaskCard({
  icon: IconComp,
  title,
  subtitle,
  tag,
  tagVariant = "default",
  href = "#",
  className,
}: TaskCardProps) {
  return (
    <Link href={href} className={clsx("block", className)}>
      <div className="bg-paper rounded-[16px] p-3.5 flex gap-3.5 items-center fms-press shadow-[var(--shadow-card)] group">
        {/* Circular icon tile */}
        <div className="w-11 h-11 rounded-full bg-accent-wash flex items-center justify-center text-[color:var(--accent-ink)] flex-shrink-0">
          <IconComp size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-ink leading-tight truncate">{title}</div>
          <div className="text-[12px] text-ink-3 mt-0.5 truncate">{subtitle}</div>
        </div>

        {/* Tag or chevron */}
        {tag ? (
          <Chip variant={tagVariant} size="sm" dot>{tag}</Chip>
        ) : (
          <ArrowRightIcon
            size={16}
            className="text-ink-3 flex-shrink-0 group-hover:text-[color:var(--accent)] group-hover:translate-x-0.5 transition-all"
          />
        )}
      </div>
    </Link>
  );
}
