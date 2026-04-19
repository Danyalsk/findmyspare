"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowRightIcon, LockIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   Login — restyled with new design system
   Auth logic preserved from original implementation
   ═══════════════════════════════════════════════════════ */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setAuth(res.user, res.token);

      if (res.user.role === "supplier") {
        router.push("/supplier");
      } else {
        router.push("/buyer");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold tracking-[-0.01em]">FindMySpare</span>
        </div>

        {/* Title */}
        <h1 className="serif text-[36px] leading-[1.05] mb-2">
          Welcome<br />back.
        </h1>
        <p className="text-ink-3 text-sm mb-8">
          Sign in to continue to your account.
        </p>

        {/* Error */}
        {error && (
          <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
            <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button variant="primary" block type="submit" disabled={loading}>
            {loading ? "Authenticating…" : "Sign in"}
            {!loading && <ArrowRightIcon size={16} />}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-ink-3">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent-ink font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>

        {/* Trust footer */}
        <div className="mt-8 flex items-center gap-2 justify-center text-ink-3 text-[11px]">
          <LockIcon size={14} className="text-accent-ink" />
          <span className="mono tracking-[0.06em]">
            SSL · ESCROW PROTECTED
          </span>
        </div>
      </div>
    </div>
  );
}
