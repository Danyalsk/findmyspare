"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import type { AuthResponse } from "@/lib/api/auth";
import { ArrowRightIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "identifier" | "code";

// Shared two-step email-OTP form (enter email → enter 6-digit code). Used by the
// buyer login (/login) and the supplier login (/supplier-login). The surrounding
// page owns the layout + marketing copy and decides what happens after verify via
// `onVerified` (e.g. setAuth + routing, or upgrading the account to supplier).
export function OtpAuth({ onVerified }: { onVerified: (res: AuthResponse) => void | Promise<void> }) {
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0); // seconds until "Resend" re-enables

  // Tick the resend cooldown down once per second.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const raw = identifier.trim();
    if (!EMAIL_RE.test(raw)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.requestOtp(raw);
      setIdentifier(res.identifier);
      setStep("code");
      setCooldown(30); // start the resend cooldown
    } catch (err) {
      setError(getErrorMessage(err, "Could not send code. Try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(identifier, code);
      await onVerified(res);
    } catch (err) {
      setError(getErrorMessage(err, "Incorrect or expired code."));
      setLoading(false);
    }
    // On success we leave `loading` true — the page navigates away.
  }

  return (
    <div className="w-full max-w-[400px]">
      {error && (
        <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      {step === "identifier" && (
        <>
          <div className="eyebrow mb-4">Sign in or sign up</div>
          <h2 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-ink mb-2 leading-tight">
            Enter your email
          </h2>
          <p className="text-[14px] text-ink-3 mb-7">We&apos;ll send a 6-digit code to verify.</p>
          <form onSubmit={handleRequest} className="space-y-4">
            <input
              type="email"
              inputMode="email"
              autoFocus
              required
              className="w-full h-[52px] px-4 rounded-[12px] bg-paper border border-line text-[15px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <Button variant="primary" block size="lg" type="submit" disabled={loading}>
              {loading ? "Sending code…" : "Send code"}
              {!loading && <ArrowRightIcon size={16} />}
            </Button>
          </form>
        </>
      )}

      {step === "code" && (
        <>
          <button
            type="button"
            onClick={() => { setStep("identifier"); setCode(""); setError(""); }}
            className="text-[13px] text-ink-3 hover:text-ink mb-4"
          >
            ← Change email
          </button>
          <h2 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-ink mb-2 leading-tight">
            Enter the code
          </h2>
          <p className="text-[14px] text-ink-3 mb-7">
            Sent to <strong className="text-ink">{identifier}</strong>
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              maxLength={6}
              className="w-full h-14 px-4 rounded-[12px] bg-paper border border-line text-[24px] tracking-[0.4em] text-center font-semibold text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            />
            <Button variant="primary" block size="lg" type="submit" disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Verify & continue"}
              {!loading && <ArrowRightIcon size={16} />}
            </Button>
            <button
              type="button"
              onClick={() => handleRequest(new Event("submit") as unknown as React.FormEvent)}
              disabled={loading || cooldown > 0}
              className="w-full text-[12px] text-ink-3 hover:text-ink py-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cooldown > 0
                ? `Resend code in 0:${String(cooldown).padStart(2, "0")}`
                : "Didn't get it? Resend code"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
