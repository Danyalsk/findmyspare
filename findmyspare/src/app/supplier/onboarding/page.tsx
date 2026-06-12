"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { supplierOnboardingApi, type OnboardingPayload } from "@/lib/api/supplier-onboarding";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, LockIcon } from "@/lib/icons";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;

// Reduce any Indian phone (E.164 "+9198…", "9198…", "098…", "98…") to the bare
// 10-digit local number the form + regex expect. Prefilled values come back as
// E.164 from the profile, so without this the untouched field fails validation.
function toLocal10(raw: string): string {
  const d = (raw || "").replace(/\D/g, "");
  let l = d;
  if (l.length === 12 && l.startsWith("91")) l = l.slice(2);
  if (l.length === 11 && l.startsWith("0")) l = l.slice(1);
  return l;
}

const fieldClass =
  "w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass =
  "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const access = useAuthStore((s) => s.accessToken);
  const refresh = useAuthStore((s) => s.refreshToken);
  const sid = useAuthStore((s) => s.sessionId);

  async function handleSignOut() {
    try {
      await authApi.logout();
    } catch {}
    logout();
    router.push("/");
  }

  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateField] = useState("");
  const [pincode, setPincode] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function fieldError(name: string): string | null {
    if (!touched[name]) return null;
    if (name === "gst" && gstNumber && !GST_RE.test(gstNumber.toUpperCase()))
      return "Invalid GSTIN (15 chars, e.g. 22ABCDE1234F1Z5)";
    if (name === "pan" && panNumber && !PAN_RE.test(panNumber.toUpperCase()))
      return "Invalid PAN (10 chars, e.g. ABCDE1234F)";
    if (name === "phone" && phone && !PHONE_RE.test(phone))
      return "Indian mobile: 10 digits starting with 6-9";
    if (name === "pincode" && pincode && !PIN_RE.test(pincode))
      return "Pincode must be 6 digits";
    return null;
  }

  function FieldErr({ name }: { name: string }) {
    const e = fieldError(name);
    if (!e) return null;
    return <div className="text-[11px] text-[color:var(--danger)] mt-1.5 font-medium">{e}</div>;
  }

  const isResubmit = user?.verificationStatus === "rejected";

  useEffect(() => {
    if (!user) return;
    if (user.businessName) setBusinessName(user.businessName);
    if (user.gstNumber) setGstNumber(user.gstNumber);
    if (user.panNumber) setPanNumber(user.panNumber);
    if (user.phone) setPhone(toLocal10(user.phone));
    if (user.businessAddress) {
      setLine1(user.businessAddress.line1 || "");
      setLine2(user.businessAddress.line2 || "");
      setCity(user.businessAddress.city || "");
      setStateField(user.businessAddress.state || "");
      setPincode(user.businessAddress.pincode || "");
    }
  }, [user]);

  const validate = (): string | null => {
    if (!businessName.trim()) return "Business name required";
    if (!GST_RE.test(gstNumber.toUpperCase())) return "Invalid GSTIN (15 chars)";
    if (!PAN_RE.test(panNumber.toUpperCase())) return "Invalid PAN (10 chars)";
    if (!PHONE_RE.test(toLocal10(phone))) return "Invalid Indian phone (10 digits, 6-9 prefix)";
    if (!line1.trim()) return "Address line 1 required";
    if (!city.trim()) return "City required";
    if (!state.trim()) return "State required";
    if (!PIN_RE.test(pincode)) return "Invalid pincode";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) return setError(err);

    setSubmitting(true);
    try {
      const payload: OnboardingPayload = {
        businessName: businessName.trim(),
        gstNumber: gstNumber.toUpperCase(),
        panNumber: panNumber.toUpperCase(),
        phone: toLocal10(phone),
        businessAddress: {
          line1: line1.trim(),
          line2: line2.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode,
        },
      };

      const res = isResubmit
        ? await supplierOnboardingApi.resubmit(payload)
        : await supplierOnboardingApi.submit(payload);

      // BetterAuth uses a single bearer token (refresh/sid are empty), so guard
      // on access only — otherwise the stored user never flips to "pending" and
      // the app keeps treating the supplier as a new onboarding.
      if (access) {
        setAuth({ user: res.user, accessToken: access, refreshToken: refresh ?? "", sessionId: sid ?? "" });
      }
      toast.success("Submitted for review");
      router.replace("/supplier/pending");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Submission failed. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center p-6">
      <div className="w-full max-w-[480px] py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
              f
            </div>
            <span className="font-semibold tracking-[-0.01em]">FindMySpare</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px] font-semibold">
            <Link href="/" className="text-ink-2 hover:text-ink">Home</Link>
            <button type="button" onClick={handleSignOut} className="text-ink-3 hover:text-ink">
              Sign out
            </button>
          </div>
        </div>

        <h1 className="serif text-[36px] leading-[1.05] mb-2">
          Verify your<br />business.
        </h1>
        <p className="text-ink-3 text-sm mb-6">
          {isResubmit
            ? "Update your details and resubmit."
            : "Provide GST and business details. Admin reviews within 24 hours."}
        </p>

        {isResubmit && user?.rejectionReason && (
          <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
            <div className="text-xs mono uppercase tracking-[0.06em] text-[oklch(0.45_0.15_25)] mb-1">
              Previous rejection
            </div>
            <div className="text-sm text-[oklch(0.45_0.15_25)]">{user.rejectionReason}</div>
          </Card>
        )}

        {error && (
          <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
            <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Business name</label>
            <input className={fieldClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>GSTIN</label>
            <input className={fieldClass} placeholder="22ABCDE1234F1Z5" maxLength={15}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              onBlur={() => setTouched((t) => ({ ...t, gst: true }))}
            />
            <FieldErr name="gst" />
          </div>
          <div>
            <label className={labelClass}>PAN</label>
            <input className={fieldClass} placeholder="ABCDE1234F" maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              onBlur={() => setTouched((t) => ({ ...t, pan: true }))}
            />
            <FieldErr name="pan" />
          </div>
          <div>
            <label className={labelClass}>Phone (WhatsApp)</label>
            <input className={fieldClass} placeholder="9876543210" maxLength={10} inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            />
            <FieldErr name="phone" />
          </div>

          <div>
            <label className={labelClass}>Address line 1</label>
            <input className={fieldClass} value={line1} onChange={(e) => setLine1(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Address line 2 (optional)</label>
            <input className={fieldClass} value={line2} onChange={(e) => setLine2(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City</label>
              <input className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input className={fieldClass} value={state} onChange={(e) => setStateField(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Pincode</label>
            <input className={fieldClass} placeholder="560001" maxLength={6} inputMode="numeric"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              onBlur={() => setTouched((t) => ({ ...t, pincode: true }))}
            />
            <FieldErr name="pincode" />
          </div>

          <Button variant="primary" block type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : isResubmit ? "Resubmit for review" : "Submit for verification"}
            {!submitting && <ArrowRightIcon size={16} />}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-2 justify-center text-ink-3 text-[11px]">
          <LockIcon size={14} className="text-accent-ink" />
          <span className="mono tracking-[0.06em]">Encrypted · Reviewed by admin only</span>
        </div>
      </div>
    </div>
  );
}
