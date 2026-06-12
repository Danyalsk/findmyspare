"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { authApi } from "@/lib/api";
import { OtpAuth } from "@/components/auth/OtpAuth";
import type { AuthResponse } from "@/lib/api/auth";
import { PackageIcon, ShieldIcon, ArrowRightIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

// Supplier-branded OTP door. Lives at top level (NOT under /supplier/*, which is
// gated by SupplierLayout). After verify it tags the account role=supplier and
// routes into onboarding.
export default function SupplierLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const existingUser = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [error, setError] = useState("");

  // Already a signed-in supplier → straight to the dashboard/onboarding.
  useEffect(() => {
    if (isHydrated && existingUser && existingUser.role === "supplier") {
      router.replace(
        existingUser.profileCompleted ? getPostLoginPath(existingUser) : "/complete-profile"
      );
    }
  }, [isHydrated, existingUser, router]);

  async function handleVerified(res: AuthResponse) {
    setAuth({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      sessionId: res.sessionId,
    });
    try {
      const { user } = await authApi.becomeSupplier();
      const cur = useAuthStore.getState();
      setAuth({
        user,
        accessToken: cur.accessToken ?? res.accessToken,
        refreshToken: cur.refreshToken ?? "",
        sessionId: cur.sessionId ?? "",
      });
      router.push(user.profileCompleted ? getPostLoginPath(user) : "/complete-profile");
    } catch (err) {
      // e.g. 409 active orders, or admin account.
      setError(getErrorMessage(err, "Could not switch to a supplier account."));
    }
  }

  return (
    <div className="min-h-dvh bg-paper-3 flex flex-col">
      <div className="border-b border-[color:var(--line)] bg-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-paper font-bold text-[15px]">f</div>
            <span className="text-[15px] font-semibold tracking-tight text-ink">FindMySpare</span>
          </Link>
          <Link href="/sell" className="text-[13px] font-semibold text-ink-2 hover:text-ink">Why sell with us?</Link>
        </div>
      </div>

      <main className="flex-1 grid lg:grid-cols-2 max-w-6xl w-full mx-auto">
        <div className="hidden lg:flex flex-col justify-center px-12 py-16">
          <div className="eyebrow mb-5 inline-flex items-center gap-2">
            <PackageIcon size={14} className="text-[color:var(--accent)]" /> For suppliers
          </div>
          <h1 className="h1 text-ink mb-5">
            Sell to verified<br />
            <span className="text-ink-3">buyers across India.</span>
          </h1>
          <p className="text-[15px] text-ink-2 leading-relaxed max-w-md">
            Create your supplier account with a single code, then complete GST
            verification to start receiving live buyer requests.
          </p>
          <div className="mt-8 flex items-center gap-2 text-[12px] text-ink-3">
            <ShieldIcon size={14} className="text-[color:var(--accent)]" />
            <span>GST-verified suppliers only · admin-reviewed before going live</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-5 sm:px-8 py-10 sm:py-16">
          {error && (
            <Card variant="accent" className="w-full max-w-[400px] !p-3 mb-5 !bg-danger-wash !border-transparent">
              <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
            </Card>
          )}
          <OtpAuth onVerified={handleVerified} />

          <div className="w-full max-w-[400px] mt-8 pt-6 border-t border-line">
            <Link
              href="/login"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] bg-paper border border-line hover:border-accent transition-colors group"
            >
              <span className="text-[13px] text-ink-2">
                <strong className="text-ink">Looking to buy?</strong> Sign in as a buyer.
              </span>
              <span className="flex items-center gap-1 text-[13px] font-semibold text-accent-ink whitespace-nowrap">
                Buyer login
                <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
