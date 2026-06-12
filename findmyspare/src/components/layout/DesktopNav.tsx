"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { clsx } from "clsx";
import {
  SearchIcon,
  PackageIcon,
  UserIcon,
  PlusIcon,
  ChatIcon,
  PinIcon,
  TruckIcon,
} from "@/lib/icons";
import { useAuthStore } from "@/lib/store";
import { useSocket } from "@/lib/socket";
import { getUnreadCount } from "@/lib/api/messages";

interface NavLink {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const buyerLinks: NavLink[] = [
  { href: "/search",         label: "Browse",      icon: SearchIcon },
  { href: "/buyer/requests", label: "My Requests", icon: PlusIcon },
  { href: "/messages",       label: "Inbox",       icon: ChatIcon },
];

const supplierLinks: NavLink[] = [
  { href: "/supplier",          label: "Dashboard" },
  { href: "/supplier/leads",     label: "Leads",     icon: PlusIcon },
  { href: "/supplier/inventory", label: "Inventory", icon: PackageIcon },
  { href: "/supplier/orders",    label: "Orders",    icon: TruckIcon },
  { href: "/messages",           label: "Inbox",     icon: ChatIcon },
];

const adminLinks: NavLink[] = [
  { href: "/admin",            label: "Overview" },
  { href: "/admin/users",      label: "Users" },
  { href: "/admin/suppliers",  label: "Suppliers" },
  { href: "/admin/inquiries",  label: "Inquiries" },
  { href: "/admin/products",   label: "Products" },
  { href: "/admin/banners",    label: "Banners" },
];

export function DesktopNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user || user.role === "admin" || user.role === "super_admin") return;
    try {
      const { unread } = await getUnreadCount();
      setUnread(unread);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh, pathname]);

  useEffect(() => {
    if (!socket) return;
    socket.on("message:new", refresh);
    socket.on("message:read", refresh);
    return () => {
      socket.off("message:new", refresh);
      socket.off("message:read", refresh);
    };
  }, [socket, refresh]);

  const links =
    user?.role === "supplier"
      ? supplierLinks
      : user?.role === "admin" || user?.role === "super_admin"
      ? adminLinks
      : buyerLinks;

  return (
    <nav className="hidden md:flex sticky top-0 z-[100] bg-paper/95 backdrop-blur-xl shadow-[var(--shadow-sm)]">
      <div className="max-w-screen-xl mx-auto w-full px-6 lg:px-10 h-[68px] flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-[10px] bg-[color:var(--accent)] flex items-center justify-center text-white font-extrabold text-lg">
            f
          </div>
          <span className="display text-[17px] text-ink">FindMySpare</span>
        </Link>

        {/* Location pill — Swiggy hallmark */}
        {user?.role !== "admin" && (
          <button
            type="button"
            className="hidden lg:flex items-center gap-2 px-3 h-10 rounded-full hover:bg-paper-2 transition-colors flex-shrink-0"
            aria-label="Change location"
          >
            <PinIcon size={16} className="text-[color:var(--accent)]" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] font-bold text-ink-3 uppercase tracking-wider">
                Deliver to
              </span>
              <span className="text-[12px] font-bold text-ink">Mumbai</span>
            </div>
          </button>
        )}

        {/* Nav links */}
        <div className="flex items-center gap-1 ml-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/supplier" &&
                link.href !== "/admin" &&
                pathname.startsWith(link.href));
            const isMessages = link.href === "/messages";

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-2 px-3 h-10 rounded-full text-[13px] font-bold transition-all",
                  active
                    ? "bg-accent-wash text-[color:var(--accent-ink)]"
                    : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                )}
              >
                {Icon && (
                  <span className="relative">
                    <Icon size={16} />
                    {isMessages && unread > 0 && (
                      <span className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-discount text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </span>
                )}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: account */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 h-10 rounded-full bg-paper-2 hover:bg-paper-3 transition-colors"
            aria-label="Profile"
          >
            <UserIcon size={16} />
            <span className="text-[13px] font-bold text-ink hidden xl:inline">
              {user?.name?.split(" ")[0] || "Account"}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
