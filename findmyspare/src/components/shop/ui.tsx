"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import {
  EngineIcon, BrakeIcon, HeadlightIcon, BodyIcon, SuspensionIcon, TransmissionIcon,
  ElectricalIcon, FilterIcon, TyreIcon, AcIcon, WiperIcon, InteriorIcon,
} from "@/lib/category-icons";
import { LogoMark } from "@/components/brand/Logo";
import { PART_TYPE_LABEL, type PartType } from "@/lib/api/v2";

/* Small building blocks for the v2 shop (Swiggy-clean). */

export const CATEGORIES: { key: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string }>; tint: string; ink: string }[] = [
  { key: "Brakes", label: "Brakes", Icon: BrakeIcon, tint: "#FDECEA", ink: "#B42318" },
  { key: "Filters", label: "Filters", Icon: FilterIcon, tint: "#EAF0FD", ink: "#2457C5" },
  { key: "Engine", label: "Engine", Icon: EngineIcon, tint: "#FFF1EB", ink: "#A32D0C" },
  { key: "Electrical", label: "Batteries & electrical", Icon: ElectricalIcon, tint: "#FFF6E0", ink: "#9A6700" },
  { key: "Suspension", label: "Suspension", Icon: SuspensionIcon, tint: "#EEF0F3", ink: "#3E434E" },
  { key: "Transmission", label: "Clutch & transmission", Icon: TransmissionIcon, tint: "#F1ECFB", ink: "#5B3CC4" },
  { key: "Lighting", label: "Lights", Icon: HeadlightIcon, tint: "#FFF8D6", ink: "#8A6100" },
  { key: "Body", label: "Body & mirrors", Icon: BodyIcon, tint: "#E7F5EF", ink: "#0B7A53" },
  { key: "AC", label: "AC & cooling", Icon: AcIcon, tint: "#E6F6FA", ink: "#0B6E85" },
  { key: "Tyres", label: "Tyres & wheels", Icon: TyreIcon, tint: "#EEF0F3", ink: "#1B1E24" },
  { key: "Wipers", label: "Wipers", Icon: WiperIcon, tint: "#EAF0FD", ink: "#2457C5" },
  { key: "Interior", label: "Interior", Icon: InteriorIcon, tint: "#FFF1EB", ink: "#A32D0C" },
];
export const categoryStyle = (c?: string | null) => CATEGORIES.find((x) => x.key === c) ?? CATEGORIES[2]!;

