import type { OrderStatus } from "./types";
import { C } from "./theme";

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
}

const META: Record<OrderStatus, StatusMeta> = {
  placed: { label: "Placed", color: C.accentInk, bg: "#FFF1DB" },
  confirmed: { label: "Confirmed", color: C.success, bg: "#DCF3E6" },
  shipped: { label: "Shipped", color: C.success, bg: "#DCF3E6" },
  in_transit: { label: "In transit", color: C.success, bg: "#DCF3E6" },
  delivered: { label: "Delivered", color: C.success, bg: "#DCF3E6" },
  completed: { label: "Completed", color: C.success, bg: "#DCF3E6" },
  disputed: { label: "Disputed", color: C.danger, bg: "#FCE8E9" },
  cancelled: { label: "Cancelled", color: C.danger, bg: "#FCE8E9" },
};

export function statusMeta(status: OrderStatus | string): StatusMeta {
  return META[status as OrderStatus] ?? { label: String(status), color: C.ink3, bg: C.paper3 };
}

export interface TimelineStep {
  label: string;
  state: "done" | "active" | "pending";
}

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

export function buildTimeline(status: OrderStatus): TimelineStep[] {
  const effective = status === "disputed" || status === "cancelled" ? "delivered" : status;
  const idx = STAGES.findIndex((s) => s.key === effective);
  return STAGES.map((stage, i) => {
    let state: TimelineStep["state"];
    if (status === "completed") state = "done";
    else if (i < idx) state = "done";
    else if (i === idx) state = "active";
    else state = "pending";
    return { label: stage.label, state };
  });
}
