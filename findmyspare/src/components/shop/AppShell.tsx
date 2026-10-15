"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useAuthStore, getPostLoginPath } from "@/lib/store";
import { useCartStore } from "@/lib/cart-store";
import { useVehicleStore, vehicleShortLabel } from "@/lib/vehicle-store";
import { garageApi, inr, type Garage } from "@/lib/api/v2";
import { VehiclePicker } from "./VehiclePicker";
import { useMounted } from "@/lib/use-mounted";

// ─── "Does this user run a garage?" (cached per session) ───
let garageCache: { userId: string; garage: Garage | null } | null = null;
export function useMyGarage() {
  const user = useAuthStore((s) => s.user);
  const eligible = !!user && user.role === "buyer" && user.profileCompleted;
  const [state, setState] = useState<{ userId: string; garage: Garage | null } | null>(null);
  const known = state && user && state.userId === user.id ? state : garageCache && user && garageCache.userId === user.id ? garageCache : null;
  // undefined = still loading; null = this user has no garage.
  const garage = !eligible ? null : known ? known.garage : undefined;
  useEffect(() => {
    if (!eligible || !user || garageCache?.userId === user.id) return;
    garageApi.me()
      .then((r) => { garageCache = { userId: user.id, garage: r.garage }; setState(garageCache); })
      .catch(() => setState({ userId: user.id, garage: null }));
  }, [eligible, user]);
  return { garage, refresh: (g: Garage | null) => { if (user) { garageCache = { userId: user.id, garage: g }; setState(garageCache); } } };
}

const Icon = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  cart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>,
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>,
  req: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 5h16v11H8l-4 4z" /><path d="M9 10h6M12 7v6" /></svg>,
  car: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M5 16V11l2-5h10l2 5v5" /><path d="M3 16h18v3h-3M6 19H3" /><circle cx="7.5" cy="13.5" r="1" /><circle cx="16.5" cy="13.5" r="1" /></svg>,
  wrench: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0 5 5l-8.6 8.6a2.1 2.1 0 0 1-3-3z" /><path d="M14.7 6.3 17 4l3 3-2.3 2.3" /></svg>,
  user: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
  pin: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5" /></svg>,
};

function SearchBox({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }}
      className={clsx("flex-1", compact ? "" : "max-w-xl")}
      role="search"
    >
      <label className="h-11 rounded-[14px] bg-paper-2 border border-transparent focus-within:border-[color:var(--accent)] focus-within:bg-paper flex items-center px-3.5 gap-2.5 text-ink-3 transition-colors">
        {Icon.search}
        <input
          className="flex-1 bg-transparent outline-none text-[14.5px] font-medium text-ink placeholder:text-ink-4"
          placeholder="Search “brake pads”, “Swift clutch”, part no…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search parts"
        />
      </label>
    </form>
  );
}

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const storeHydrated = useAuthStore((s) => s.isHydrated);
  const mounted = useMounted();
  const hydrated = storeHydrated && mounted;
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const vehicle = useVehicleStore((s) => s.selected);
  const { garage } = useMyGarage();
  const path = usePathname();
  const router = useRouter();
  const [picker, setPicker] = useState(false);

  // Suppliers/admins have their own consoles.
  useEffect(() => {
    if (hydrated && user && user.role !== "buyer") router.replace(getPostLoginPath(user));
  }, [hydrated, user, router]);

  const links = [
    { href: "/search", label: "Shop parts" },
    { href: "/buyer/requests", label: "Get quotes" },
    { href: "/vehicles", label: "My vehicles" },
    ...(garage ? [{ href: "/workshop", label: "Workshop" }] : []),
    { href: "/buyer/orders", label: "Orders" },
  ];

  return (
    <>
      <header className="sticky top-0 z-[100] bg-paper/95 backdrop-blur-md border-b border-line no-print">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-[68px] flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex-shrink-0" aria-label="FindMySpare home">
            <span className="hidden sm:inline-flex"><Logo size={26} /></span>
            <span className="sm:hidden"><LogoMark size={30} /></span>
          </Link>

          <button onClick={() => setPicker(true)} className="flex items-center gap-2 min-w-0 text-left group" aria-label="Choose your vehicle">
            <span className="hidden md:flex w-9 h-9 rounded-full bg-[color:var(--accent-wash)] text-[color:var(--accent)] items-center justify-center flex-shrink-0">{Icon.car}</span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold text-ink-3 uppercase tracking-wide">Parts for</span>
              <span className="flex items-center gap-1 text-[14px] font-extrabold text-ink truncate max-w-[160px] md:max-w-[200px] group-hover:text-[color:var(--accent)]">
                {vehicle ? vehicleShortLabel(vehicle) : "Select vehicle"}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[color:var(--accent)] flex-shrink-0"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </span>
          </button>

          <div className="hidden md:flex flex-1"><Suspense><SearchBox /></Suspense></div>

          <nav className="hidden xl:flex items-center gap-0.5">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={clsx("px-2.5 h-10 inline-flex items-center rounded-[10px] text-[14px] font-bold whitespace-nowrap transition-colors", path?.startsWith(l.href) ? "text-[color:var(--accent)]" : "text-ink-2 hover:text-ink")}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto md:ml-0 flex items-center gap-1.5">
            <Link href="/buyer/cart" className="relative w-11 h-11 rounded-[12px] flex items-center justify-center text-ink hover:bg-paper-2" aria-label={`Cart, ${count} items`}>
              {Icon.cart}
              {count > 0 && <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[color:var(--accent)] text-white text-[11px] font-extrabold flex items-center justify-center">{count}</span>}
            </Link>
            {hydrated && (user ? (
              <Link href="/profile" className="hidden md:inline-flex items-center gap-2 h-11 px-3 rounded-[12px] hover:bg-paper-2 text-[14px] font-bold">
                <span className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-[13px] font-extrabold">{(user.name ?? "U").slice(0, 1)}</span>
                <span className="max-w-[90px] truncate">{user.name?.split(" ")[0] ?? "Account"}</span>
              </Link>
            ) : (
              <Link href="/login" className="h-11 px-5 inline-flex items-center rounded-[12px] bg-[color:var(--accent)] text-white text-[14px] font-extrabold whitespace-nowrap hover:bg-[color:var(--accent-ink)]">Sign in</Link>
            ))}
          </div>
        </div>
        <div className="md:hidden px-4 pb-3"><Suspense><SearchBox compact /></Suspense></div>
      </header>
      <VehiclePicker open={picker} onClose={() => setPicker(false)} />
    </>
  );
}

