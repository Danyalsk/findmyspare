"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { authApi } from "@/lib/api";
import { ArrowRightIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeIN(raw: string): string | null {
  const d = raw.replace(/[^\d]/g, "");
  let local = d;
  if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
  if (local.length === 11 && local.startsWith("0")) local = local.slice(1);
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}

// Strictly-required, one-time profile form. The role is NOT chosen here — it
// comes from how the account was created (buyer via /login, supplier via the
// supplier door). Buyers must give city+pincode; suppliers only name+phone
// (business/GST details are collected later at /supplier/onboarding).
export default function CompleteProfilePage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const isSupplier = user?.role === "supplier";
  // Email signups have no phone yet → phone is required. Phone signups (rare)
  // already have a phone, so we ask for an email instead.
  const needsPhone = !!user && !user.phone;

  const [name, setName] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.profileCompleted) {
      router.replace(getPostLoginPath(user));
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user || user.profileCompleted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    const payload: Parameters<typeof authApi.completeProfile>[0] = { name: name.trim() };

    if (needsPhone) {
      const p = normalizeIN(otherContact);
      if (!p) {
        setError("Enter a valid Indian mobile number.");
        return;
      }
      payload.phone = p;
    } else if (otherContact.trim()) {
      if (!EMAIL_RE.test(otherContact.trim())) {
        setError("Enter a valid email.");
        return;
      }
      payload.email = otherContact.trim();
    }

    // City + pincode are required for buyers only.
    if (!isSupplier) {
      if (city.trim().length < 2) {
        setError("Enter your city.");
        return;
      }
      if (!/^\d{6}$/.test(pincode.trim())) {
        setError("Enter a valid 6-digit pincode.");
        return;
      }
      payload.city = city.trim();
      payload.pincode = pincode.trim();
    }

    setLoading(true);
    try {
      const { user: updated } = await authApi.completeProfile(payload);
      const current = useAuthStore.getState();
      if (current.accessToken) {
        setAuth({
          user: updated,
          accessToken: current.accessToken,
          refreshToken: current.refreshToken ?? "",
          sessionId: current.sessionId ?? "",
        });
      }
      router.push(getPostLoginPath(updated as User));
    } catch (err) {
      setError(getErrorMessage(err, "Could not save profile."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-paper-3 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[420px]">
        {error && (
          <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
            <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
          </Card>
        )}
        <div className="eyebrow mb-3">{isSupplier ? "Supplier account" : "One last step"}</div>
        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-ink mb-2 leading-tight">
          Complete your profile
        </h1>
        <p className="text-[14px] text-ink-3 mb-7">
          {isSupplier
            ? "A couple of details, then we'll set up your GST verification."
            : "We need a few details before you can continue."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" value={name} onChange={setName} placeholder="Danyal Kumar" required />

          <Field
            label={needsPhone ? "Mobile number" : "Email"}
            value={otherContact}
            onChange={setOtherContact}
            placeholder={needsPhone ? "98765 43210" : "you@example.com"}
            required={needsPhone}
          />

          {!isSupplier && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={city} onChange={setCity} placeholder="Mumbai" required />
              <Field label="Pincode" value={pincode} onChange={(v) => setPincode(v.replace(/\D/g, "").slice(0, 6))} placeholder="400001" required />
            </div>
          )}

          <Button variant="primary" block size="lg" type="submit" disabled={loading}>
            {loading ? "Saving…" : isSupplier ? "Continue to onboarding" : "Continue"}
            {!loading && <ArrowRightIcon size={16} />}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase">
        {props.label}
      </label>
      <input
        type="text"
        required={props.required}
        className="w-full h-12 px-3.5 rounded-[12px] bg-paper border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}
