"use client";

import { LogoTile } from "@/components/brand/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { User } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  superOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/network", label: "Network" },
  { href: "/admin/network/businesses", label: "Businesses" },
  { href: "/admin/network/taxonomy", label: "Taxonomy" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/audit-log", label: "Audit log" },
  { href: "/admin/health", label: "System health" },
  { href: "/admin/config", label: "Platform config", superOnly: true },
  { href: "/admin/runbook", label: "Runbook", superOnly: true },
];

const EXACT = new Set(["/admin", "/admin/network"]);

export function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSuper = user.role === "super_admin";
  // "/admin" and "/admin/network" have child pages with their own nav entries.
  const isActive = (href: string) => pathname === href || (!EXACT.has(href) && pathname.startsWith(href + "/"));
  const items = NAV.filter((i) => !i.superOnly || isSuper);

  return (
    <div className="min-h-screen bg-paper-3 flex">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-line bg-paper px-4 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-6 px-2">
          <LogoTile size={32} />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold tracking-tight">Admin</span>
            <span className={clsx(
              "text-[10px] font-bold mono tracking-wider uppercase",
              isSuper ? "text-[color:var(--danger)]" : "text-ink-3"
            )}>
              {isSuper ? "super_admin" : "admin"}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.filter((i) => !i.superOnly || isSuper).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors",
                  active
                    ? "bg-accent-wash text-accent-ink"
                    : "text-ink-2 hover:bg-paper-2"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 px-2 border-t border-line">
          <div className="text-[11px] text-ink-3 mono tracking-wider uppercase mb-1">
            Signed in as
          </div>
          <div className="text-[13px] font-semibold text-ink truncate">{user.name}</div>
          <div className="text-[11px] text-ink-3 truncate">{user.email}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 px-4 h-12 border-b border-line bg-paper">
          <LogoTile size={28} />
          <span className="text-[14px] font-semibold">Admin</span>
          <span className={clsx(
            "ml-auto text-[10px] font-bold mono tracking-wider uppercase",
            isSuper ? "text-[color:var(--danger)]" : "text-ink-3"
          )}>
            {isSuper ? "super_admin" : "admin"}
          </span>
        </div>

        {/* Mobile nav: scrolls sideways inside its own strip */}
        <nav aria-label="Admin sections" className="md:hidden flex gap-1.5 overflow-x-auto scroll-hidden px-4 py-2 border-b border-line bg-paper">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex-shrink-0 h-8 px-3 inline-flex items-center rounded-full text-[12.5px] font-semibold whitespace-nowrap",
                isActive(item.href) ? "bg-accent-wash text-accent-ink" : "bg-paper-2 text-ink-2"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
