"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { markSigningOut, useBiz } from "@/components/biz/BizShell";
import { BI, Page, PageHead } from "@/components/biz/kit";

type Row = { href: string; label: string; sub: string; icon: keyof typeof BI; badge?: number };

export default function MorePage() {
  const { me, today: t, isSeller } = useBiz();
  const router = useRouter();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);

  async function signOut() {
    if (refreshToken) { try { await authApi.logout(refreshToken); } catch { /* ignore */ } }
    markSigningOut();
    router.replace("/");
    logout();
  }

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: "Trade",
      rows: [
        { href: "/biz/network", label: "Network", sub: isSeller ? `${t.suppliers} suppliers · ${t.buyers} buyers` : `${t.suppliers} suppliers`, icon: "users", badge: t.link_requests },
        ...(isSeller ? [
          { href: "/biz/price-lists", label: "Price lists", sub: "Dealer and bulk rates per buyer", icon: "tag" as const },
          { href: "/biz/bills", label: "Bills", sub: "Counter sales history", icon: "bill" as const },
          { href: "/biz/radar", label: "Demand radar", sub: "What buyers search vs what you list", icon: "radar" as const },
        ] : []),
      ],
    },
    ...(isSeller ? [{
      title: "Catalog & marketplace",
      rows: [
        { href: `/s/${me.id}`, label: "My storefront", sub: "Public page to share with customers", icon: "store" as const },
        { href: "/supplier/inventory", label: "Listings & stock", sub: `${t.listings} listings${t.low_stock ? ` · ${t.low_stock} low` : ""}`, icon: "box" as const },
        { href: "/supplier/products/new", label: "Add a product", sub: "One listing with photos and fitment", icon: "plus" as const },
        { href: "/biz/import", label: "Import catalog", sub: "CSV from Excel or Tally", icon: "upload" as const },
        { href: "/supplier/orders", label: "Marketplace orders", sub: t.orders_to_pack ? `${t.orders_to_pack} to pack` : "Online orders from buyers", icon: "truck" as const, badge: t.orders_to_pack },
        { href: "/supplier/leads", label: "Part requests", sub: "Quote on buyer inquiries", icon: "inbox" as const },
      ],
    }] : []),
    {
      title: "Account",
      rows: [
        { href: "/biz/setup", label: "Business profile", sub: "Your trades and industries", icon: "settings" },
        { href: "/profile", label: "Profile", sub: "Name, phone, address", icon: "user" },
        ...(!isSeller ? [{ href: "/sell", label: "Become a seller", sub: "Billing, buyers, storefront", icon: "store" as const }] : []),
      ],
    },
  ];

  return (
    <Page>
      <PageHead title="More" sub={me.businessName ?? me.name ?? undefined} />
      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="text-[12.5px] font-extrabold uppercase tracking-wider text-ink-4 mb-2 px-1">{g.title}</h2>
            <ul className="card-flat divide-y divide-line overflow-hidden">
              {g.rows.map((r) => {
                const Icon = BI[r.icon];
                return (
                  <li key={r.href}>
                    <Link href={r.href} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-paper-2">
                      <span className="w-10 h-10 rounded-[12px] bg-paper-2 text-ink-2 flex items-center justify-center flex-shrink-0"><Icon size={20} /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] font-extrabold">{r.label}</span>
                        <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{r.sub}</span>
                      </span>
                      {!!r.badge && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[color:var(--accent)] text-white text-[11.5px] font-extrabold inline-flex items-center justify-center">{r.badge}</span>}
                      <BI.chev size={18} className="text-ink-4" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <button onClick={signOut} className="w-full card-flat px-4 py-3.5 flex items-center gap-3.5 text-[color:var(--danger)] hover:bg-[color:var(--danger-wash)]">
          <span className="w-10 h-10 rounded-[12px] bg-[color:var(--danger-wash)] flex items-center justify-center"><BI.logout size={20} /></span>
          <span className="text-[15px] font-extrabold">Sign out</span>
        </button>
      </div>
    </Page>
  );
}
