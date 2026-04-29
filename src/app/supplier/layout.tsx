"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { TabBar } from "@/components/layout/TabBar";

const GATE_EXEMPT = ["/supplier/onboarding", "/supplier/pending", "/supplier/rejected"];

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const inGateExempt = GATE_EXEMPT.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login?next=/supplier");
      return;
    }
    if (user.role !== "supplier") {
      router.replace(getPostLoginPath(user));
      return;
    }
    if (!inGateExempt && user.verificationStatus !== "approved") {
      router.replace(getPostLoginPath(user));
    }
  }, [user, isHydrated, router, inGateExempt]);

  if (!isHydrated || !user || user.role !== "supplier") return null;
  if (!inGateExempt && user.verificationStatus !== "approved") return null;

  // Minimal shell while not approved (onboarding/pending/rejected)
  if (inGateExempt && user.verificationStatus !== "approved") {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DesktopNav />
      <main className="flex-1 flex flex-col pb-[78px] md:pb-0">{children}</main>
      <TabBar role="supplier" />
    </div>
  );
}
