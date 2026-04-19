"use client";

import Link from "next/link";
import { useState } from "react";
import { BackIcon, ShieldIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   Cart / Inquiry Basket — redesigned to match prototype
   ═══════════════════════════════════════════════════════ */

const cartItems = [
  { id: "1", name: "OEM Brake pad set (front)", vehicle: "Maruti Swift '18", qty: 1, price: 3200, label: "PADS" },
  { id: "2", name: "Front brake caliper LH", vehicle: "Maruti Swift '18", qty: 1, price: 5400, label: "CALIPER" },
];

export default function CartPage() {
  const [items, setItems] = useState(cartItems);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* Header */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <Link
          href="/buyer"
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div>
          <div className="serif text-[24px] leading-[1.05]">Your inquiry</div>
          <div className="text-[11px] text-ink-3">{items.length} items</div>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 pt-5 flex flex-col gap-2.5 flex-1">
        {items.map((item) => (
          <Card key={item.id} className="!p-3 flex gap-3">
            <div
              className="w-[60px] h-[60px] rounded-[10px] flex-shrink-0 relative"
              style={{
                background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
              }}
            >
              <span className="absolute left-1 bottom-1 mono text-[7px] text-ink-3 uppercase tracking-[0.06em] bg-paper px-1 py-0.5 rounded border border-line">
                {item.label}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium leading-[1.2]">{item.name}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">{item.vehicle}</div>
              <div className="flex items-center gap-3 mt-2">
                {/* Qty stepper */}
                <div className="flex items-center gap-2 bg-paper-2 rounded-[8px] px-1.5 py-0.5 border border-line">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 text-ink-3 hover:text-ink flex items-center justify-center">−</button>
                  <span className="mono text-xs w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 text-ink-3 hover:text-ink flex items-center justify-center">+</button>
                </div>
                <div className="mono text-sm font-semibold ml-auto">₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
              </div>
            </div>
          </Card>
        ))}

        {/* Price breakdown */}
        <div className="mt-4 pt-4 border-t border-line space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-3">Subtotal</span>
            <span className="mono">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-3">Estimated shipping</span>
            <span className="mono text-accent-ink">FREE</span>
          </div>
          <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-line">
            <span>Total</span>
            <span className="mono">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Escrow trust */}
        <Card variant="accent" className="!p-3 mt-4">
          <div className="flex gap-2.5 items-start">
            <ShieldIcon size={18} className="text-accent-ink flex-shrink-0 mt-0.5" />
            <div className="text-xs text-accent-ink leading-[1.4]">
              <span className="font-semibold">Escrow protected.</span> Payment is held securely until you confirm the part fits.
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 py-3.5 border-t border-line">
        <Link href="/buyer/checkout">
          <Button variant="primary" block>
            Proceed to escrow · ₹{total.toLocaleString("en-IN")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
