"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackIcon, PackageIcon, BoltIcon, ShieldIcon, CheckIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { DnaLoader } from "@/components/ui/DnaLoader";
import { vehicleData } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { inquiriesApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export default function NewRequestPage() {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [partName, setPartName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const makes = Object.keys(vehicleData);
  const models = make ? Object.keys(vehicleData[make] || {}) : [];
  const years = make && model ? vehicleData[make]?.[model] || [] : [];

  const isValid = make && model && year && partName.trim().length >= 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await inquiriesApi.create({
        partName: partName.trim(),
        make,
        model,
        year,
        description: description.trim() || undefined,
      });
      toast.success("Inquiry posted.");
      router.push("/buyer/requests");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to post inquiry."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden bg-paper-3 pb-28 md:pb-8">
      {loading && <DnaLoader fullscreen size={80} label="POSTING INQUIRY…" />}

      {/* Hero header */}
      <div className="relative overflow-hidden bg-paper rounded-b-[24px] shadow-[var(--shadow-card)]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(500px 220px at 100% 0%, rgba(252,128,25,0.16) 0%, rgba(252,128,25,0) 60%)",
          }}
        />
        <div className="relative px-5 pt-4 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/buyer/requests"
              className="w-10 h-10 rounded-full bg-paper-2 hover:bg-paper-3 flex items-center justify-center flex-shrink-0 fms-press"
              aria-label="Back"
            >
              <BackIcon size={18} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
                Step 1 of 1
              </div>
              <div className="display text-[22px] leading-tight text-ink mt-0.5">
                Post a request
              </div>
            </div>
          </div>
          <p className="text-[13px] text-ink-2 leading-snug">
            Tell us the part and your car. Verified suppliers will quote within minutes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-5 flex flex-col gap-4">
        {/* Vehicle */}
        <FormCard
          eyebrow="VEHICLE"
          title="What car are you fixing?"
          icon={<PackageIcon size={18} />}
        >
          <Field label="Make" required>
            <SelectFancy
              value={make}
              onChange={(v) => {
                setMake(v);
                setModel("");
                setYear("");
              }}
              placeholder="Select make"
              options={makes}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Model" required>
              <SelectFancy
                value={model}
                onChange={(v) => {
                  setModel(v);
                  setYear("");
                }}
                placeholder="Model"
                options={models}
                disabled={!make}
                required
              />
            </Field>
            <Field label="Year" required>
              <SelectFancy
                value={year}
                onChange={setYear}
                placeholder="Year"
                options={years}
                disabled={!model}
                required
              />
            </Field>
          </div>
        </FormCard>

        {/* Part details */}
        <FormCard
          eyebrow="PART DETAILS"
          title="What do you need?"
          icon={<BoltIcon size={18} />}
        >
          <Field label="Part name" required>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="e.g. Front brake caliper"
              className="h-12 rounded-[14px] bg-paper-2 border border-transparent focus:border-[color:var(--accent)] focus:bg-paper px-4 text-[14px] font-medium text-ink placeholder:text-ink-3 placeholder:font-normal w-full transition-all outline-none"
              required
              minLength={2}
            />
          </Field>

          <Field label="Additional details" hint="optional">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="OEM number, condition preference, urgency"
              rows={3}
              className="rounded-[14px] bg-paper-2 border border-transparent focus:border-[color:var(--accent)] focus:bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-ink-3 w-full resize-none transition-all outline-none"
            />
          </Field>
        </FormCard>

        {/* How it works */}
        <div className="bg-accent-wash rounded-[16px] px-4 py-4 flex gap-3">
          <div className="w-9 h-9 rounded-full bg-paper flex-shrink-0 flex items-center justify-center text-[color:var(--accent-ink)]">
            <ShieldIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-ink mb-1.5">How it works</div>
            <div className="space-y-1.5">
              {[
                "Post your request",
                "Suppliers submit competitive quotes",
                "Pick one and connect directly to close the deal",
              ].map((line, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-ink-2 font-medium">
                  <span className="w-4 h-4 rounded-full bg-paper flex items-center justify-center text-[10px] font-bold text-[color:var(--accent-ink)]">
                    {i + 1}
                  </span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Sticky submit CTA (mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-xl shadow-[var(--shadow-sticky)] pb-[max(env(safe-area-inset-bottom),12px)] pt-3 px-4">
        <Button
          type="button"
          variant="primary"
          block
          size="lg"
          loading={loading}
          disabled={!isValid}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
          rightIcon={!loading && isValid ? <CheckIcon size={18} /> : undefined}
        >
          {isValid ? "Post inquiry" : "Fill all required fields"}
        </Button>
      </div>

      {/* Inline submit (desktop) */}
      <div className="hidden md:block px-5 pt-2 pb-8">
        <Button
          type="submit"
          variant="primary"
          block
          size="lg"
          loading={loading}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Post inquiry
        </Button>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function FormCard({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper rounded-[20px] shadow-[var(--shadow-card)] p-4">
      <div className="flex items-center gap-2.5 mb-3.5">
        {icon && (
          <div className="w-9 h-9 rounded-full bg-accent-wash flex items-center justify-center text-[color:var(--accent-ink)]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
            {eyebrow}
          </div>
          <div className="display text-[15px] text-ink leading-tight">{title}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold text-ink flex items-center gap-1.5">
        {label}
        {required && <span className="text-[color:var(--accent)]">*</span>}
        {hint && <span className="text-ink-3 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function SelectFancy({
  value,
  onChange,
  placeholder,
  options,
  disabled,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="h-12 rounded-[14px] bg-paper-2 border border-transparent focus:border-[color:var(--accent)] focus:bg-paper px-4 pr-10 text-[14px] font-medium text-ink w-full appearance-none disabled:opacity-50 transition-all outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
