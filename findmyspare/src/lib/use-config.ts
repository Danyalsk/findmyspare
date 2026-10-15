"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export type PaymentsMode = "mock" | "off";
let cached: PaymentsMode | null = null;

/** Server feature flags (GET /config). `null` while loading. */
export function usePaymentsMode(): PaymentsMode | null {
  const [mode, setMode] = useState<PaymentsMode | null>(cached);
  useEffect(() => {
    if (cached) return;
    fetch(`${API_URL}/config`)
      .then((r) => r.json())
      .then((c: { payments?: PaymentsMode }) => { cached = c.payments === "mock" ? "mock" : "off"; setMode(cached); })
      .catch(() => { cached = "off"; setMode("off"); });
  }, []);
  return mode;
}

export const PAYMENTS_SOON = "Online payments are launching soon.";
