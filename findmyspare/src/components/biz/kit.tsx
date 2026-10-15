"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { getErrorMessage } from "@/lib/errors";
import type { KhataRow, PoStatus } from "@/lib/api/v3";

/* Shared building blocks for the Business OS (/biz). */

// ─── Data loading without setState-in-effect ───────────────
/** Fetches whenever `key` changes (null = don't fetch). Keeps the last data
 *  for the same key while a reload is in flight, so lists don't flash. */
export function useApi<T>(key: string | null, fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ key: string; n: number; data?: T; error?: string } | null>(null);
  useEffect(() => {
    if (key === null) return;
    let alive = true;
    fnRef.current()
      .then((data) => { if (alive) setState({ key, n: nonce, data }); })
      .catch((e) => { if (alive) setState({ key, n: nonce, error: getErrorMessage(e, "Couldn't load. Check your connection.") }); });
    return () => { alive = false; };
  }, [key, nonce]);
  const same = state && state.key === key ? state : null;
  return {
    data: same?.data,
    error: same?.error,
    loading: !same || same.n !== nonce,
    reload: () => setNonce((n) => n + 1),
  };
}

/** Debounced copy of a value (for search boxes). */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// ─── Formatting ────────────────────────────────────────────
export const num = (v: string | number | null | undefined) => (typeof v === "string" ? parseFloat(v) || 0 : v ?? 0);
export const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
export function shortDate(d: string | Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
export function dateTime(d: string | Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
/** wa.me link; Indian 10-digit numbers get the 91 prefix. */
export function waLink(phone: string | null | undefined, text: string) {
  let d = (phone ?? "").replace(/\D/g, "");
  if (d.length === 10) d = "91" + d;
  if (d.length === 11 && d.startsWith("0")) d = "91" + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

/** Party page link for a khata row (registered business, phone, or name only). */
export function partyHref(r: Pick<KhataRow, "counterparty_id" | "phone" | "name">) {
  if (r.counterparty_id) return `/biz/khata/party?id=${r.counterparty_id}`;
  if (r.phone) return `/biz/khata/party?phone=${encodeURIComponent(r.phone)}${r.name ? `&name=${encodeURIComponent(r.name)}` : ""}`;
  return `/biz/khata/party?name=${encodeURIComponent(r.name ?? "")}`;
}

export const PO_STATUS: Record<PoStatus, { label: string; tone: "brand" | "green" | "amber" | "red" | "blue" | "grey" }> = {
  sent: { label: "Waiting to accept", tone: "amber" },
  accepted: { label: "Accepted · to ship", tone: "blue" },
  shipped: { label: "On the way", tone: "brand" },
  received: { label: "Received", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  cancelled: { label: "Cancelled", tone: "grey" },
};
export const PAY_MODE: Record<string, string> = { cash: "Cash", upi: "UPI", card: "Card", credit: "Udhaar" };

// ─── Icons (24px line, 2px stroke) ─────────────────────────
type IP = { size?: number; className?: string };
const ic = (d: React.ReactNode) =>
  function I({ size = 22, className }: IP) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {d}
      </svg>
    );
  };
export const BI = {
  home: ic(<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  bill: ic(<><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M9 7h6M9 11h6M9 15h4" /></>),
  box: ic(<><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>),
  book: ic(<><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" /><path d="M4 17a3 3 0 0 1 3-3h11" /><path d="M9 8h5" /></>),
  more: ic(<><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>),
  users: ic(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>),
  radar: ic(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12 18 6" /><circle cx="12" cy="12" r="1" /></>),
  tag: ic(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="8" cy="8" r="1.5" /></>),
  upload: ic(<><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>),
  store: ic(<><path d="M4 9 5.5 4h13L20 9" /><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" /><path d="M5 11v9h14v-9M10 20v-5h4v5" /></>),
  truck: ic(<><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  inbox: ic(<><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5 5h14l2 8v6H3v-6z" /></>),
  check: ic(<path d="m5 12 5 5L20 7" />),
  alert: ic(<><path d="M12 8v5M12 17h.01" /><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0" /></>),
  link: ic(<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>),
  rupee: ic(<><path d="M7 4h10M7 9h10M7 4c6 0 6 10 0 10l7 6" /></>),
  plus: ic(<path d="M12 5v14M5 12h14" />),
  minus: ic(<path d="M5 12h14" />),
  back: ic(<path d="m15 18-6-6 6-6" />),
  chev: ic(<path d="m9 6 6 6-6 6" />),
  search: ic(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  wa: ic(<><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 1-.5 1.7c-3.5.3-7.7-3.9-7.4-7.4L10.5 7.6l1 2z" /></>),
  print: ic(<><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>),
  share: ic(<><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></>),
  logout: ic(<><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>),
  user: ic(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  settings: ic(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>),
  cart: ic(<><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></>),
  trash: ic(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>),
  download: ic(<><path d="M12 4v12M7 11l5 5 5-5" /><path d="M4 20h16" /></>),
};

// ─── Layout bits ───────────────────────────────────────────
export function Page({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return <div className={clsx("w-full mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-8", wide ? "max-w-[1120px]" : "max-w-[920px]", className)}>{children}</div>;
}

export function PageHead({ title, sub, back, action }: { title: string; sub?: React.ReactNode; back?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-5 no-print">
      {back && (
        <Link href={back} aria-label="Back" className="mt-0.5 w-10 h-10 rounded-full bg-paper-2 flex items-center justify-center text-ink flex-shrink-0 hover:bg-paper-3">
          <BI.back size={20} />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-[-0.02em] text-ink leading-tight">{title}</h1>
        {sub && <div className="text-[13.5px] text-ink-3 font-semibold mt-0.5">{sub}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[] }) {
  return (
    <div role="tablist" className="flex gap-1 p-1 rounded-[14px] bg-paper-2 mb-4 overflow-x-auto scroll-hidden">
      {items.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            "flex-1 min-w-fit h-10 px-3 rounded-[11px] text-[14px] font-extrabold whitespace-nowrap inline-flex items-center justify-center gap-1.5 transition-colors",
            value === t.value ? "bg-paper text-ink shadow-[var(--shadow-card)]" : "text-ink-3 hover:text-ink"
          )}
        >
          {t.label}
          {!!t.count && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[color:var(--accent)] text-white text-[11px] inline-flex items-center justify-center">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((t) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={value === t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            "h-11 rounded-[12px] border text-[14px] font-extrabold transition-colors",
            value === t.value ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)] text-[color:var(--accent-ink)]" : "border-line-2 bg-paper text-ink-2 hover:border-ink-4"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max, label, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; step?: number }) {
  const btn = "w-9 h-9 flex items-center justify-center text-[color:var(--accent)] disabled:text-ink-4 disabled:cursor-not-allowed";
  return (
    <div className="inline-flex items-center h-9 rounded-[10px] border border-[color:var(--accent)] bg-paper flex-shrink-0">
      <button type="button" className={btn} aria-label={`Less ${label}`} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min && min > 0}>
        <BI.minus size={16} />
      </button>
      <input
        aria-label={`${label} quantity`}
        inputMode="numeric"
        className="w-10 text-center text-[14px] font-extrabold bg-transparent outline-none tabular-nums"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
          onChange(max !== undefined ? Math.min(max, n) : n);
        }}
      />
      <button type="button" className={btn} aria-label={`More ${label}`} onClick={() => onChange(max !== undefined ? Math.min(max, value + step) : value + step)} disabled={max !== undefined && value >= max}>
        <BI.plus size={16} />
      </button>
    </div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[16px] bg-[color:var(--danger-wash)] text-[color:var(--danger)] p-4 flex items-center gap-3">
      <BI.alert size={20} />
      <div className="flex-1 text-[14px] font-bold">{message}</div>
      {onRetry && <button onClick={onRetry} className="text-[13px] font-extrabold underline">Try again</button>}
    </div>
  );
}

/** Shown on seller-only screens to buyers (technicians, fleets). */
export function SellerOnly({ what }: { what: string }) {
  return (
    <div className="card p-6 md:p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-[18px] bg-[color:var(--accent-wash)] text-[color:var(--accent)] flex items-center justify-center mb-3"><BI.store size={26} /></div>
      <div className="text-[18px] font-extrabold tracking-tight">{what} is for verified sellers</div>
      <p className="text-[14px] text-ink-3 mt-1.5 max-w-md mx-auto">You can still order stock from your suppliers and track what you owe. To sell on FindMySpare, register your shop with GST.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/biz/network" className="h-11 px-5 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white font-extrabold">Order stock</Link>
        <Link href="/sell" className="h-11 px-5 inline-flex items-center rounded-[12px] bg-paper-2 text-ink font-extrabold">Become a seller</Link>
      </div>
    </div>
  );
}

export const btnPrimary = "h-12 px-6 rounded-[14px] bg-[color:var(--accent)] text-white font-extrabold inline-flex items-center justify-center gap-2 fms-press disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[color:var(--accent-ink)] transition-colors";
export const btnGhost = "h-12 px-5 rounded-[14px] bg-paper-2 text-ink font-extrabold inline-flex items-center justify-center gap-2 fms-press hover:bg-paper-3 disabled:opacity-40";
export const btnSmall = "h-9 px-3.5 rounded-[10px] text-[13px] font-extrabold inline-flex items-center justify-center gap-1.5 fms-press disabled:opacity-40";
