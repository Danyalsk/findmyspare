"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  BackIcon, PinIcon, BellIcon, ShieldIcon, ArrowRightIcon, ClockIcon,
} from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";

const buyerMenu = [
  { icon: PinIcon, label: "Saved addresses", href: "#" },
  { icon: BellIcon, label: "Notifications", href: "#" },
];

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {}
    }
    logout();
    router.push("/");
  };

  const backHref =
    user?.role === "supplier"
      ? user.verificationStatus === "approved"
        ? "/supplier"
        : "/login"
      : user?.role === "admin"
      ? "/admin"
      : "/buyer";

  const renderBadge = () => {
    if (!user) return null;
    if (user.role === "admin") {
      return (
        <Chip variant="ok" className="mt-2">
          <ShieldIcon size={10} /> Administrator
        </Chip>
      );
    }
    if (user.role === "buyer") {
      return (
        <Chip variant="ok" className="mt-2">
          <ShieldIcon size={10} /> Buyer
        </Chip>
      );
    }
    // supplier
    switch (user.verificationStatus) {
      case "approved":
        return (
          <Chip variant="ok" className="mt-2">
            <ShieldIcon size={10} /> Verified supplier
          </Chip>
        );
      case "pending":
        return (
          <Chip variant="warn" className="mt-2">
            <ClockIcon size={10} /> Verification pending
          </Chip>
        );
      case "rejected":
        return (
          <Chip variant="danger" className="mt-2">
            Verification rejected
          </Chip>
        );
      default:
        return (
          <Link href="/supplier/onboarding">
            <Chip variant="warn" className="mt-2">Complete onboarding</Chip>
          </Link>
        );
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="px-5 pt-4 flex items-center gap-3">
        <Link
          href={backHref}
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="serif text-[24px]">Profile</div>
      </div>

      <div className="px-5 pt-5 max-w-lg mx-auto w-full pb-[100px]">
        <Card className="!p-4 flex gap-4 items-center">
          <Avatar initials={user?.name?.slice(0, 2) || "?"} size="lg" color="oklch(0.55 0.10 200)" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[17px]">{user?.name || "—"}</div>
            <div className="text-[11px] text-ink-3 mt-0.5">{user?.email || ""}</div>
            {renderBadge()}
          </div>
        </Card>

        {user?.role === "supplier" && user.verificationStatus === "approved" && (
          <Card className="!p-4 mt-4">
            <div className="text-xs mono uppercase tracking-[0.06em] text-ink-3 mb-2">
              Business
            </div>
            <div className="text-sm">{user.businessName || "—"}</div>
            <div className="text-xs text-ink-3 mt-1">GSTIN: {user.gstNumber || "—"}</div>
            <div className="text-xs text-ink-3">Phone: +91 {user.phone || "—"}</div>
          </Card>
        )}

        {user?.role === "buyer" && (
          <div className="mt-5 flex flex-col gap-1.5">
            {buyerMenu.map((item) => (
              <Link key={item.label} href={item.href}>
                <Card className="!p-3 flex items-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                  <div className="w-9 h-9 rounded-[10px] bg-paper-2 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} />
                  </div>
                  <span className="text-[13px] font-medium flex-1">{item.label}</span>
                  <ArrowRightIcon size={16} className="text-ink-3" />
                </Card>
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3 text-center text-danger text-[13px] font-medium hover:bg-danger-wash rounded-[12px] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
