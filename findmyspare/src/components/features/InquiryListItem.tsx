import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRightIcon, ClockIcon, PinIcon, PackageIcon } from "@/lib/icons";
import { Chip } from "@/components/ui/Chip";
import type { Inquiry } from "@/lib/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export interface InquiryListItemProps {
  inquiry: Inquiry;
  href?: string;
}

export function InquiryListItem({ inquiry, href }: InquiryListItemProps) {
  const bids = inquiry.bidCount || 0;
  const isNew = bids === 0;
  const target = href ?? `/supplier/leads/${inquiry.id}`;

  return (
    <Link href={target} className="block group">
      <article
        className={clsx(
          "bg-paper rounded-[18px] p-4 sm:p-5",
          "shadow-[var(--shadow-card)] fms-press",
          "transition-all duration-200",
          "group-hover:shadow-[var(--shadow-lifted)]",
          isNew && "ring-2 ring-[color:var(--accent)]/30"
        )}
      >
        {/* Status row */}
        <div className="flex items-center justify-between gap-2">
          <Chip variant={isNew ? "accent" : "default"} size="sm" dot>
            {isNew ? "New inquiry" : `${bids} active quote${bids !== 1 ? "s" : ""}`}
          </Chip>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-3">
            <ClockIcon size={12} />
            {timeAgo(inquiry.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="display text-[18px] text-ink mt-3 leading-tight truncate">
          {inquiry.partName}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-ink-2 mt-1.5 line-clamp-2 leading-snug">
          {inquiry.description ||
            "Buyer is sourcing this part — submit your best quote to get noticed."}
        </p>

        {/* Meta row + CTA */}
        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-paper-3 text-[11px] font-bold text-ink-2">
              <PinIcon size={11} className="text-[color:var(--accent)]" />
              {inquiry.make} {inquiry.model}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-paper-3 text-[11px] font-bold text-ink-2">
              <PackageIcon size={11} className="text-[color:var(--accent)]" />
              {inquiry.year}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-3 h-8 rounded-full bg-[color:var(--accent)] text-white text-[12px] font-bold">
            Place quote
            <ArrowRightIcon
              size={12}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </article>
    </Link>
  );
}
