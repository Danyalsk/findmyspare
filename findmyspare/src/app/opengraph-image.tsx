import { ImageResponse } from "next/og";

export const alt = "FindMySpare — India's auto parts marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #064e3b 0%, #000000 60%)",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 80,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="68" height="68" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="g" x1="0" x2="32" y1="0" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#34d399" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="13" fill="none" stroke="url(#g)" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="5" fill="url(#g)" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
            FindMySpare
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              border: "1px solid rgba(52,211,153,0.35)",
              background: "rgba(16,185,129,0.12)",
              borderRadius: 999,
              alignSelf: "flex-start",
              fontSize: 20,
              color: "#6ee7b7",
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#34d399",
              }}
            />
            Verified suppliers · live quotes
          </div>

          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Sell more parts.</span>
            <span style={{ color: "#34d399", fontStyle: "italic" }}>
              Less hustle.
            </span>
          </div>

          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 880,
              lineHeight: 1.35,
            }}
          >
            India&apos;s trusted auto-parts marketplace. Verified suppliers,
            live quotes, direct contact.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          findmyspare.com
        </div>
      </div>
    ),
    { ...size }
  );
}
