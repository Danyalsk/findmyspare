"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { OtpAuth } from "@/components/auth/OtpAuth";
import type { AuthResponse } from "@/lib/api/auth";
import { ShieldIcon, ArrowRightIcon } from "@/lib/icons";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const existingUser = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Already signed in → route to the right place. Incomplete profiles go to the
  // strict completion form; everyone else to their dashboard.
  useEffect(() => {
    if (isHydrated && existingUser) {
      router.replace(
        existingUser.profileCompleted ? getPostLoginPath(existingUser) : "/complete-profile"
      );
    }
  }, [isHydrated, existingUser, router]);

  function handleVerified(res: AuthResponse) {
    setAuth({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      sessionId: res.sessionId,
    });
    // New / incomplete accounts MUST finish the profile form before any access.
    if (res.isNewUser || !res.user.profileCompleted) {
      router.push("/complete-profile");
    } else {
      router.push(getPostLoginPath(res.user));
    }
  }

  return (
    <div className="min-h-dvh bg-paper-3 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[color:var(--line)] bg-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-paper font-bold text-[15px]">f</div>
            <span className="text-[15px] font-semibold tracking-tight text-ink">FindMySpare</span>
          </Link>
          <Link href="/" className="text-[13px] font-semibold text-ink-2 hover:text-ink">Back to home</Link>
        </div>
      </div>

      {/* Body — responsive: split on desktop, stacked on mobile */}
      <main className="flex-1 grid lg:grid-cols-2 max-w-6xl w-full mx-auto">
        {/* Left: value prop (desktop only) */}
        <div className="hidden lg:flex flex-col justify-center px-12 py-16">
          <div className="eyebrow mb-5">India · Auto parts marketplace</div>
          <h1 className="h1 text-ink mb-5">
            One code.<br />
            <span className="text-ink-3">No passwords.</span>
          </h1>
          <p className="text-[15px] text-ink-2 leading-relaxed max-w-md">
            Sign in with your email. We send a 6-digit code — that&apos;s it.
            Browse verified suppliers, post requests, get live quotes.
          </p>
          <div className="mt-8 flex items-center gap-2 text-[12px] text-ink-3">
            <ShieldIcon size={14} className="text-[color:var(--accent)]" />
            <span>OTP-secured · sessions auto-revoke on suspicious activity</span>
          </div>
        </div>

        {/* Right: the form card */}
        <div className="flex flex-col items-center justify-center px-5 sm:px-8 py-10 sm:py-16">
          <OtpAuth onVerified={handleVerified} />

          {/* Supplier login */}
          <div className="w-full max-w-[400px] mt-8 pt-6 border-t border-line">
            <Link
              href="/supplier-login"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] bg-paper border border-line hover:border-accent transition-colors group"
            >
              <span className="text-[13px] text-ink-2">
                <strong className="text-ink">Are you a supplier?</strong> Sign in to your account.
              </span>
              <span className="flex items-center gap-1 text-[13px] font-semibold text-accent-ink whitespace-nowrap">
                Supplier login
                <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Become a supplier */}
          <div className="w-full max-w-[400px] mt-3">
            <Link
              href="/sell"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12px] text-ink-3 hover:text-ink transition-colors"
            >
              New here? <strong className="text-ink-2">Join as a supplier</strong>
              <ArrowRightIcon size={12} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
