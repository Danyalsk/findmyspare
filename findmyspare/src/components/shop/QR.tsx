"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Inline SVG QR code (rendered locally; no network). */
export function QR({ value, size = 112, className }: { value: string; size?: number; className?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#1B1E24", light: "#FFFFFF" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [value]);
  // The SVG string comes from the qrcode library encoding our own URL.
  return <div role="img" aria-label={`QR code for ${value}`} className={className} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
