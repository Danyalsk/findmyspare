"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { bizApi, BUSINESS_ROLE_LABEL, type BizMe } from "@/lib/api/v3";
import { getErrorMessage } from "@/lib/errors";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Skel } from "@/components/shop/ui";
import { BI, ErrorCard } from "./kit";

/* Business OS shell: auth gate, live /biz/me context, desktop rail + mobile tabs. */

interface BizCtx {
  me: BizMe["me"];
  today: BizMe["today"];
  /** Verified seller (role supplier, approved): billing, buyers, price lists, import. */
  isSeller: boolean;
  reload: () => void;
}
const Ctx = createContext<BizCtx | null>(null);
export function useBiz() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBiz outside BizShell");
  return c;
}

// Set while signing out so the gate doesn't bounce to /login before "/" loads.
let leaving = false;
export function markSigningOut() { leaving = true; }

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: number; match?: (p: string) => boolean };

function isActive(item: NavItem, path: string) {
  if (item.match) return item.match(path);
  return item.href === "/biz" ? path === "/biz" : path.startsWith(item.href);
}

export function BizShell({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname() ?? "/biz";
  const [state, setState] = useState<{ uid: string; data?: BizMe; error?: string } | null>(null);
  const [nonce, setNonce] = useState(0);

  const role = user?.role as string | undefined;
  const allowed = !!(isHydrated && user && user.profileCompleted && (role === "buyer" || (role === "supplier" && user.verificationStatus === "approved")));
  const uid = user?.id;

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { if (!leaving) router.replace(`/login?next=${encodeURIComponent(pathname)}`); return; }
    leaving = false;
    if (!user.profileCompleted) { router.replace("/complete-profile"); return; }
    if (role === "admin" || role === "super_admin") { router.replace("/admin"); return; }
    if (role === "supplier" && user.verificationStatus !== "approved") router.replace(getPostLoginPath(user));
  }, [isHydrated, user, role, router, pathname]);

  // Live task counts; refetched on every navigation so badges stay true.
  useEffect(() => {
    if (!allowed || !uid) return;
    let alive = true;
    bizApi.me()
      .then((data) => { if (alive) setState({ uid, data }); })
      .catch((e) => { if (alive) setState((s) => (s?.uid === uid && s.data ? s : { uid, error: getErrorMessage(e, "Couldn't load your business") })); });
    return () => { alive = false; };
  }, [allowed, uid, pathname, nonce]);

  const data = state && state.uid === uid ? state.data : undefined;
  const error = state && state.uid === uid ? state.error : undefined;
  const isSeller = role === "supplier" && user?.verificationStatus === "approved";
  const hasRoles = !!data?.me.businessRoles?.length;
  const needsSetup = !!data && !isSeller && !hasRoles && !pathname.startsWith("/biz/setup");

  // Buyers without a business role start at setup (pick technician, fleet...).
  useEffect(() => {
    if (needsSetup) router.replace("/biz/setup");
  }, [needsSetup, router]);

  if (!allowed) return null;

  if (!data) {
    return (
      <div className="min-h-dvh bg-paper md:pl-[248px]">
        <div className="max-w-[920px] mx-auto px-4 md:px-8 pt-6 space-y-3">
          {error ? <ErrorCard message={error} onRetry={() => setNonce((n) => n + 1)} /> : <><Skel className="h-10 w-2/3" /><Skel className="h-28" /><Skel className="h-28" /></>}
        </div>
      </div>
    );
  }
  if (needsSetup) return null;

  const t = data.today;
  const ordersBadge = t.pos_to_accept + t.pos_to_ship + t.pos_to_receive;
  const primary: NavItem[] = [
    { href: "/biz", label: "Home", icon: BI.home },
    isSeller ? { href: "/biz/bill", label: "Bill", icon: BI.bill, match: (p) => p.startsWith("/biz/bill") } : { href: "/biz/network", label: "Suppliers", icon: BI.users },
    { href: "/biz/orders", label: "Orders", icon: BI.box, badge: ordersBadge, match: (p) => p.startsWith("/biz/orders") || p.startsWith("/biz/order/") },
    { href: "/biz/khata", label: "Khata", icon: BI.book },
  ];
  const rail: NavItem[] = [
    ...primary,
    ...(isSeller ? [{ href: "/biz/network", label: "Network", icon: BI.users, badge: t.link_requests }] : []),
    ...(isSeller
      ? [
          { href: "/biz/radar", label: "Demand radar", icon: BI.radar },
          { href: "/biz/price-lists", label: "Price lists", icon: BI.tag },
          { href: "/biz/import", label: "Import catalog", icon: BI.upload },
        ]
      : []),
    { href: "/biz/more", label: "More", icon: BI.more },
  ];
  const mobile: NavItem[] = [...primary, { href: "/biz/more", label: "More", icon: BI.more, badge: isSeller ? t.link_requests : 0 }];
  const name = data.me.businessName ?? data.me.name ?? "My business";

  return (
    <Ctx.Provider value={{ me: data.me, today: t, isSeller, reload: () => setNonce((n) => n + 1) }}>
      <div className="min-h-dvh bg-paper">
        {/* Desktop rail */}
        <aside className="hidden md:flex no-print fixed inset-y-0 left-0 w-[248px] flex-col border-r border-line bg-paper z-[60]">
          <Link href="/biz" className="h-[68px] px-5 flex items-center gap-2 border-b border-line" aria-label="Business home">
            <Logo size={24} />
          </Link>
          <div className="px-5 py-4">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[color:var(--accent)]">Business OS</div>
            <div className="text-[15px] font-extrabold tracking-tight truncate mt-0.5">{name}</div>
            <div className="text-[12.5px] text-ink-3 font-semibold truncate">
              {[data.me.businessRoles?.[0] ? BUSINESS_ROLE_LABEL[data.me.businessRoles[0]] : null, data.me.city].filter(Boolean).join(" · ") || "Set up your business"}
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5" aria-label="Business">
            {rail.map((i) => {
              const on = isActive(i, pathname);
              return (
                <Link key={i.href + i.label} href={i.href} aria-current={on ? "page" : undefined}
                  className={clsx("flex items-center gap-3 h-11 px-3 rounded-[12px] text-[14.5px] font-bold transition-colors", on ? "bg-[color:var(--accent-wash)] text-[color:var(--accent-ink)]" : "text-ink-2 hover:bg-paper-2 hover:text-ink")}>
                  <i.icon size={20} />
                  <span className="flex-1">{i.label}</span>
                  {!!i.badge && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[color:var(--accent)] text-white text-[11.5px] font-extrabold inline-flex items-center justify-center">{i.badge}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-line">
            <Link href="/profile" className="flex items-center gap-3 h-11 px-3 rounded-[12px] text-[14px] font-bold text-ink-2 hover:bg-paper-2">
              <span className="w-7 h-7 rounded-full bg-ink text-paper flex items-center justify-center text-[12px] font-extrabold">{(user?.name ?? "U").slice(0, 1).toUpperCase()}</span>
              <span className="truncate">{user?.name ?? "Account"}</span>
            </Link>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="md:hidden no-print sticky top-0 z-[60] bg-paper/95 backdrop-blur-md border-b border-line h-[56px] px-4 flex items-center gap-2.5">
          <Link href="/biz" aria-label="Business home"><LogoMark size={28} /></Link>
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-extrabold tracking-tight truncate leading-tight">{name}</div>
            <div className="text-[11.5px] text-ink-3 font-semibold truncate leading-tight">{data.me.city ?? "Business OS"}</div>
          </div>
          {isSeller && (
            <Link href="/biz/bill" className="h-9 px-3.5 rounded-[10px] bg-[color:var(--accent)] text-white text-[13px] font-extrabold inline-flex items-center gap-1.5">
              <BI.plus size={16} /> Bill
            </Link>
          )}
        </header>

        <main className="md:pl-[248px] pb-[84px] md:pb-0 min-w-0 print:p-0">{children}</main>

        {/* Mobile tabs */}
        <nav className="md:hidden no-print fixed bottom-0 inset-x-0 z-[90] bg-paper border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Business">
          <div className="grid grid-cols-5 h-[64px]">
            {mobile.map((i) => {
              const on = isActive(i, pathname);
              return (
                <Link key={i.href + i.label} href={i.href} aria-current={on ? "page" : undefined}
                  className={clsx("relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold", on ? "text-[color:var(--accent)]" : "text-ink-3")}>
                  <span className="relative">
                    <i.icon size={22} />
                    {!!i.badge && <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[color:var(--accent)] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-paper">{i.badge}</span>}
                  </span>
                  {i.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </Ctx.Provider>
  );
}
