"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { inr } from "@/lib/api/v2";
import { BUSINESS_ROLE_LABEL } from "@/lib/api/v3";
import { useAuthStore } from "@/lib/store";
import { useBiz } from "@/components/biz/BizShell";
import { BI, Page, num, plural } from "@/components/biz/kit";

type Task = { n: number; title: string; sub: string; href: string; tone: "accent" | "amber" | "info" | "danger"; icon: keyof typeof BI };

const toneCls: Record<Task["tone"], string> = {
  accent: "bg-[color:var(--accent-wash)] text-[color:var(--accent)]",
  amber: "bg-[color:var(--amber-wash)] text-[color:var(--amber)]",
  info: "bg-[color:var(--info-wash)] text-[color:var(--info)]",
  danger: "bg-[color:var(--danger-wash)] text-[color:var(--danger)]",
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function BizHome() {
  const { me, today: t, isSeller } = useBiz();
  const userName = useAuthStore((s) => s.user?.name);
  const first = (me.name ?? userName ?? "").trim().split(/\s+/)[0];
  const roles = me.businessRoles ?? [];
  const receivable = num(t.receivable);
  const payable = num(t.payable);

  const tasks: Task[] = [
    { n: t.pos_to_accept, title: `${plural(t.pos_to_accept, "purchase order")} to accept`, sub: "Buyers are waiting for your confirmation", href: "/biz/orders?tab=in", tone: "accent", icon: "inbox" },
    { n: t.pos_to_ship, title: `${plural(t.pos_to_ship, "order")} to ship`, sub: "Accepted. Pack and dispatch", href: "/biz/orders?tab=in", tone: "amber", icon: "truck" },
    { n: t.orders_to_pack, title: `${plural(t.orders_to_pack, "marketplace order")} to pack`, sub: "Paid online orders from FindMySpare buyers", href: "/supplier/orders", tone: "accent", icon: "box" },
    { n: t.pos_to_receive, title: `${plural(t.pos_to_receive, "delivery", "deliveries")} to receive`, sub: "Check the goods and mark received to add stock", href: "/biz/orders?tab=out", tone: "info", icon: "truck" },
    { n: t.link_requests, title: `${plural(t.link_requests, "connection request")}`, sub: "Businesses want to trade with you", href: "/biz/network", tone: "info", icon: "users" },
    { n: t.low_stock, title: `${plural(t.low_stock, "item")} low on stock`, sub: "Reorder before you run out", href: "/supplier/inventory?lowStock=true", tone: "danger", icon: "alert" },
    { n: receivable > 0 ? 1 : 0, title: `${inr(receivable)} to collect`, sub: "Udhaar outstanding in your khata", href: "/biz/khata", tone: "amber", icon: "rupee" },
  ].filter((x) => x.n > 0) as Task[];

  const actions = [
    ...(isSeller ? [{ href: "/biz/bill", label: "New bill", icon: BI.bill }] : []),
    { href: "/biz/network?tab=suppliers", label: "Order stock", icon: BI.cart },
    ...(isSeller ? [{ href: "/biz/network?tab=find", label: "Add buyer", icon: BI.users }] : [{ href: "/biz/network?tab=find", label: "Find suppliers", icon: BI.users }]),
    ...(isSeller ? [{ href: "/biz/import", label: "Import catalog", icon: BI.upload }] : []),
    ...(isSeller ? [{ href: "/biz/radar", label: "Demand radar", icon: BI.radar }] : []),
    ...(isSeller ? [{ href: `/s/${me.id}`, label: "My storefront", icon: BI.store }] : [{ href: "/biz/khata", label: "My khata", icon: BI.book }]),
  ];

  return (
    <Page>
      {/* Greeting */}
      <div className="mb-5">
        <div className="text-[13.5px] font-bold text-ink-3">{greeting()}{first ? `, ${first}` : ""}</div>
        <h1 className="text-[26px] md:text-[32px] font-extrabold tracking-[-0.02em] leading-tight mt-0.5">{me.businessName ?? me.name ?? "Your business"}</h1>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {roles.map((r) => (
            <span key={r} className="h-7 px-3 rounded-full bg-paper-2 text-ink-2 text-[12.5px] font-bold inline-flex items-center">{BUSINESS_ROLE_LABEL[r] ?? r}</span>
          ))}
          {me.city && <span className="h-7 px-3 rounded-full bg-paper-2 text-ink-3 text-[12.5px] font-bold inline-flex items-center">{me.city}</span>}
          {isSeller && <span className="h-7 px-3 rounded-full bg-[color:var(--success-wash)] text-[color:var(--success)] text-[12.5px] font-bold inline-flex items-center gap-1"><BI.check size={13} />Verified seller</span>}
        </div>
      </div>

      {!roles.length && (
        <Link href="/biz/setup" className="block rounded-[20px] bg-ink text-white p-5 md:p-6 mb-5 fms-press">
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-[color:var(--brand)]">Step 1 · 1 minute</div>
          <div className="text-[19px] md:text-[22px] font-extrabold tracking-tight mt-1">Tell us what you do</div>
          <p className="text-white/70 text-[14px] mt-1 max-w-[520px]">Distributor, retailer, mechanic? Pick your trade and industries so buyers and suppliers can find you.</p>
          <span className="inline-flex items-center gap-1 mt-3 text-[14px] font-extrabold">Set up my business <BI.chev size={16} /></span>
        </Link>
      )}

      {/* Today */}
      <section className="mb-6">
        <h2 className="text-[17px] font-extrabold tracking-tight mb-3">Today</h2>
        {tasks.length ? (
          <div className="grid md:grid-cols-2 gap-2.5">
            {tasks.map((x) => {
              const Icon = BI[x.icon];
              return (
                <Link key={x.title} href={x.href} className="card p-4 flex items-center gap-3.5 min-w-0 fms-press hover:shadow-[var(--shadow-lifted)] transition-shadow">
                  <span className={clsx("w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0", toneCls[x.tone])}><Icon size={22} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-extrabold tracking-tight">{x.title}</span>
                    <span className="block text-[12.5px] text-ink-3 font-semibold truncate">{x.sub}</span>
                  </span>
                  <BI.chev size={18} className="text-ink-4 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card-flat p-5 flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-[14px] bg-[color:var(--success-wash)] text-[color:var(--success)] flex items-center justify-center flex-shrink-0"><BI.check size={22} /></span>
            <div>
              <div className="text-[15px] font-extrabold">All caught up</div>
              <div className="text-[13px] text-ink-3 font-semibold">
                {t.pos_waiting > 0 ? `${plural(t.pos_waiting, "order")} you placed ${t.pos_waiting === 1 ? "is" : "are"} with the supplier.` : isSeller ? "No orders waiting. Make a bill or check what buyers are searching." : "Nothing pending. Order stock from your suppliers when you need it."}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Money strip */}
      <section className="mb-6">
        <div className="grid grid-cols-3 rounded-[18px] border border-line overflow-hidden">
          {[
            ...(isSeller
              ? [{ label: "Sales today", value: inr(t.sales_today), sub: plural(t.bills_today, "bill"), href: "/biz/bills" }]
              : [{ label: "Orders open", value: String(t.pos_waiting + t.pos_to_receive), sub: "with suppliers", href: "/biz/orders?tab=out" }]),
            { label: "To collect", value: inr(receivable), sub: "Udhaar", href: "/biz/khata" },
            { label: "To pay", value: inr(payable), sub: "Suppliers", href: "/biz/khata?tab=pay" },
          ].map((s, i) => (
            <Link key={s.label} href={s.href} className={clsx("p-3.5 md:p-4 hover:bg-paper-2 min-w-0", i > 0 && "border-l border-line")}>
              <div className="text-[11.5px] md:text-[12.5px] font-bold text-ink-3 truncate">{s.label}</div>
              <div className={clsx("text-[17px] md:text-[22px] font-extrabold tracking-tight tabular-nums truncate mt-0.5", s.label === "To collect" && receivable > 0 && "text-[color:var(--amber)]")}>{s.value}</div>
              <div className="text-[11.5px] text-ink-4 font-semibold truncate">{s.sub}</div>
            </Link>
          ))}
        </div>
        {isSeller && num(t.sales_month) > 0 && (
          <div className="text-[12.5px] text-ink-3 font-semibold mt-2 px-1">Counter sales this month: <span className="font-extrabold text-ink">{inr(t.sales_month)}</span></div>
        )}
      </section>

      {/* Quick actions */}
      <section className="mb-6">
        <h2 className="text-[17px] font-extrabold tracking-tight mb-3">Quick actions</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {actions.map((a) => (
            <Link key={a.label} href={a.href} className="card-flat p-3 flex flex-col items-center text-center gap-2 fms-press hover:border-[color:var(--accent)] transition-colors">
              <span className="w-11 h-11 rounded-full bg-[color:var(--accent-wash)] text-[color:var(--accent)] flex items-center justify-center"><a.icon size={22} /></span>
              <span className="text-[12.5px] font-extrabold leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Network + demand */}
      <section className="grid md:grid-cols-2 gap-2.5">
        <Link href="/biz/network" className="card-flat p-4 flex items-center gap-3.5 min-w-0 hover:bg-paper-2">
          <span className="w-11 h-11 rounded-[14px] bg-paper-2 flex items-center justify-center text-ink-2"><BI.users size={22} /></span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-extrabold">Trade network</span>
            <span className="block text-[12.5px] text-ink-3 font-semibold">
              {t.suppliers || t.buyers
                ? [t.suppliers ? plural(t.suppliers, "supplier") : null, isSeller && t.buyers ? plural(t.buyers, "buyer") : null].filter(Boolean).join(" · ")
                : "Connect with suppliers to order at trade prices"}
            </span>
          </span>
          <BI.chev size={18} className="text-ink-4" />
        </Link>
        {isSeller && (
          <Link href="/biz/radar" className="card-flat p-4 flex items-center gap-3.5 min-w-0 hover:bg-paper-2">
            <span className="w-11 h-11 rounded-[14px] bg-paper-2 flex items-center justify-center text-ink-2"><BI.radar size={22} /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-extrabold">What buyers want</span>
              <span className="block text-[12.5px] text-ink-3 font-semibold">
                {t.open_requests ? `${plural(t.open_requests, "part request")} in the last 14 days` : "Searches and part requests near you"}
              </span>
            </span>
            <BI.chev size={18} className="text-ink-4" />
          </Link>
        )}
      </section>
    </Page>
  );
}
