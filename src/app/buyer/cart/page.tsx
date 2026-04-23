"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon, ShieldIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/constants";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQty, removeItem, total } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="text-[15px] font-semibold">Your cart is empty</div>
        <div className="text-[12px] text-ink-3">Browse parts or post a request to get started</div>
        <Link href="/buyer/search">
          <Button variant="primary">Browse parts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* Header */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </button>
        <div>
          <div className="serif text-[24px] leading-[1.05]">Your cart</div>
          <div className="text-[11px] text-ink-3">{items.length} item{items.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-2.5 flex-1">
        {items.map((item) => (
          <Card key={item.id} className="!p-3 flex gap-3">
            <div
              className="w-[60px] h-[60px] rounded-[10px] flex-shrink-0 relative"
              style={{ background: "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)" }}
            >
              {item.imageLabel && (
                <span className="absolute left-1 bottom-1 mono text-[7px] text-ink-3 uppercase tracking-[0.06em] bg-paper px-1 py-0.5 rounded border border-line">
                  {item.imageLabel}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium leading-[1.2]">{item.name}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">{item.vehicle}</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 bg-paper-2 rounded-[8px] px-1.5 py-0.5 border border-line">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 text-ink-3 hover:text-ink flex items-center justify-center">−</button>
                  <span className="mono text-xs w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 text-ink-3 hover:text-ink flex items-center justify-center">+</button>
                </div>
                <div className="mono text-sm font-semibold ml-auto">{formatPrice(item.unitPrice * item.quantity)}</div>
                <button onClick={() => removeItem(item.id)} className="text-ink-3 hover:text-danger transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {/* Price breakdown */}
        <div className="mt-4 pt-4 border-t border-line space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-3">Subtotal</span>
            <span className="mono">{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-3">Estimated shipping</span>
            <span className="mono text-accent-ink">FREE</span>
          </div>
          <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-line">
            <span>Total</span>
            <span className="mono">{formatPrice(total())}</span>
          </div>
        </div>

        <Card variant="accent" className="!p-3 mt-2">
          <div className="flex gap-2.5 items-start">
            <ShieldIcon size={18} className="text-accent-ink flex-shrink-0 mt-0.5" />
            <div className="text-xs text-accent-ink leading-[1.4]">
              <span className="font-semibold">Escrow protected.</span> Payment held until you confirm the part fits.
            </div>
          </div>
        </Card>
      </div>

      <div className="px-5 py-3.5 border-t border-line">
        <Link href="/buyer/checkout">
          <Button variant="primary" block>
            Proceed to checkout · {formatPrice(total())}
          </Button>
        </Link>
      </div>
    </div>
  );
}
