"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/constants";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, total, clear } = useCartStore();

  const supplierName = items[0]?.supplierName;

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Cart"
        backHref="/buyer"
        rightAction={
          items.length > 0 ? (
            <button onClick={clear} className="text-[12px] font-bold text-danger">Clear</button>
          ) : undefined
        }
      />

      <div className="px-5 pb-8 space-y-4">
        {items.length === 0 ? (
          <Card className="text-center !p-8">
            <div className="text-[14px] font-medium mb-1">Your cart is empty</div>
            <div className="text-[12px] text-ink-3 mb-4">Browse parts and add them here.</div>
            <Link href="/search">
              <Button variant="primary">Browse parts</Button>
            </Link>
          </Card>
        ) : (
          <>
            {supplierName && (
              <div className="text-[12px] text-ink-3">
                Sold by <span className="font-bold text-ink">{supplierName}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {items.map((it) => (
                <Card key={it.id} className="!p-4 flex gap-3 items-center">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium leading-tight">{it.name}</div>
                    {it.vehicle && <div className="text-[11px] text-ink-3 mt-0.5">{it.vehicle}</div>}
                    <div className="mono text-[14px] font-semibold mt-1">{formatPrice(it.unitPrice)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(it.id, it.quantity - 1)}
                      className="w-8 h-8 rounded-[10px] bg-paper-2 border border-line text-ink font-bold"
                    >
                      −
                    </button>
                    <span className="mono text-[14px] w-6 text-center">{it.quantity}</span>
                    <button
                      onClick={() => updateQty(it.id, it.quantity + 1)}
                      className="w-8 h-8 rounded-[10px] bg-paper-2 border border-line text-ink font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-ink-3 hover:text-danger text-lg leading-none ml-1"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </Card>
              ))}
            </div>

            <Card className="!p-4 flex items-center justify-between">
              <span className="text-[13px] font-bold">Total</span>
              <span className="mono text-[18px] font-bold">{formatPrice(total())}</span>
            </Card>

            <Button variant="primary" block size="lg" onClick={() => router.push("/buyer/checkout")}>
              Proceed to checkout
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
