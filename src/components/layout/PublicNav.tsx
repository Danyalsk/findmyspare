"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { SearchIcon, BoltIcon, UserIcon } from "@/lib/icons";

export function PublicNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  }

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-ink text-paper text-[12px] py-2 px-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BoltIcon size={14} className="text-accent" />
            <span className="opacity-90">
              Are you a parts supplier? Reach thousands of buyers across India.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="font-semibold hover:text-accent"
            >
              Become a supplier
            </Link>
            <span className="opacity-30">|</span>
            <Link
              href="/login"
              className="opacity-90 hover:text-accent"
            >
              Already a supplier? Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
              f
            </div>
            <span className="font-semibold text-ink tracking-[-0.01em] text-[15px] hidden sm:block">
              FindMySpare
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="h-10 rounded-[12px] bg-paper-2 border border-line flex items-center px-3 gap-2.5 focus-within:border-accent">
              <SearchIcon size={18} className="text-ink-3" />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Search parts, vehicles, brands…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <Link
                href={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "supplier"
                    ? "/supplier"
                    : "/buyer"
                }
                className="flex items-center gap-2 px-3 h-10 rounded-[10px] bg-paper-2 border border-line hover:bg-paper-3 transition-colors text-[13px] font-medium"
              >
                <UserIcon size={16} />
                <span className="hidden sm:inline">{user.name?.split(" ")[0] || "Account"}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 h-10 hidden sm:flex items-center rounded-[10px] hover:bg-paper-2 text-[13px] font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 h-10 flex items-center rounded-[10px] bg-ink text-paper text-[13px] font-medium hover:opacity-90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
