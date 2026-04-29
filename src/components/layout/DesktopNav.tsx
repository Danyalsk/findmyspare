"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  SearchIcon,
  PackageIcon,
  UserIcon,
  PlusIcon,
} from "@/lib/icons";
import { useAuthStore } from "@/lib/store";

interface NavLink {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const buyerLinks: NavLink[] = [
  { href: "/search",         label: "Browse Parts", icon: SearchIcon },
  { href: "/buyer/requests", label: "My Requests" },
];

const supplierLinks: NavLink[] = [
  { href: "/supplier",          label: "Dashboard" },
  { href: "/supplier/leads",    label: "Leads",    icon: PlusIcon },
  { href: "/supplier/products", label: "Products", icon: PackageIcon },
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

  const links =
    user?.role === "supplier"
      ? supplierLinks
      : user?.role === "admin"
      ? adminLinks
      : buyerLinks;

  return (
    <nav className="hidden md:flex sticky top-0 z-[100] bg-paper/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[9px] bg-ink flex items-center justify-center text-paper font-semibold font-serif text-xl italic">
            f
          </div>
          <span className="font-semibold text-ink tracking-[-0.01em] text-[15px] group-hover:text-accent-ink transition-colors">
            FindMySpare
          </span>
        </Link>

        <div className="flex items-center gap-8 ml-10">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== "/supplier" && link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-1.5 text-[13px] font-medium transition-colors",
                  active ? "text-accent-ink" : "text-ink-3 hover:text-ink"
                )}
              >
                {Icon ? <Icon size={16} /> : null}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-3 hover:text-ink hover:bg-paper-2 transition-all"
          >
            <UserIcon size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