/** Product image placeholder: tinted tile with the category glyph + brand. */
export function PartThumb({ category, brand, size = "md", className }: { category?: string | null; brand?: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const c = categoryStyle(category);
  const px = size === "sm" ? 28 : size === "lg" ? 72 : 44;
  return (
    <div className={clsx("relative flex items-center justify-center overflow-hidden", className)} style={{ background: c.tint, color: c.ink }}>
      <LogoMark size={px * 2.6} color="rgba(255,255,255,.55)" className="absolute -right-[18%] -bottom-[22%]" />
      <c.Icon size={px} className="relative" />
      {brand && size !== "sm" && (
        <span className="absolute left-2 top-2 text-[10.5px] font-extrabold tracking-tight px-2 h-5 inline-flex items-center rounded-full bg-white/85 text-ink">
          {brand}
        </span>
      )}
    </div>
  );
}

export function PartTypeBadge({ type, className }: { type: PartType; className?: string }) {
  const tone =
    type === "genuine" ? "bg-[color:var(--info-wash)] text-[color:var(--info)]"
    : type === "oes" ? "bg-[color:var(--success-wash)] text-[color:var(--success)]"
    : type === "used" || type === "refurbished" ? "bg-[color:var(--amber-wash)] text-[color:var(--amber)]"
    : "bg-paper-2 text-ink-2";
  return <span className={clsx("inline-flex items-center h-[22px] px-2 rounded-[6px] text-[11px] font-bold", tone, className)}>{PART_TYPE_LABEL[type]}</span>;
}

/** Swiggy-style green rating pill. */
export function RatingPill({ rating, count, className }: { rating: string | number | null | undefined; count?: number; className?: string }) {
  if (!rating) return <span className={clsx("text-[12px] font-semibold text-ink-3", className)}>New</span>;
  return (
    <span className={clsx("inline-flex items-center gap-1 text-[12.5px] font-bold text-ink-2", className)}>
      <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[color:var(--success)] text-white">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
      </span>
      {Number(rating).toFixed(1)}
      {count !== undefined && <span className="text-ink-3 font-semibold">({count})</span>}
    </span>
  );
}

export function VerifiedBadge({ label = "FMS Verified", className }: { label?: string; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 h-[22px] px-2 rounded-full bg-[color:var(--success-wash)] text-[color:var(--success)] text-[11px] font-bold", className)}>
      <LogoMark size={12} color="currentColor" />
      {label}
    </span>
  );
}

/** Fitment verdict for the selected vehicle. */
export function FitBadge({ fits, label, className }: { fits: boolean | null; label?: string; className?: string }) {
  if (fits === null) return null;
  return fits ? (
    <span className={clsx("inline-flex items-center gap-1 text-[12px] font-bold text-[color:var(--success)]", className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
      Fits {label ?? "your vehicle"}
    </span>
  ) : (
    <span className={clsx("inline-flex items-center gap-1 text-[12px] font-bold text-[color:var(--amber)]", className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden><path d="M12 8v5M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>
      Fitment not listed for {label ?? "your vehicle"}
    </span>
  );
}

export function SectionTitle({ title, sub, action, className }: { title: string; sub?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex items-end justify-between gap-4 mb-4", className)}>
      <div>
        <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
        {sub && <p className="text-[13.5px] text-ink-3 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Bottom sheet on mobile, centred dialog on desktop. */
export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 bg-black/45 fms-fade-up" onClick={onClose} />
      <div className={clsx("relative w-full bg-paper rounded-t-[24px] md:rounded-[24px] max-h-[88dvh] overflow-y-auto fms-slide-up md:fms-fade-up", wide ? "md:max-w-[640px]" : "md:max-w-[480px]")}>
        <div className="sticky top-0 bg-paper z-10 px-5 pt-4 pb-3 flex items-center justify-between border-b border-line">
          <h3 className="text-[17px] font-extrabold tracking-tight">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-paper-2 flex items-center justify-center text-ink-2 hover:bg-paper-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function StatusChip({ tone, children, className }: { tone: "brand" | "green" | "amber" | "red" | "blue" | "grey"; children: React.ReactNode; className?: string }) {
  const t = {
    brand: "bg-[color:var(--accent-wash)] text-[color:var(--accent-ink)]",
    green: "bg-[color:var(--success-wash)] text-[color:var(--success)]",
    amber: "bg-[color:var(--amber-wash)] text-[color:var(--amber)]",
    red: "bg-[color:var(--danger-wash)] text-[color:var(--danger)]",
    blue: "bg-[color:var(--info-wash)] text-[color:var(--info)]",
    grey: "bg-paper-2 text-ink-2",
  }[tone];
  return <span className={clsx("inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-bold whitespace-nowrap", t, className)}>{children}</span>;
}

/** Vertical progress timeline (order tracking, job status). */
export function Timeline({ steps }: { steps: { label: string; sub?: string; state: "done" | "current" | "todo" }[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li key={s.label} className="relative pl-9 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span className={clsx("absolute left-[11px] top-6 bottom-0 w-[2px]", s.state === "done" ? "bg-[color:var(--success)]" : "bg-line")} />
          )}
          <span
            className={clsx(
              "absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2",
              s.state === "done" && "bg-[color:var(--success)] border-[color:var(--success)] text-white",
              s.state === "current" && "bg-paper border-[color:var(--accent)]",
              s.state === "todo" && "bg-paper border-line-2"
            )}
          >
            {s.state === "done" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="m5 12 5 5L20 7" /></svg>}
            {s.state === "current" && <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--accent)] animate-pulse" />}
          </span>
          <div className={clsx("text-[14px] font-bold", s.state === "todo" ? "text-ink-4" : "text-ink")}>{s.label}</div>
          {s.sub && <div className="text-[12.5px] text-ink-3 mt-0.5">{s.sub}</div>}
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body?: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="mx-auto w-16 h-16 rounded-[20px] bg-[color:var(--accent-wash)] flex items-center justify-center mb-4">
        {icon ?? <LogoMark size={32} />}
      </div>
      <div className="text-[17px] font-extrabold tracking-tight">{title}</div>
      {body && <p className="text-[14px] text-ink-3 mt-1.5 max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Skel({ className }: { className?: string }) {
  return <div className={clsx("fms-shimmer rounded-[12px]", className)} />;
}

/** Form field. `group` renders a <div role="group"> for chip sets / multiple controls
 *  (a <label> would merge its text into every button's accessible name). */
export const Field = ({ label, hint, children, group }: { label: string; hint?: string; children: React.ReactNode; group?: boolean }) => {
  const body = (
    <>
      <span className="block text-[12.5px] font-bold text-ink-2 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-ink-3 mt-1">{hint}</span>}
    </>
  );
  return group ? <div role="group" aria-label={label} className="block">{body}</div> : <label className="block">{body}</label>;
};
export const inputCls =
  "w-full h-12 px-4 rounded-[12px] bg-paper-2 border border-transparent text-[15px] font-medium text-ink placeholder:text-ink-4 focus:bg-paper focus:border-[color:var(--accent)] outline-none transition-colors";
