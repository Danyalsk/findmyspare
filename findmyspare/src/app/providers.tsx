"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/lib/theme";
import { SessionSync } from "@/components/auth/SessionSync";

export function Providers({ children }: { children: React.ReactNode }) {
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
