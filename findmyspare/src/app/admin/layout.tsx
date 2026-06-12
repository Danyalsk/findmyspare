"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      router.replace(getPostLoginPath(user));
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !user || (user.role !== "admin" && user.role !== "super_admin"))
    return null;

  return <AdminShell user={user}>{children}</AdminShell>;
}
