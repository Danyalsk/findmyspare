"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  BackIcon, PackageIcon, PinIcon, WalletIcon,
  BellIcon, ShieldIcon, ArrowRightIcon, BoltIcon,
  TrendIcon, UserIcon
} from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

/* ═══════════════════════════════════════════════════════
   Profile — restyled with new design system
   Settings links, profile card, stats
   ═══════════════════════════════════════════════════════ */

const menuItems = [
  { icon: PackageIcon, label: "Order pipeline", href: "/buyer/orders" },
  { icon: PinIcon,     label: "Saved addresses", href: "#" },
  { icon: WalletIcon,  label: "Payment methods", href: "#" },
  { icon: BellIcon,    label: "Notifications",   href: "#" },
];

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <Link
          href="/buyer"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="serif text-[24px]">Profile</div>
      </div>

      <div className="px-5 pt-5 max-w-lg mx-auto w-full pb-[100px]">
        {/* Profile card */}
        <Card className="!p-4 flex gap-4 items-center">
          <Avatar initials={user?.name?.slice(0, 2) || "DK"} size="lg" color="oklch(0.55 0.10 200)" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[17px]">{user?.name || "Danyal Developer"}</div>
            <div className="text-[11px] text-ink-3 mt-0.5">{user?.email || "danyal@example.com"}</div>
            <Chip variant="ok" className="mt-2">
              <ShieldIcon size={10} /> Verified buyer
            </Chip>
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <Card className="!p-3 text-center">
            <div className="serif text-[24px]">₹48K</div>
            <div className="mono text-[9px] text-ink-3 tracking-[0.08em] mt-0.5">ESCROW SPEND</div>
          </Card>
          <Card className="!p-3 text-center">
            <div className="serif text-[24px]">14</div>
            <div className="mono text-[9px] text-ink-3 tracking-[0.08em] mt-0.5">REQUESTS</div>
          </Card>
          <Card className="!p-3 text-center">
            <div className="serif text-[24px]">8</div>
            <div className="mono text-[9px] text-ink-3 tracking-[0.08em] mt-0.5">ORDERS</div>
          </Card>
        </div>

        {/* Menu items */}
        <div className="mt-5 flex flex-col gap-1.5">
          {menuItems.map((item) => (
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

        {/* Supplier CTA */}
        <Link href="/supplier">
          <Card variant="accent" className="!p-3.5 mt-5 flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-[10px] bg-paper flex items-center justify-center flex-shrink-0">
              <BoltIcon size={18} className="text-accent-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-accent-ink">Become a supplier</div>
              <div className="text-[11px] text-accent-ink opacity-75">Start selling parts today</div>
            </div>
            <ArrowRightIcon size={16} className="text-accent-ink" />
          </Card>
        </Link>

        {/* Sign out */}
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
