"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClockIcon } from "@/lib/icons";

export default function SupplierPendingPage() {
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {}
    }
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <Card className="text-center !p-8">
          <div className="w-14 h-14 rounded-full bg-accent-wash flex items-center justify-center mx-auto mb-4 text-accent-ink">
            <ClockIcon size={26} />
          </div>
          <h1 className="serif text-[28px] leading-tight mb-2">Verification in progress</h1>
          <p className="text-ink-3 text-sm mb-1">
            Hi {user?.name || "there"} — we&apos;ve received your details.
          </p>
          <p className="text-ink-3 text-sm mb-6">
            Admin typically reviews within 24 hours. We&apos;ll notify you by email.
          </p>
          <Button variant="default" block onClick={handleLogout}>
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
