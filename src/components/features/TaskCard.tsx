import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon, type IconProps } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   TaskCard — task list item from Supplier Dashboard
   Icon, title, subtitle, status tag or arrow
   ═══════════════════════════════════════════════════════ */

export interface TaskCardProps {
  icon: React.ComponentType<IconProps>;
  title: string;
  subtitle: string;
  tag?: string;
  tagVariant?: "warn" | "danger" | "ok" | "default";
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
    <Link href={href}>
      <Card className={clsx("!p-3 flex gap-3 items-center cursor-pointer hover:border-accent/40 transition-colors", className)}>
        {/* Icon pill */}
        <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center flex-shrink-0">
          <IconComp size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium leading-[1.2] truncate">{title}</div>
          <div className="text-[11px] text-ink-3 mt-0.5 truncate">{subtitle}</div>
        </div>

        {/* Tag or arrow */}
        {tag ? (
          <Chip variant={tagVariant}>{tag}</Chip>
        ) : (
          <ArrowRightIcon size={16} className="text-ink-3 flex-shrink-0" />
        )}
      </Card>
    </Link>
  );
}
