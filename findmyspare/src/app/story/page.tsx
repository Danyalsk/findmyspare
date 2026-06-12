"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Metadata exported via a sibling file (server export) ───── */

/* ═══════════════════════════════════════════════════
   FindMySpare · Visual Story Page
   Route: /story
   
   Design principles applied (emilkowalski/skill + taste-skill):
   - Every element earns its place
   - Motion serves meaning, not decoration
   - Typography does heavy lifting
   - Rhythm through whitespace
   ═══════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? scrolled / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

/* ─── Reveal wrapper ───────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Stat chip ────────────────────────────────────────────── */
function StatPill({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.92)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
    >
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "28px 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink-3)",
            marginTop: 10,
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline step ────────────────────────────────────────── */
function TimelineStep({
  number,
  title,
  body,
  delay,
}: {
  number: string;
  title: string;
  body: string;
  delay: number;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-24px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        display: "flex",
        gap: 28,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--paper)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {number}
      </div>
      <div style={{ paddingTop: 10 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 15,
            color: "var(--ink-2)",
            lineHeight: 1.65,
            maxWidth: 480,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

/* ─── Quote block ──────────────────────────────────────────── */
function PullQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution: string;
}) {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0ms",
        borderLeft: "3px solid var(--accent)",
        paddingLeft: 28,
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          fontSize: "clamp(19px, 2.5vw, 24px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--ink)",
          lineHeight: 1.55,
          letterSpacing: "-0.01em",
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div
        style={{
          marginTop: 16,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ink-3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {attribution}
      </div>
    </div>
  );
}

/* ─── Value card ───────────────────────────────────────────── */
function ValueCard({
  icon,
  title,
  body,
  delay,
}: {
  icon: string;
  title: string;
  body: string;
  delay: number;
}) {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? hovered
            ? "translateY(-4px)"
            : "translateY(0)"
          : "translateY(24px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)`,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "36px 32px",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 20, lineHeight: 1 }}>{icon}</div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-2)",
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function StoryPage() {
  const scrollProgress = useScrollProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
        WebkitFontSmoothing: "antialiased",
        overflowX: "hidden",
      }}
    >
      {/* ── Progress bar ─────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: 2,
          width: `${scrollProgress * 100}%`,
          background: "var(--accent)",
          zIndex: 100,
          transition: "width 0.05s linear",
        }}
      />

      {/* ── Minimal nav ──────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(20px, 5vw, 64px)",
          height: 60,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--ink)",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--paper)",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            f
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>
            FindMySpare
          </span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/search"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--ink-2)",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
          >
            Browse
          </Link>
          <Link
            href="/sell"
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "var(--ink)",
              color: "var(--paper)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "-0.005em",
            }}
          >
            Sell with us
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════
          SECTION 1 · CINEMATIC HERO
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px clamp(20px, 6vw, 80px) 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(var(--line) 1px, transparent 1px),
              linear-gradient(90deg, var(--line) 1px, transparent 1px)
            `,
            backgroundSize: "72px 72px",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />
        {/* Radial fade overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, var(--paper) 80%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 32,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(12px)",
              transition: "opacity 0.6s 0.1s, transform 0.6s 0.1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            The FindMySpare Story
          </div>

          <h1
            style={{
              fontSize: "clamp(44px, 8vw, 88px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: "var(--ink)",
              margin: "0 0 28px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transition: "opacity 0.75s 0.2s, transform 0.75s 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Every car
            <br />
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px var(--ink-3)",
              }}
            >
              deserves
            </span>
            <br />
            every part.
          </h1>

          <p
            style={{
              fontSize: "clamp(17px, 2vw, 20px)",
              color: "var(--ink-2)",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "0 auto 52px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(16px)",
              transition: "opacity 0.7s 0.35s, transform 0.7s 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            India&rsquo;s aftermarket is fragmented, opaque, and slow.
            FindMySpare is changing that — one verified supplier at a time.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(12px)",
              transition: "opacity 0.6s 0.5s, transform 0.6s 0.5s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <Link
              href="/search"
              id="story-hero-browse-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 10,
                background: "var(--ink)",
                color: "var(--paper)",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              Browse the marketplace
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/sell"
              id="story-hero-sell-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 28px",
                borderRadius: 10,
                border: "1px solid var(--line-2)",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                background: "transparent",
              }}
            >
              Become a supplier
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: mounted ? 0.5 : 0,
            transition: "opacity 1s 1.2s",
          }}
        >
          <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            Scroll
          </span>
          <div
            style={{
              width: 1,
              height: 48,
              background: "linear-gradient(to bottom, var(--ink-3), transparent)",
              animation: "scrollCue 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      <style>{`
        @keyframes scrollCue {
          0%, 100% { opacity: 0.5; transform: scaleY(1); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(0.6); transform-origin: top; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          SECTION 2 · THE PROBLEM
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "clamp(80px, 12vw, 140px) clamp(20px, 6vw, 80px)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 24,
              }}
            >
              The problem
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2
              style={{
                fontSize: "clamp(34px, 5.5vw, 60px)",
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: "var(--paper)",
                marginBottom: 48,
              }}
            >
              Finding auto parts in India
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>
                shouldn&rsquo;t feel like a mystery.
              </span>
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {[
              {
                label: "Unverified sellers",
                body: "The grey market thrives on information asymmetry. Counterfeit parts cause accidents.",
                delay: 0,
              },
              {
                label: "Opaque pricing",
                body: "Without a marketplace, buyers can't compare. Suppliers charge whatever the market will bear.",
                delay: 80,
              },
              {
                label: "Slow discovery",
                body: "Phone calls, WhatsApp groups, physical tours across city — just to find one brake pad.",
                delay: 160,
              },
              {
                label: "Zero accountability",
                body: "No reviews. No ratings. No recourse. A bad part costs more than money.",
                delay: 240,
              },
            ].map((item) => (
              <Reveal key={item.label} delay={item.delay}>
                <div
                  style={{
                    padding: "36px 32px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      background: "var(--accent-soft)",
                      marginBottom: 20,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: "var(--paper)",
                      letterSpacing: "-0.01em",
                      marginBottom: 10,
                    }}
                  >
                    {item.label}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.7,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3 · TRACTION / NUMBERS
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--paper-2, #FAFAFA)",
          padding: "clamp(80px, 12vw, 140px) clamp(20px, 6vw, 80px)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                marginBottom: 24,
              }}
            >
              Scale &amp; traction
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--ink)",
                marginBottom: 60,
                maxWidth: 640,
              }}
            >
              The numbers behind
              <br />
              the mission.
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <StatPill value="6,500+" label="Pincodes covered" delay={0} />
            <StatPill value="100%" label="GST-verified suppliers" delay={80} />
            <StatPill value="< 5 min" label="Average quote time" delay={160} />
            <StatPill value="₹0" label="Listing fees" delay={240} />
          </div>

          <div style={{ marginTop: 72 }}>
            <PullQuote
              quote="We built FindMySpare because we were tired of being burned. Every mechanic, every workshop owner, every fleet manager in India has the same story. We decided to fix it."
              attribution="The FindMySpare Team"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4 · THE PRODUCT — VISUAL JOURNEY
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          padding: "clamp(80px, 12vw, 140px) clamp(20px, 6vw, 80px)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                marginBottom: 24,
              }}
            >
              User journey
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--ink)",
                marginBottom: 72,
                maxWidth: 560,
              }}
            >
              From request to
              <br />
              part in three steps.
            </h2>
          </Reveal>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 52,
            }}
          >
            <TimelineStep
              number="01"
              title="Post your requirement"
              body="Describe what you need — part name, make, model, year. Upload a photo for precision. It takes 60 seconds. Our system routes it to every verified supplier that can help."
              delay={0}
            />
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to right, var(--line), transparent)",
                marginLeft: 72,
              }}
            />
            <TimelineStep
              number="02"
              title="Receive live quotes"
              body="Verified suppliers compete on price, quality, and delivery time. You see their rating, location, and GST status upfront. No mystery. No guesswork."
              delay={80}
            />
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to right, var(--line), transparent)",
                marginLeft: 72,
              }}
            />
            <TimelineStep
              number="03"
              title="Connect and close"
              body="Pick the best quote. Chat directly or WhatsApp the supplier — no middleman adding markup and delay. The deal is yours to close on your terms."
              delay={160}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5 · BRAND VALUES
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--paper-3, #F5F5F5)",
          padding: "clamp(80px, 12vw, 140px) clamp(20px, 6vw, 80px)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                marginBottom: 24,
              }}
            >
              Our principles
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--ink)",
                marginBottom: 60,
                maxWidth: 560,
              }}
            >
              Built on four
              <br />
              uncompromising values.
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <ValueCard
              icon="🔐"
              title="Verified first"
              body="Every supplier is GST-verified and manually reviewed. If we can't verify them, they don't list. Period."
              delay={0}
            />
            <ValueCard
              icon="⚡"
              title="Speed matters"
              body="Quotes in minutes, not days. A car off the road costs money. We treat urgency as a product feature."
              delay={80}
            />
            <ValueCard
              icon="🤝"
              title="Direct relationships"
              body="We connect buyers to suppliers, then step aside. No commission layers, no artificial friction."
              delay={160}
            />
            <ValueCard
              icon="🇮🇳"
              title="Made for India"
              body="Pan-India reach, vernacular support, GST-native billing. This is a platform built for the Indian aftermarket."
              delay={240}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 6 · SUPPLIER VISION
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          padding: "clamp(80px, 12vw, 140px) clamp(20px, 6vw, 80px)",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px, 6vw, 100px)",
            alignItems: "center",
          }}
        >
          <div>
            <Reveal>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 24,
                }}
              >
                For suppliers
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 46px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "var(--ink)",
                  marginBottom: 24,
                }}
              >
                Your inventory.
                <br />
                A national audience.
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--ink-2)",
                  lineHeight: 1.7,
                  marginBottom: 36,
                }}
              >
                List your entire catalogue in minutes. Verified buyer inquiries
                land directly in your dashboard. No brokerage, no delay — just
                serious buyers ready to close.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/sell"
                  id="story-supplier-cta-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 24px",
                    borderRadius: 10,
                    background: "var(--accent, #C4500F)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                    letterSpacing: "-0.005em",
                  }}
                >
                  Become a supplier
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/supplier-login"
                  id="story-supplier-login-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "13px 24px",
                    borderRadius: 10,
                    border: "1px solid var(--line-2)",
                    color: "var(--ink)",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                    background: "transparent",
                  }}
                >
                  Supplier login
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right: visual feature list */}
          <Reveal delay={100}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                background: "var(--line)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {[
                { label: "Live inquiry dashboard", sub: "Real-time buyer leads, filtered by your catalogue" },
                { label: "₹0 listing fees", sub: "Always free to list. We grow when you grow." },
                { label: "GST-native invoicing", sub: "Compliant billing built into every transaction" },
                { label: "Direct WhatsApp leads", sub: "Buyers connect with you, not a call centre" },
                { label: "Verified badge", sub: "Your GST verification displayed on every listing" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    padding: "20px 24px",
                    background: "var(--paper)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "var(--paper-3, #F5F5F5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink-3)",
                    }}
                  >
                    0{i + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--ink)",
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--ink-3)",
                        marginTop: 2,
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7 · VISION
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "clamp(100px, 15vw, 180px) clamp(20px, 6vw, 80px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative radial */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "max(600px, 80vw)",
            height: "max(600px, 80vw)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196,80,15,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: 36,
              }}
            >
              The vision
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2
              style={{
                fontSize: "clamp(36px, 6vw, 70px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.03,
                color: "var(--paper)",
                marginBottom: 36,
              }}
            >
              India&rsquo;s auto parts
              <br />
              <span style={{ color: "var(--accent-soft, #E96A1F)" }}>
                shouldn&rsquo;t be a gamble.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p
              style={{
                fontSize: "clamp(16px, 2vw, 19px)",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.75,
                maxWidth: 560,
                margin: "0 auto 60px",
              }}
            >
              We&rsquo;re building the infrastructure layer for India&rsquo;s
              automotive aftermarket. A future where every mechanic, fleet owner,
              and car enthusiast can find any part, from any verified supplier,
              in minutes — not days.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <Link
              href="/search"
              id="story-vision-cta-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 32px",
                borderRadius: 12,
                background: "var(--paper)",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 16,
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              Start exploring
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "40px clamp(20px, 6vw, 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--ink)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--paper)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            f
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            FindMySpare
          </span>
        </Link>

        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Browse parts", href: "/search" },
            { label: "Sell with us", href: "/sell" },
            { label: "Sign in", href: "/login" },
            { label: "Homepage", href: "/" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: 13,
                color: "var(--ink-3)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          © 2026 FindMySpare · Made in India
        </span>
      </footer>
    </div>
  );
}
