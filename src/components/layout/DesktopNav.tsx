"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  SearchIcon,
  PackageIcon,
  UserIcon,
  BoltIcon,
} from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   DesktopNav — top navigation for desktop viewports
   Restyled to match FMS Design Prototype language
   ═══════════════════════════════════════════════════════ */

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex sticky top-0 z-[100] bg-paper/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold text-ink tracking-[-0.01em] text-[15px] group-hover:text-accent-ink transition-colors">
            FindMySpare
          </span>
        </Link>

        {/* Primary Links */}
        <div className="flex items-center gap-8 ml-10">
          <Link
            href="/buyer/search"
            className={clsx(
              "flex items-center gap-1.5 text-[13px] font-medium transition-colors",
              pathname.startsWith("/buyer/search")
                ? "text-accent-ink"
                : "text-ink-3 hover:text-ink"
            )}
          >
            <SearchIcon size={16} />
            Browse Parts
          </Link>
          <Link
            href="/buyer/requests"
            className={clsx(
              "text-[13px] font-medium transition-colors",
              pathname.startsWith("/buyer/requests")
                ? "text-accent-ink"
                : "text-ink-3 hover:text-ink"
            )}
          >
            Post Request
          </Link>
          <Link
            href="/buyer/orders"
            className={clsx(
              "text-[13px] font-medium transition-colors",
              pathname.startsWith("/buyer/orders")
                ? "text-accent-ink"
                : "text-ink-3 hover:text-ink"
            )}
          >
            Orders
          </Link>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/supplier"
            className={clsx(
              "hidden lg:flex items-center gap-2",
              "px-4 py-2 rounded-full",
              "bg-accent-wash border border-transparent",
              "text-accent-ink text-[11px] font-medium tracking-[0.08em] uppercase",
              "hover:opacity-90 transition-all"
            )}
          >
            <BoltIcon size={14} />
            Supplier Portal
          </Link>

          <div className="w-px h-6 bg-line mx-1" />

          <Link
            href="/buyer/orders"
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-3 hover:text-ink hover:bg-paper-2 transition-all"
          >
            <PackageIcon size={18} />
          </Link>

          <Link
            href="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-3 hover:text-ink hover:bg-paper-2 transition-all"
          >
            <UserIcon size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
