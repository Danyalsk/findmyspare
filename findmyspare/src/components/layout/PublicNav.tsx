"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { SearchIcon, UserIcon, PinIcon } from "@/lib/icons";

export function PublicNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [q, setQ] = useState("");

  // Public pages (home, search, product) are the buyer-facing storefront.
  // Suppliers / admins should never land here — bounce them to their own
  // dashboard. Buyers and guests stay (browsing is their flow).
  useEffect(() => {
    if (!isHydrated || !user) return;
    if (user.role !== "buyer") {
      router.replace(getPostLoginPath(user));
    }
  }, [user, isHydrated, router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  }

  return (
    <>
      {/* Top promo strip — single hairline-divided line */}
      <div className="bg-ink text-paper text-[11.5px] py-2.5 px-5 border-b border-[color:var(--line)]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 opacity-80">
            <span className="serif italic">Verified suppliers · live across India</span>
            <span className="opacity-40">·</span>
            <span>Maruti · Hyundai · Tata · Mahindra · Honda · Toyota</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="opacity-80 hover:opacity-100 transition-opacity font-medium tracking-tight"
            >
              Become a supplier
            </Link>
            {!(isHydrated && user) && (
              <>
                <span className="opacity-30">·</span>
                <Link
                  href="/login"
                  className="opacity-80 hover:opacity-100 transition-opacity font-medium tracking-tight"
                >
                  Sign in →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header — clean white, hairline border */}
      <header className="sticky top-0 z-50 bg-paper border-b border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto px-5 h-[64px] flex items-center gap-5">
          {/* Logo — refined wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-paper serif text-[18px] leading-none">
              f
            </div>
            <span className="serif text-[18px] tracking-tight text-ink leading-none hidden sm:block">
              FindMySpare
            </span>
          </Link>

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-7 bg-[color:var(--line)]" />

          {/* Location — minimal text-only */}
          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 group text-left flex-shrink-0"
            aria-label="Change location"
          >
            <PinIcon size={14} className="text-[color:var(--accent)]" />
            <div className="leading-tight">
              <div className="eyebrow !text-[9px] text-ink-3">Deliver to</div>
              <div className="text-[12.5px] font-semibold text-ink tracking-tight">Mumbai 400001</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-ink-3 ml-0.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Search — refined */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="h-10 rounded-[8px] bg-paper-3 border border-[color:var(--line)] flex items-center px-3.5 gap-2.5 focus-within:border-[color:var(--accent)] focus-within:bg-paper transition-colors">
              <SearchIcon size={16} className="text-ink-3" />
              <input
                className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-ink-3"
                placeholder="Search bumpers, headlights, brake pads, OEM number…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <kbd className="hidden md:inline-flex items-center px-1.5 h-5 rounded text-[10px] mono text-ink-3 border border-[color:var(--line)] bg-paper">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Account */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <Link
                href={getPostLoginPath(user)}
                className="flex items-center gap-2 px-3 h-10 rounded-[8px] hover:bg-paper-2 transition-colors text-[13px] font-semibold"
              >
                <UserIcon size={15} />
                <span className="hidden sm:inline tracking-tight">
                  {user.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 h-10 flex items-center rounded-[8px] bg-[color:var(--accent)] text-white text-[13px] font-semibold tracking-tight hover:bg-[color:var(--accent-ink)] transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
