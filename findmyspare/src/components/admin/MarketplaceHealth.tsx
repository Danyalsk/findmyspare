"use client";

import { useEffect, useState } from "react";
import { adminV2Api, inr } from "@/lib/api/v2";

type H = Awaited<ReturnType<typeof adminV2Api.health>>;

/** North-star + funnel tiles for the marketplace and Garage OS. */
export function MarketplaceHealth() {
  const [h, setH] = useState<H | null>(null);
  useEffect(() => { adminV2Api.health().then(setH).catch(() => {}); }, []);
  const n = (k: string) => (h ? Number(h[k] ?? 0) : null);
  const groups: { title: string; tiles: [string, string | number | null, string?][] }[] = [
    { title: "Marketplace", tiles: [
      ["GMV (paid)", h ? inr(h.gmv as string) : null],
      ["Paid orders", n("paid_orders")],
      ["Delivered", n("delivered_orders")],
      ["Awaiting payment", n("unpaid_orders")],
    ] },
    { title: "Quotes & fit (north star)", tiles: [
      ["Requests", n("requests")],
      ["Fill rate", h?.fillRate != null ? `${h.fillRate}%` : "–", "requests with ≥1 quote"],
      ["Avg. time to first quote", h?.avg_minutes_to_first_quote != null ? `${h.avg_minutes_to_first_quote} min` : "–"],
      ["Confirmed fits", n("confirmed_fits"), `${n("wrong_fit_reports") ?? 0} wrong-fit reports`],
    ] },
    { title: "Garage OS & Passport", tiles: [
      ["Garages", n("garages")],
      ["Job cards", n("job_cards")],
      ["Invoices", n("invoices"), h ? `${inr(h.invoice_collections as string)} collected` : undefined],
      ["Vehicles / owned", h ? `${n("vehicles")} / ${n("owned_vehicles")}` : null, `${n("fitted_parts") ?? 0} parts on record`],
    ] },
  ];
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-ink-3 mb-2">{g.title}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {g.tiles.map(([l, v, sub]) => (
              <div key={l} className="card p-4">
                <div className="text-[12px] font-bold text-ink-3">{l}</div>
                <div className="text-[22px] font-extrabold tracking-tight mt-0.5">{v ?? "…"}</div>
                {sub && <div className="text-[11.5px] text-ink-3 font-semibold">{sub}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
