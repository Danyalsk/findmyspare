"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";
import {
  PackageIcon,
  ShieldIcon,
  TrendIcon,
  ChatIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/lib/icons";

const BENEFITS = [
  { Icon: TrendIcon, title: "Live buyer demand", body: "Receive real part requests from verified buyers and quote on price, quality, and ETA." },
  { Icon: ChatIcon, title: "Direct contact", body: "Connect with buyers over chat and WhatsApp — no middle layer slowing the deal." },
  { Icon: ShieldIcon, title: "Trusted marketplace", body: "GST-verified, admin-reviewed suppliers only. Buyers trust who they're dealing with." },
  { Icon: PackageIcon, title: "Reach all of India", body: "Sell across 6,500+ pincodes from a single dashboard." },
];

const STEPS = [
  "Sign up with your email — one code, no passwords.",
  "Complete GST verification (we check it live).",
  "Go live and start quoting on buyer requests.",
];

export default function SellPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCta() {
    setError("");
    // Logged out → supplier OTP door.
    if (!isHydrated || !user) {
      router.push("/supplier-login");
      return;
    }
    // Already a supplier → their dashboard / onboarding.
    if (user.role === "supplier") {
      router.push(getPostLoginPath(user));
      return;
    }
    // Logged-in buyer → upgrade in place.
    setLoading(true);
    try {
      const { user: updated } = await authApi.becomeSupplier();
      const cur = useAuthStore.getState();
      if (cur.accessToken) {
        useAuthStore.getState().setAuth({
          user: updated,
          accessToken: cur.accessToken,
          refreshToken: cur.refreshToken ?? "",
          sessionId: cur.sessionId ?? "",
        });
      }
      router.push(updated.profileCompleted ? getPostLoginPath(updated) : "/complete-profile");
    } catch (err) {
      setError(getErrorMessage(err, "Could not switch to a supplier account."));
    } finally {
      setLoading(false);
    }
  }

  const ctaLabel =
    user?.role === "supplier" ? "Go to your dashboard" : "Become a supplier";

  return (
    <div className="min-h-dvh bg-paper-3 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[color:var(--line)] bg-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-paper font-bold text-[15px]">f</div>
            <span className="text-[15px] font-semibold tracking-tight text-ink">FindMySpare</span>
          </Link>
          <Link href="/login" className="text-[13px] font-semibold text-ink-2 hover:text-ink">Buyer login</Link>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8">
        {/* Hero */}
        <section className="py-14 sm:py-20 max-w-2xl">
          <div className="eyebrow mb-5 inline-flex items-center gap-2">
            <PackageIcon size={14} className="text-[color:var(--accent)]" /> For suppliers
          </div>
          <h1 className="h1 text-ink mb-5">
            Reach verified buyers.<br />
            <span className="text-ink-3">Sell parts across India.</span>
          </h1>
          <p className="text-[16px] text-ink-2 leading-relaxed mb-8">
            Join FindMySpare as a supplier and get live requests from buyers actively
            looking for the parts you stock. GST-verified, admin-reviewed, trusted.
          </p>

          {error && (
            <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent max-w-md">
              <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
            </Card>
          )}

          <div className="flex items-center gap-3">
            <Button variant="primary" size="lg" onClick={handleCta} disabled={loading}>
              {loading ? "Setting up…" : ctaLabel}
              {!loading && <ArrowRightIcon size={16} />}
            </Button>
            {!user && (
              <span className="text-[13px] text-ink-3">
                Already selling?{" "}
                <Link href="/supplier-login" className="font-semibold text-accent-ink">Supplier login</Link>
              </span>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className="pb-14 grid sm:grid-cols-2 gap-4">
          {BENEFITS.map(({ Icon, title, body }) => (
            <Card key={title} className="!p-5">
              <Icon size={20} className="text-[color:var(--accent)] mb-3" />
              <h3 className="text-[15px] font-semibold text-ink mb-1.5">{title}</h3>
              <p className="text-[14px] text-ink-2 leading-relaxed">{body}</p>
            </Card>
          ))}
        </section>

        {/* Steps */}
        <section className="pb-20 max-w-2xl">
          <h2 className="h2 mb-6">Three steps to go live.</h2>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-wash text-accent-ink flex items-center justify-center text-[12px] font-semibold mono">
                  {i + 1}
                </span>
                <span className="text-[15px] text-ink-2 leading-relaxed pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-center gap-2 text-[13px] text-ink-3">
            <CheckIcon size={15} className="text-[color:var(--accent)]" />
            No listing fee to get started.
          </div>
        </section>
      </main>
    </div>
  );
}
