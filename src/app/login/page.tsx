"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { ArrowRightIcon, LockIcon, BoltIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { getErrorMessage } from "@/lib/errors";

const DEMO_PASSWORD = "demo1234";
const DEMO_SUPPLIERS: Array<{ name: string; email: string; tag: string }> = [
  { name: "Raza",   email: "raza@findmyspare.test",   tag: "Engine & Drivetrain" },
  { name: "Ayman",  email: "ayman@findmyspare.test",  tag: "Body & Lighting" },
  { name: "Hamza",  email: "hamza@findmyspare.test",  tag: "Brakes & Suspension" },
  { name: "Danyal", email: "danyal@findmyspare.test", tag: "Electricals" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoBusy, setDemoBusy] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  async function doLogin(e: string, p: string) {
    const res = await authApi.login(e, p);
    setAuth({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      sessionId: res.sessionId,
    });
    router.push(getPostLoginPath(res.user));
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await doLogin(email, password);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to login. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (e: string) => {
    setError("");
    setDemoBusy(e);
    setEmail(e);
    setPassword(DEMO_PASSWORD);
    try {
      await doLogin(e, DEMO_PASSWORD);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Demo account not seeded yet"));
    } finally {
      setDemoBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold tracking-[-0.01em]">FindMySpare</span>
        </Link>

        <h1 className="serif text-[36px] leading-[1.05] mb-2">
          Welcome<br />back.
        </h1>
        <p className="text-ink-3 text-sm mb-6">
          Sign in to continue to your account.
        </p>

        {error && (
          <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
            <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
          </Card>
        )}

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

        <div className="mt-7">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-line" />
            <span className="mono text-[10px] tracking-[0.12em] text-ink-3 uppercase">
              Demo supplier accounts
            </span>
            <div className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_SUPPLIERS.map((s) => (
              <button
                key={s.email}
                type="button"
                onClick={() => handleDemo(s.email)}
                disabled={demoBusy !== null}
                className="p-3 rounded-[12px] bg-paper border border-line hover:border-accent/40 transition-colors text-left disabled:opacity-50 active:scale-[0.97]"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar initials={s.name.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-tight">{s.name}</div>
                    <div className="text-[10px] text-ink-3 truncate">{s.tag}</div>
                  </div>
                  {demoBusy === s.email ? (
                    <span className="ml-auto mono text-[10px] text-ink-3">…</span>
                  ) : (
                    <BoltIcon size={14} className="ml-auto text-accent-ink" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="text-[10px] text-ink-3 mt-2 mono tracking-[0.04em]">
            Click to sign in instantly · pwd: {DEMO_PASSWORD}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-ink-3">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent-ink font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-7 flex items-center gap-2 justify-center text-ink-3 text-[11px]">
          <LockIcon size={14} className="text-accent-ink" />
          <span className="mono tracking-[0.06em]">SSL · TRUSTED MARKETPLACE</span>
        </div>
      </div>
    </div>
  );
}
