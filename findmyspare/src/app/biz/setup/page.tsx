"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { bizApi, taxonomyApi, BUSINESS_ROLE_LABEL, SELLER_ROLES } from "@/lib/api/v3";
import { IconTile } from "@/components/net/NetIcon";
import { Skel } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { BI, ErrorCard, Page, PageHead, btnPrimary, useApi } from "@/components/biz/kit";

const ROLE_HINT: Record<string, string> = {
  raw_material_supplier: "Castings, steel, rubber, copper: inputs for factories",
  manufacturer: "You make parts and sell to stockists and distributors",
  super_stockist: "Bulk stock for a region, supplying distributors",
  distributor: "Buy from brands, supply wholesalers and shops",
  wholesaler: "Sell in bulk to retailers and workshops",
  retailer: "Counter shop selling to mechanics and customers",
  service_center: "Workshop or service centre that repairs machines",
  technician: "Mechanic, electrician or field technician",
  refurbisher: "Repair and resell used parts and units",
  recycler: "Scrap, dismantling and recovered parts",
  logistics: "Transport and delivery for the trade",
  business_buyer: "Fleet, factory, housing society buying for its own use",
};

export default function BizSetup() {
  const { me, isSeller, reload } = useBiz();
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>(me.businessRoles ?? []);
  const [inds, setInds] = useState<string[]>(me.industries ?? []);
  const [busy, setBusy] = useState(false);
  const tax = useApi("taxonomy", () => taxonomyApi.get());

  const roleKeys = Object.keys(BUSINESS_ROLE_LABEL).filter((r) => isSeller || !SELLER_ROLES.includes(r));
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function save() {
    setBusy(true);
    try {
      await bizApi.setProfile(roles, inds);
      toast.success("Business profile saved");
      reload();
      router.push("/biz");
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't save"));
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHead title="Your business" sub="So the right buyers and suppliers find you" back={me.businessRoles?.length ? "/biz/more" : undefined} />

      <section className="mb-7">
        <h2 className="text-[16px] font-extrabold tracking-tight">What do you do?</h2>
        <p className="text-[13px] text-ink-3 font-semibold mb-3">Pick all that apply.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {roleKeys.map((r) => {
            const on = roles.includes(r);
            return (
              <button key={r} type="button" aria-pressed={on} onClick={() => toggle(roles, setRoles, r)}
                className={clsx("text-left p-3.5 rounded-[16px] border-2 flex items-start gap-3 transition-colors fms-press", on ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)]" : "border-line bg-paper hover:border-line-2")}>
                <span className={clsx("mt-0.5 w-5 h-5 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0", on ? "bg-[color:var(--accent)] border-[color:var(--accent)] text-white" : "border-line-2")}>
                  {on && <BI.check size={13} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-extrabold">{BUSINESS_ROLE_LABEL[r]}</span>
                  <span className="block text-[12.5px] text-ink-3 font-semibold">{ROLE_HINT[r]}</span>
                </span>
              </button>
            );
          })}
        </div>
        {!isSeller && (
          <p className="text-[13px] text-ink-3 font-semibold mt-3">
            Sell parts as a distributor, wholesaler or shop? <Link href="/sell" className="text-[color:var(--accent)] font-extrabold">Register as a seller</Link> with your GST to unlock billing and buyers.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-[16px] font-extrabold tracking-tight">Which industries?</h2>
        <p className="text-[13px] text-ink-3 font-semibold mb-3">Parts you buy or sell.</p>
        {tax.error ? <ErrorCard message={tax.error} onRetry={tax.reload} /> : !tax.data ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">{Array.from({ length: 10 }, (_, i) => <Skel key={i} className="h-28" />)}</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {tax.data.industries.map((i) => {
              const on = inds.includes(i.slug);
              return (
                <button key={i.slug} type="button" aria-pressed={on} onClick={() => toggle(inds, setInds, i.slug)}
                  className={clsx("relative p-3 rounded-[18px] border-2 flex flex-col items-center gap-2 text-center fms-press transition-colors", on ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)]" : "border-line hover:border-line-2")}>
                  {on && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[color:var(--accent)] text-white flex items-center justify-center"><BI.check size={12} /></span>}
                  <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={52} />
                  <span className="text-[12.5px] font-extrabold leading-tight">{i.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="sticky bottom-[72px] md:bottom-4 z-10">
        <button onClick={save} disabled={busy || !roles.length} className={clsx(btnPrimary, "w-full shadow-[var(--shadow-lifted)]")}>
          {busy ? "Saving…" : roles.length ? `Save · ${roles.length} role${roles.length > 1 ? "s" : ""}, ${inds.length} industr${inds.length === 1 ? "y" : "ies"}` : "Pick at least one role"}
        </button>
      </div>
    </Page>
  );
}
