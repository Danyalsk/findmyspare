"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { ShopShell } from "./AppShell";

/** Logged-in shopper/garage area: login + profile gate, then the shop shell. */
export function BuyerGate({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.replace(`/login?next=${encodeURIComponent(path ?? "/")}`); return; }
    if (!user.profileCompleted) { router.replace("/complete-profile"); return; }
    if (user.role !== "buyer") router.replace(getPostLoginPath(user));
  }, [user, isHydrated, router, path]);

  if (!isHydrated || !user || !user.profileCompleted || user.role !== "buyer") return null;
  return <ShopShell footer={false}>{children}</ShopShell>;
}
