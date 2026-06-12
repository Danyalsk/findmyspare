import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// Derive prod CSP allowlist from the backend env so the demo deploy can talk
// to its Render API + WebSocket without a code change per deploy.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl;
const wsApiUrl = apiUrl.replace(/^http/, "ws");      // https → wss
const wsSocketUrl = socketUrl.replace(/^http/, "ws");

// Firebase Phone Auth (web) reaches identitytoolkit + recaptcha endpoints.
const FIREBASE_CONNECT = [
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
  "https://apis.google.com",
];

const prodConnectAllowlist = [
  "'self'",
  "https://www.findmyspare.com",
  apiUrl,
  socketUrl,
  wsApiUrl,
  wsSocketUrl,
  ...FIREBASE_CONNECT,
].filter(Boolean).join(" ");

// Dev: allow local API/socket origins so fetch from :5001 to :8000 isn't CSP-blocked.
const connectSrc = isDev
  ? `connect-src 'self' http://localhost:8000 ws://localhost:8000 http://localhost:* ws://localhost:* ${FIREBASE_CONNECT.join(" ")}`
  : `connect-src ${prodConnectAllowlist}`;

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Firebase Phone Auth requires loading apis.google.com and gstatic recaptcha.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.gstatic.com https://www.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      // Allow reCAPTCHA iframe used by Firebase Phone Auth.
      `frame-src 'self' https://www.google.com ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}` : ""}`,
      connectSrc,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      // upgrade-insecure-requests would force http://localhost → https in dev; prod only.
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  poweredByHeader: false,
  images: {
    // Serve AVIF/WebP, auto-resize, and edge-cache product/banner/chat images.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" }, // user uploads
      { protocol: "https", hostname: "images.unsplash.com" }, // seed/demo imagery
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30d
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Long-cache the optimizer output + immutable static assets.
      {
        source: "/_next/image",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
