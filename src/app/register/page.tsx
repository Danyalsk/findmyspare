"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowRightIcon, LockIcon, SearchIcon, PackageIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/* ═══════════════════════════════════════════════════════
   Register — restyled with new design system
   Auth logic preserved from original implementation
   ═══════════════════════════════════════════════════════ */

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "supplier">("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      setAuth(res.user, res.token);

      if (res.user.role === "supplier") {
        router.push("/supplier");
      } else {
        router.push("/buyer");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
          Create your<br />account.
        </h1>
        <p className="text-ink-3 text-sm mb-6">
          Join as a buyer or supplier.
        </p>

        {/* Error */}
        {error && (
          <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
            <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
          </Card>
        )}

        {/* Role toggle */}
        <div className="flex bg-paper-2 rounded-[12px] p-[3px] border border-line mb-6">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-medium transition-all ${
              role === "buyer"
                ? "bg-paper text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            <SearchIcon size={16} />
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole("supplier")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-medium transition-all ${
              role === "supplier"
                ? "bg-paper text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            <PackageIcon size={16} />
            Supplier
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase">
              Full name
            </label>
            <input
              type="text"
              required
              className="w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Danyal Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              minLength={8}
              className="w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button variant="primary" block type="submit" disabled={loading}>
            {loading
              ? "Creating account…"
              : role === "supplier"
              ? "Register as Supplier"
              : "Register as Buyer"}
            {!loading && <ArrowRightIcon size={16} />}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-ink-3">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-ink font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust */}
        <div className="mt-8 flex items-center gap-2 justify-center text-ink-3 text-[11px]">
          <LockIcon size={14} className="text-accent-ink" />
          <span className="mono tracking-[0.06em]">SSL · ESCROW PROTECTED</span>
        </div>
      </div>
    </div>
  );
}
