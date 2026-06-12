"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRightIcon } from "@/lib/icons";
import { getErrorMessage } from "@/lib/errors";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset password. The link may have expired."));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Card variant="accent" className="!p-4 !bg-danger-wash !border-transparent">
        <p className="text-sm text-[oklch(0.45_0.15_25)]">
          Missing reset token. Open the link from your email again.
        </p>
      </Card>
    );
  }

  if (done) {
    return (
      <Card variant="accent" className="!p-4">
        <p className="text-sm text-ink">
          Password updated. Redirecting to sign in…
        </p>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase">
            New password
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
        <div>
          <label className="block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase">
            Confirm password
          </label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button variant="primary" block type="submit" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
          {!loading && <ArrowRightIcon size={16} />}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold tracking-[-0.01em]">FindMySpare</span>
        </div>

        <h1 className="serif text-[36px] leading-[1.05] mb-2">
          Reset your<br />password.
        </h1>
        <p className="text-ink-3 text-sm mb-6">
          Choose a new password. You&apos;ll be signed out everywhere.
        </p>

        <Suspense fallback={<div className="text-sm text-ink-3">Loading…</div>}>
          <ResetPasswordInner />
        </Suspense>

        <div className="mt-6 text-center text-sm text-ink-3">
          <Link href="/login" className="text-accent-ink font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