export function MobileNav() {
  const path = usePathname() ?? "";
  const mounted = useMounted();
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : null;
  const { garage } = useMyGarage();
  const items = [
    { href: "/", label: "Home", icon: Icon.home, active: path === "/" || path === "/buyer" },
    { href: "/search", label: "Shop", icon: Icon.search, active: path.startsWith("/search") || path.startsWith("/product") },
    { href: "/buyer/requests", label: "Quotes", icon: Icon.req, active: path.startsWith("/buyer/requests") },
    garage
      ? { href: "/workshop", label: "Workshop", icon: Icon.wrench, active: path.startsWith("/workshop") }
      : { href: "/vehicles", label: "Vehicles", icon: Icon.car, active: path.startsWith("/vehicles") },
    { href: user ? "/profile" : "/login", label: "Account", icon: Icon.user, active: path.startsWith("/profile") },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-[90] bg-paper border-t border-line pb-[env(safe-area-inset-bottom)] no-print" aria-label="Primary">
      <div className="grid grid-cols-5 h-[62px]">
        {items.map((i) => (
          <Link key={i.label} href={i.href} className={clsx("flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold", i.active ? "text-[color:var(--accent)]" : "text-ink-3")}>
            {i.icon}
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Floating "View cart" bar (Swiggy hallmark). Hidden on cart/checkout. */
export function CartBar() {
  const items = useCartStore((s) => s.items);
  const path = usePathname() ?? "";
  if (!items.length || ["/buyer/cart", "/buyer/checkout", "/pay", "/workshop"].some((p) => path.startsWith(p))) return null;
  const n = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  return (
    <div className="fixed inset-x-0 bottom-[70px] md:bottom-6 z-[95] px-4 pointer-events-none no-print">
      <Link
        href="/buyer/cart"
        className="pointer-events-auto fms-slide-up max-w-[560px] mx-auto h-14 rounded-[16px] bg-[color:var(--success)] text-white flex items-center justify-between px-5 shadow-[var(--shadow-lifted)]"
      >
        <span className="text-[14px] font-extrabold">{n} item{n > 1 ? "s" : ""} | {inr(total)}</span>
        <span className="text-[14px] font-extrabold flex items-center gap-1">View cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="m9 6 6 6-6 6" /></svg></span>
      </Link>
    </div>
  );
}

/** Wrapper for every shopper/garage page. */
export function ShopShell({ children, cartBar = true, footer = true }: { children: React.ReactNode; cartBar?: boolean; footer?: boolean }) {
  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader />
      <main className="flex-1 pb-[84px] md:pb-0">{children}</main>
      {footer && <SiteFooter />}
      {cartBar && <CartBar />}
      <MobileNav />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white mt-16 no-print hidden md:block">
      <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-4 gap-8">
        <div>
          <Logo size={26} tone="light" />
          <p className="text-[13px] text-white/60 mt-3 leading-relaxed">Sahi part. Pakka record.<br />India&apos;s parts marketplace and garage network.</p>
        </div>
        {[
          ["Shop", [["Browse parts", "/search"], ["Get quotes", "/buyer/requests/new"], ["My vehicles", "/vehicles"], ["Verify an invoice", "/verify"]]],
          ["For garages", [["Workshop (free)", "/workshop"], ["Verified Garage", "/workshop"], ["Invoices & payments", "/workshop/invoices"]]],
          ["For sellers", [["Sell on FindMySpare", "/sell"], ["Seller login", "/supplier-login"]]],
        ].map(([h, ls]) => (
          <div key={h as string}>
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-white/50 mb-3">{h as string}</div>
            <ul className="space-y-2">{(ls as string[][]).map(([l, href]) => <li key={l}><Link href={href!} className="text-[14px] font-semibold text-white/85 hover:text-white">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 text-[12px] text-white/45 py-4 text-center">© 2026 FindMySpare · Prototype · Payments are simulated (no real money moves)</div>
    </footer>
  );
}
