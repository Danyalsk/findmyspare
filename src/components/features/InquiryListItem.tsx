import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRightIcon, ClockIcon, PinIcon, PackageIcon } from "@/lib/icons";
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
          "bg-paper border border-line rounded-[18px] p-5",
          "transition-all duration-200",
          "group-hover:border-ink/15 group-hover:-translate-y-0.5",
          "group-hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        )}
      >
        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold",
              isNew
                ? "bg-accent-wash text-accent-ink"
                : "bg-paper-2 text-ink-2 border border-line"
            )}
          >
            {isNew ? "New Inquiry" : `${bids} Active Bid${bids !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-semibold text-ink mt-2.5 leading-[1.2] truncate">
          {inquiry.partName}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-ink-3 mt-1.5 line-clamp-2 leading-[1.5]">
          {inquiry.description ||
            `Buyer is sourcing this part — submit your best bid to get noticed.`}
        </p>

        {/* Meta row + CTA */}
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap text-ink-2">
            <span className="inline-flex items-center gap-1.5 text-[12px]">
              <ClockIcon size={14} className="text-ink-3" />
              {timeAgo(inquiry.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px]">
              <PinIcon size={14} className="text-ink-3" />
              {inquiry.make} {inquiry.model}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px]">
              <PackageIcon size={14} className="text-ink-3" />
              {inquiry.year}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-ink whitespace-nowrap">
            View bid
            <ArrowRightIcon
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </article>
    </Link>
  );
}
