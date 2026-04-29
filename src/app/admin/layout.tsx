"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { DesktopNav } from "@/components/layout/DesktopNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "admin") router.replace(getPostLoginPath(user));
  }, [user, isHydrated, router]);

  if (!isHydrated || !user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DesktopNav />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
