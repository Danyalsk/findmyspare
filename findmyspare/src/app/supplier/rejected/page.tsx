"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/lib/icons";

export default function SupplierRejectedPage() {
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
        <Card className="!p-8">
          <h1 className="serif text-[28px] leading-tight mb-2">Verification rejected</h1>
          <p className="text-ink-3 text-sm mb-4">
            Your submission needs changes before we can approve it.
          </p>

          {user?.rejectionReason && (
            <Card variant="accent" className="!p-3 mb-5 !bg-danger-wash !border-transparent">
              <div className="text-xs mono uppercase tracking-[0.06em] text-[oklch(0.45_0.15_25)] mb-1">
                Reason
              </div>
              <div className="text-sm text-[oklch(0.45_0.15_25)]">{user.rejectionReason}</div>
            </Card>
          )}

          <Link href="/supplier/onboarding" className="block">
            <Button variant="primary" block>
              Edit and resubmit
              <ArrowRightIcon size={16} />
            </Button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-center text-sm text-ink-3 mt-3 hover:text-ink"
          >
            Sign out
          </button>
        </Card>
      </div>
    </div>
  );
}
