"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

function MagicInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const setAuth = useAuthStore((s) => s.setAuth);
  const [state, setState] = useState<"working" | "error">("working");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Missing login token. Open the link from your email again.");
      return;
    }
    if (ran.current) return;
    ran.current = true;
    authApi
      .magicLogin(token)
      .then((res) => {
        setAuth({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          sessionId: res.sessionId,
        });
        router.replace(getPostLoginPath(res.user));
      })
      .catch((e) => {
        setError(getErrorMessage(e, "This login link is invalid or expired."));
        setState("error");
      });
  }, [token, router, setAuth]);

  if (state === "working") {
    return <p className="text-sm text-ink-3">Signing you in…</p>;
  }
  return (
    <>
      <Card variant="accent" className="!p-3 mb-4 !bg-danger-wash !border-transparent">
        <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
      </Card>
      <Link href="/login" className="text-accent-ink font-medium hover:underline text-sm">
        Sign in with a code instead
      </Link>
    </>
  );
}

export default function MagicLoginPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold tracking-[-0.01em]">FindMySpare</span>
        </div>
        <h1 className="serif text-[32px] leading-[1.05] mb-6">Welcome back.</h1>
        <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
          <MagicInner />
        </Suspense>
      </div>
    </div>
  );
}
