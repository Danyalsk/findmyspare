"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  HomeIcon,
  SearchIcon,
  UserIcon,
  PlusIcon,
  PackageIcon,
} from "@/lib/icons";

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
  { key: "me",       icon: UserIcon,   label: "Profile",  href: "/profile" },
];

const supplierTabs: Tab[] = [
  { key: "home",     icon: HomeIcon,    label: "Dash",     href: "/supplier" },
  { key: "products", icon: PackageIcon, label: "Products", href: "/supplier/products" },
  { key: "leads",    icon: PlusIcon,    label: "Leads",    href: "/supplier/leads", center: true },
  { key: "me",       icon: UserIcon,    label: "Profile",  href: "/profile" },
];

export interface TabBarProps {
  role: "buyer" | "supplier";
}

export function TabBar({ role }: TabBarProps) {
  const pathname = usePathname();
  const tabs = role === "buyer" ? buyerTabs : supplierTabs;

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
        "h-[78px] px-5 pb-5 pt-2",
        "flex justify-around items-start",
        "border-t border-line bg-paper",
      )}
    >
      {tabs.map((tab) => {
        const active = isActive(tab);
        const IconComp = tab.icon;

        if (tab.center) {
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={clsx(
                "flex flex-col items-center justify-center",
                "w-[52px] h-[52px] rounded-full",
                "bg-ink text-paper",
                "-mt-2.5",
                "active:scale-95 transition-transform"
              )}
            >
              <IconComp size={22} />
            </Link>
          );
        }

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={clsx(
              "flex flex-col items-center gap-1",
              "text-[10px] font-medium tracking-[0.04em]",
              "pt-2 px-0.5 relative",
              active ? "text-ink" : "text-ink-3",
              "transition-colors"
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-ink" />
            )}
            <IconComp size={22} className={active ? "" : ""} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
