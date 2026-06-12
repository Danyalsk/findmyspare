"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { TabBar } from "@/components/layout/TabBar";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login?next=/buyer");
      return;
    }
    if (!user.profileCompleted) {
      router.replace("/complete-profile");
      return;
    }
    if (user.role !== "buyer") router.replace(getPostLoginPath(user));
  }, [user, isHydrated, router]);

  if (!isHydrated || !user || !user.profileCompleted || user.role !== "buyer") return null;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DesktopNav />
      <main className="flex-1 flex flex-col pb-[78px] md:pb-0">{children}</main>
      <TabBar role="buyer" />
    </div>
  );
}
