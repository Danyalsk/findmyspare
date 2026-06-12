"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"working" | "ok" | "error">("working");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Missing token. Open the link from your email again.");
      return;
    }
    if (ran.current) return;
    ran.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState("ok"))
      .catch((err) => {
        setError(getErrorMessage(err, "Verification link is invalid or expired."));
        setState("error");
      });
  }, [token]);

  if (state === "working") {
    return <p className="text-sm text-ink-3">Verifying your email…</p>;
  }
  if (state === "ok") {
    return (
      <Card variant="accent" className="!p-4">
        <p className="text-sm text-ink">
          Email verified. You can now use every feature of your account.
        </p>
      </Card>
    );
  }
  return (
    <Card variant="accent" className="!p-3 !bg-danger-wash !border-transparent">
      <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
    </Card>
  );
}

export default function VerifyEmailPage() {
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
          Verify your<br />email.
        </h1>

        <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
          <VerifyEmailInner />
        </Suspense>

        <div className="mt-6 text-center text-sm text-ink-3">
          <Link href="/login" className="text-accent-ink font-medium hover:underline">
            Continue to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
