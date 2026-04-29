"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supplierOnboardingApi, uploadFile, type OnboardingPayload } from "@/lib/api/supplier-onboarding";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, LockIcon } from "@/lib/icons";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;
const MAX_FILE = 5 * 1024 * 1024;

const fieldClass =
  "w-full h-12 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass =
  "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const access = useAuthStore((s) => s.accessToken);
  const refresh = useAuthStore((s) => s.refreshToken);
  const sid = useAuthStore((s) => s.sessionId);

  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateField] = useState("");
  const [pincode, setPincode] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [existingCertUrl, setExistingCertUrl] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isResubmit = user?.verificationStatus === "rejected";

  useEffect(() => {
    if (!user) return;
    if (user.businessName) setBusinessName(user.businessName);
    if (user.gstNumber) setGstNumber(user.gstNumber);
    if (user.panNumber) setPanNumber(user.panNumber);
    if (user.phone) setPhone(user.phone);
    if (user.gstCertificateUrl) setExistingCertUrl(user.gstCertificateUrl);
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
    if (!PHONE_RE.test(phone)) return "Invalid Indian phone (10 digits, 6-9 prefix)";
    if (!line1.trim()) return "Address line 1 required";
    if (!city.trim()) return "City required";
    if (!state.trim()) return "State required";
    if (!PIN_RE.test(pincode)) return "Invalid pincode";
    if (!certFile && !existingCertUrl) return "GST certificate required";
    if (certFile && certFile.size > MAX_FILE) return "Certificate must be ≤5MB";
    if (
      certFile &&
      !["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(certFile.type)
    )
      return "Certificate must be PDF or image";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) return setError(err);

    setSubmitting(true);
    try {
      let certUrl = existingCertUrl || "";
      if (certFile) {
        const up = await uploadFile(certFile, "gst_cert");
        certUrl = up.url;
      }

      const payload: OnboardingPayload = {
        businessName: businessName.trim(),
        gstNumber: gstNumber.toUpperCase(),
        panNumber: panNumber.toUpperCase(),
        phone,
        gstCertificateUrl: certUrl,
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

      if (access && refresh && sid) {
        setAuth({ user: res.user, accessToken: access, refreshToken: refresh, sessionId: sid });
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
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold tracking-[-0.01em]">FindMySpare</span>
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
            />
          </div>
          <div>
            <label className={labelClass}>PAN</label>
            <input className={fieldClass} placeholder="ABCDE1234F" maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className={labelClass}>Phone (WhatsApp)</label>
            <input className={fieldClass} placeholder="9876543210" maxLength={10} inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            />
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
            />
          </div>

          <div>
            <label className={labelClass}>GST certificate (PDF or image, ≤5MB)</label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-3 file:mr-3 file:py-2.5 file:px-4 file:rounded-[10px] file:border-0 file:bg-paper-2 file:text-ink file:cursor-pointer hover:file:bg-paper-3"
            />
            {existingCertUrl && !certFile && (
              <a
                href={existingCertUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent-ink hover:underline mt-2 inline-block"
              >
                View previously uploaded certificate
              </a>
            )}
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
