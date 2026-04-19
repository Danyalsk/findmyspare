"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";

/* ═══════════════════════════════════════════════════════
   Root Page — Role Switch (Screen 01 from prototype)
   
   Authenticated → role switch screen (exact prototype match)
   Unauthenticated → redirects to /buyer (public role-free)
   ═══════════════════════════════════════════════════════ */

export default function RootPage() {
  const user = useAuthStore((s) => s.user);

  /* ── Unauthenticated: straight to buyer experience ── */
  if (!user) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col px-6 py-8 max-w-[390px] mx-auto w-full">
        {/* Logo row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center"
              style={{ color: "var(--paper)" }}
            >
              <span className="serif italic text-[20px] font-semibold leading-none">f</span>
            </div>
            <span className="font-semibold text-ink" style={{ letterSpacing: "-0.01em" }}>
              FindMySpare
            </span>
          </div>
          {/* Escrow chip */}
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-[5px] rounded-full"
            style={{
              background: "var(--paper-2)",
              border: "1px solid var(--line)",
              color: "var(--ink-2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            Escrow protected
          </span>
        </div>

        {/* Hero text */}
        <div className="mt-10">
          <div
            className="mono text-[11px] uppercase"
            style={{ color: "var(--ink-3)", letterSpacing: "0.1em" }}
          >
            Trusted auto parts marketplace
          </div>
          <h1
            className="serif mt-2.5"
            style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            Find the{" "}
            <em className="not-italic" style={{ fontStyle: "italic", color: "var(--accent-ink)" }}>
              exact part
            </em>
            <br />for your car.
          </h1>
        </div>

        {/* Cards */}
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/buyer">
            <RoleCard
              icon={<SearchIconSvg />}
              iconBg="var(--accent-wash)"
              iconColor="var(--accent-ink)"
              heading="Start finding parts"
              subtext="Browse, scan VIN or post a request"
              bordered
            />
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="flex-1">
              <div
                className="p-4 text-center rounded-[14px] border"
                style={{ background: "var(--paper)", borderColor: "var(--line)" }}
              >
                <div className="font-semibold text-sm">Sign In</div>
                <div className="text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>
                  Existing account
                </div>
              </div>
            </Link>
            <Link href="/register" className="flex-1">
              <div
                className="p-4 text-center rounded-[14px] border-[1.5px]"
                style={{
                  background: "var(--paper)",
                  borderColor: "var(--accent)",
                }}
              >
                <div className="font-semibold text-sm" style={{ color: "var(--accent-ink)" }}>
                  Register
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>
                  Create account
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Trust footer */}
        <TrustFooter />
      </div>
    );
  }

  /* ── Authenticated: Role Switch — Screen 01 (exact prototype) ── */
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--paper)", color: "var(--ink)" }}
    >
      {/* Scrollable body — padded exactly as prototype: 32px 24px 24px */}
      <div
        className="flex-1 flex flex-col overflow-y-auto max-w-[390px] mx-auto w-full"
        style={{ padding: "32px 24px 24px", gap: 20 }}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--ink)",
                color: "var(--paper)",
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 600,
                fontSize: 20,
                fontStyle: "italic",
              }}
            >
              f
            </div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>
              FindMySpare
            </div>
          </div>
          {/* Escrow chip — exactly as prototype */}
          <span
            className="inline-flex items-center"
            style={{
              gap: 6,
              padding: "5px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 500,
              background: "var(--paper-2)",
              border: "1px solid var(--line)",
              color: "var(--ink-2)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
              }}
            />
            Escrow protected
          </span>
        </div>

        {/* Heading block — mt:28px as prototype */}
        <div style={{ marginTop: 28 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Welcome back, {user.name?.split(" ")[0] || "Daniel"}
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 44,
              lineHeight: 1,
              margin: "10px 0 0",
              letterSpacing: "-0.02em",
            }}
          >
            Choose
            <br />
            how you&apos;re{" "}
            <em style={{ fontStyle: "italic", color: "var(--accent-ink)" }}>
              trading
            </em>
            <br />
            today.
          </h1>
        </div>

        {/* Role cards — gap:12px, mt:14px as prototype */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {/* Buyer card — thick ink border (selected) */}
          <Link href="/buyer">
            <div
              className="card-role"
              style={{
                padding: 18,
                display: "flex",
                gap: 14,
                alignItems: "center",
                border: "1.5px solid var(--ink)",
                borderRadius: "var(--radius)",
                background: "var(--paper)",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "var(--accent-wash)",
                  color: "var(--accent-ink)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <SearchIconSvg />
              </div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>I&apos;m looking for a part</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  Browse, scan VIN or post a request
                </div>
              </div>
              {/* Arrow — full size as prototype */}
              <ArrowRightSvg />
            </div>
          </Link>

          {/* Supplier card */}
          <Link href="/supplier">
            <div
              style={{
                padding: 18,
                display: "flex",
                gap: 14,
                alignItems: "center",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                background: "var(--paper)",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "var(--paper-3)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <PackageIconSvg />
              </div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>I supply parts</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  12 active listings · 3 pending orders
                </div>
              </div>
              <ArrowRightSvg />
            </div>
          </Link>
        </div>

        {/* Trust footer — sits naturally after cards */}
        <div
          style={{
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            color: "var(--ink-3)",
            fontSize: 11,
          }}
        >
          <span style={{ width: 14, height: 14, color: "var(--accent-ink)", display: "flex" }}>
            <LockIconSvg />
          </span>
          <span className="mono" style={{ letterSpacing: "0.06em" }}>
            SSL · ESCROW · KYC-VERIFIED SUPPLIERS
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── helpers ─────────────────────────────── */

function TrustFooter() {
  return (
    <div
      style={{
        marginTop: "auto",
        paddingTop: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
        color: "var(--ink-3)",
        fontSize: 11,
      }}
    >
      <span style={{ width: 14, height: 14, color: "var(--accent-ink)", display: "flex" }}>
        <LockIconSvg />
      </span>
      <span className="mono" style={{ letterSpacing: "0.06em" }}>
        SSL · ESCROW · KYC-VERIFIED SUPPLIERS
      </span>
    </div>
  );
}

/* ── Inline SVGs exactly from prototype (1.6 stroke, rounded) ── */

function SearchIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PackageIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9" />
    </svg>
  );
}

function ArrowRightSvg() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LockIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function RoleCard({
  icon,
  iconBg,
  iconColor,
  heading,
  subtext,
  bordered = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  heading: string;
  subtext: string;
  bordered?: boolean;
}) {
  return (
    <div
      style={{
        padding: 18,
        display: "flex",
        gap: 14,
        alignItems: "center",
        border: bordered ? "1.5px solid var(--ink)" : "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--paper)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 11,
          background: iconBg,
          color: iconColor,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{heading}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{subtext}</div>
      </div>
      <ArrowRightSvg />
    </div>
  );
}
