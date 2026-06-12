"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRightIcon } from "@/lib/icons";
import { getErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send reset link. Try again."));
    } finally {
      setLoading(false);
    }
  }

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
          Forgot your<br />password?
        </h1>
        <p className="text-ink-3 text-sm mb-6">
          We&apos;ll email a reset link if an account exists.
        </p>

        {sent ? (
          <Card variant="accent" className="!p-4">
            <p className="text-sm text-ink">
              If an account exists for <strong>{email}</strong>, a reset link is on its
              way. The link is valid for 1 hour.
            </p>
          </Card>
        ) : (
          <>
            {error && (
              <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
                <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
              </Card>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button variant="primary" block type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
                {!loading && <ArrowRightIcon size={16} />}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-sm text-ink-3">
          <Link href="/login" className="text-accent-ink font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
