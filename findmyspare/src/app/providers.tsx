"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { useVehicleStore } from "@/lib/vehicle-store";
import { ThemeProvider } from "@/lib/theme";
import { SessionSync } from "@/components/auth/SessionSync";

export function Providers({ children }: { children: React.ReactNode }) {
  // Persisted stores hydrate after mount so the first client render matches SSR.
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useVehicleStore.persist.rehydrate();
  }, []);
  return (
    <ThemeProvider>
      <SessionSync />
      <MotionConfig
        transition={{ duration: 0.2, ease: "easeOut" }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
