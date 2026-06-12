"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  HomeIcon,
  SearchIcon,
  UserIcon,
  PlusIcon,
  PackageIcon,
  ChatIcon,
} from "@/lib/icons";
import { getUnreadCount } from "@/lib/api/messages";
import { useSocket } from "@/lib/socket";

interface Tab {
  key: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  href: string;
  center?: boolean;
}

const buyerTabs: Tab[] = [
  { key: "home",     icon: HomeIcon,   label: "Home",     href: "/buyer" },
  { key: "browse",   icon: SearchIcon, label: "Browse",   href: "/search" },
  { key: "requests", icon: PlusIcon,   label: "Request",  href: "/buyer/requests", center: true },
  { key: "messages", icon: ChatIcon,   label: "Inbox",    href: "/messages" },
  { key: "me",       icon: UserIcon,   label: "Account",  href: "/profile" },
];

const supplierTabs: Tab[] = [
  { key: "home",      icon: HomeIcon,    label: "Dash",      href: "/supplier" },
  { key: "inventory", icon: PackageIcon, label: "Inventory", href: "/supplier/inventory" },
  { key: "leads",     icon: PlusIcon,    label: "Leads",     href: "/supplier/leads", center: true },
  { key: "messages", icon: ChatIcon,    label: "Inbox",    href: "/messages" },
  { key: "me",       icon: UserIcon,    label: "Account",  href: "/profile" },
];

export interface TabBarProps {
  role: "buyer" | "supplier";
}

export function TabBar({ role }: TabBarProps) {
  const pathname = usePathname();
  const tabs = role === "buyer" ? buyerTabs : supplierTabs;
  const socket = useSocket();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { unread } = await getUnreadCount();
      setUnread(unread);
    } catch {
      /* ignore */
    }
  }, []);

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

  const isActive = (tab: Tab) => {
    if (tab.href === "/buyer" || tab.href === "/supplier") {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <nav
      className={clsx(
        "md:hidden fixed bottom-0 left-0 right-0 z-50",
        "h-[80px] px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2",
        "flex justify-around items-start",
        "bg-paper/95 backdrop-blur-xl",
        "shadow-[var(--shadow-sticky)]",
      )}
      aria-label="Primary navigation"
    >
      {tabs.map((tab) => {
        const active = isActive(tab);
        const IconComp = tab.icon;
        const showBadge = tab.key === "messages" && unread > 0;

        if (tab.center) {
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={clsx(
                "relative flex flex-col items-center justify-center",
                "w-[58px] h-[58px] rounded-full",
                "bg-[color:var(--accent)] text-white",
                "",
                "-mt-5 fms-press",
              )}
              aria-label={tab.label}
            >
              <IconComp size={26} />
              {/* Subtle ring around the FAB */}
              <span className="absolute inset-0 rounded-full ring-4 ring-paper" />
              <span className="absolute -bottom-5 text-[10px] font-semibold text-ink tracking-tight">
                {tab.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={clsx(
              "flex flex-col items-center gap-1",
              "min-w-[56px] py-1.5 relative",
              "text-[11px] font-semibold tracking-tight",
              "transition-colors",
              active ? "text-[color:var(--accent-ink)]" : "text-ink-3",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={clsx(
                "relative flex items-center justify-center w-9 h-9 rounded-full transition-all",
                active && "bg-accent-wash",
              )}
            >
              <IconComp size={22} />
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-discount text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
