import type { OrderStatus } from "@/lib/types";
import type { EscrowStep } from "@/components/features/EscrowTimeline";

type Variant = "ok" | "warn" | "danger" | "default";

const META: Record<OrderStatus, { label: string; variant: Variant }> = {
  placed: { label: "Placed", variant: "warn" },
  confirmed: { label: "Confirmed", variant: "ok" },
  shipped: { label: "Shipped", variant: "ok" },
  in_transit: { label: "In transit", variant: "ok" },
  delivered: { label: "Delivered", variant: "ok" },
  completed: { label: "Completed", variant: "ok" },
  disputed: { label: "Disputed", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

export function statusMeta(status: OrderStatus | string): { label: string; variant: Variant } {
  return META[status as OrderStatus] ?? { label: String(status), variant: "default" };
}

// Ordered lifecycle for the escrow/fulfilment timeline.
const STAGES: { key: OrderStatus; label: string }[] = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed by supplier" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed — payment released" },
];

export function buildTimeline(status: OrderStatus): EscrowStep[] {
  // Terminal off-track states still show the stages reached so far.
  const effective = status === "disputed" || status === "cancelled" ? "delivered" : status;
  const currentIndex = STAGES.findIndex((s) => s.key === effective);

  return STAGES.map((stage, i) => {
    let state: EscrowStep["state"];
    if (status === "completed") state = "done";
    else if (i < currentIndex) state = "done";
    else if (i === currentIndex) state = "active";
    else state = "pending";
    return { label: stage.label, state };
  });
}
