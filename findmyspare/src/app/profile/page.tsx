"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  BackIcon,
  PinIcon,
  BellIcon,
  ShieldIcon,
  ArrowRightIcon,
  ClockIcon,
  PackageIcon,
  ChatIcon,
  WalletIcon,
  UserIcon,
} from "@/lib/icons";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";

const buyerMenu = [
  { icon: UserIcon,    label: "Edit profile",    href: "/profile/edit" },
  { icon: PackageIcon, label: "My orders",       href: "/buyer/orders" },
  { icon: PinIcon,     label: "Saved addresses", href: "/profile/addresses" },
  { icon: ChatIcon,    label: "Messages",        href: "/messages" },
  { icon: BellIcon,    label: "Notifications",   href: "/profile/notifications" },
];

const supplierMenu = [
  { icon: UserIcon,    label: "Edit profile",    href: "/profile/edit" },
  { icon: PackageIcon, label: "Inventory",        href: "/supplier/inventory" },
  { icon: WalletIcon,  label: "Orders",          href: "/supplier/orders" },
  { icon: ChatIcon,    label: "Messages",        href: "/messages" },
  { icon: BellIcon,    label: "Notifications",   href: "/profile/notifications" },
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
        <Chip variant="accent" size="md" dot>
          <ShieldIcon size={11} /> Administrator
        </Chip>
      );
    }
    if (user.role === "buyer") {
      return (
        <Chip variant="ok" size="md" dot>
          <ShieldIcon size={11} /> Buyer
        </Chip>
      );
    }
    switch (user.verificationStatus) {
      case "approved":
        return (
          <Chip variant="ok" size="md" dot>
            <ShieldIcon size={11} /> Verified supplier
          </Chip>
        );
      case "pending":
        return (
          <Chip variant="warn" size="md" dot>
            <ClockIcon size={11} /> Verification pending
          </Chip>
        );
      case "rejected":
        return (
          <Chip variant="danger" size="md" dot>
            Verification rejected
          </Chip>
        );
      default:
        return (
          <Link href="/supplier/onboarding">
            <Chip variant="warn" size="md" dot>
              Complete onboarding
            </Chip>
          </Link>
        );
    }
  };

  const menu = user?.role === "supplier" ? supplierMenu : buyerMenu;

  return (
    <div className="min-h-dvh bg-paper-3 pb-24 md:pb-12">
      {/* Hero with avatar */}
      <div className="relative overflow-hidden bg-paper rounded-b-[28px] shadow-[var(--shadow-card)]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(500px 240px at 100% 0%, rgba(252,128,25,0.18) 0%, rgba(252,128,25,0) 65%)",
          }}
        />
        <div className="relative px-5 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <Link
              href={backHref}
              className="w-10 h-10 rounded-full bg-paper-2 hover:bg-paper-3 flex items-center justify-center fms-press"
              aria-label="Back"
            >
              <BackIcon size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 h-8 rounded-full bg-danger-wash text-[color:var(--danger)] text-[12px] font-bold fms-press"
            >
              Sign out
            </button>
          </div>

          <div className="mt-5 flex flex-col items-center text-center">
            <div className="relative">
              <Avatar
                initials={user?.name?.slice(0, 2).toUpperCase() || "?"}
                size="lg"
                color="#FC8019"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[color:var(--success)] border-2 border-paper" />
            </div>
            <div className="display text-[22px] text-ink mt-3 leading-tight">
              {user?.name || "—"}
            </div>
            <div className="text-[12px] text-ink-3 font-medium mt-0.5">
              {user?.email || ""}
            </div>
            <div className="mt-3">{renderBadge()}</div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 max-w-xl mx-auto w-full">
        {/* Business card for verified suppliers */}
        {user?.role === "supplier" && user.verificationStatus === "approved" && (
          <div className="bg-paper rounded-[16px] p-4 shadow-[var(--shadow-card)] mb-4">
            <div className="text-[10px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase mb-2">
              Business
            </div>
            <div className="display text-[16px] text-ink leading-tight">
              {user.businessName || "—"}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.gstNumber && (
                <Chip variant="default" size="sm">
                  GSTIN: {user.gstNumber}
                </Chip>
              )}
              {user.phone && (
                <Chip variant="default" size="sm">
                  +91 {user.phone}
                </Chip>
              )}
            </div>
          </div>
        )}

        {/* Quick menu */}
        {user?.role !== "admin" && (
          <div className="bg-paper rounded-[16px] shadow-[var(--shadow-card)] overflow-hidden">
            {menu.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 fms-press ${
                  i < menu.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-accent-wash flex items-center justify-center text-[color:var(--accent-ink)] flex-shrink-0">
                  <item.icon size={18} />
                </div>
                <span className="text-[14px] font-bold text-ink flex-1">
                  {item.label}
                </span>
                <ArrowRightIcon size={16} className="text-ink-3" />
              </Link>
            ))}
          </div>
        )}

        {/* Become a supplier — buyers only */}
        {user?.role === "buyer" && (
          <Link
            href="/sell"
            className="mt-4 bg-ink text-paper rounded-[16px] p-4 flex items-center gap-3 fms-press"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <PackageIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold leading-tight">Become a supplier</div>
              <div className="text-[11px] opacity-70 mt-0.5">
                Sell parts to verified buyers across India.
              </div>
            </div>
            <ArrowRightIcon size={16} className="opacity-70" />
          </Link>
        )}

        {/* Help / safety strip */}
        <div className="mt-4 bg-accent-wash rounded-[16px] p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-paper flex items-center justify-center text-[color:var(--accent-ink)] flex-shrink-0">
            <ShieldIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-ink leading-tight">
              Need help?
            </div>
            <div className="text-[11px] text-ink-2 mt-0.5">
              Connect directly with verified suppliers. Reach out anytime via chat.
            </div>
          </div>
          <ArrowRightIcon size={16} className="text-ink-3" />
        </div>
      </div>
    </div>
  );
}
