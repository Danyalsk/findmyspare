import { TopBar } from "@/components/layout/TopBar";
import { EscrowTimeline, EscrowStep } from "@/components/features/EscrowTimeline";
import { Button } from "@/components/ui/Button";
import { MoreIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   Escrow Timeline — Screen 05
   Vertical step timeline with stage indicator and actions.
   ═══════════════════════════════════════════════════════ */

const steps: EscrowStep[] = [
  {
    label: "Request accepted",
    timestamp: "14 APR · 08:32",
    state: "done",
  },
  {
    label: "Escrow funded",
    timestamp: "14 APR · 11:15",
    state: "done",
  },
  {
    label: "Shipped & tracking live",
    timestamp: "15 APR · 09:44",
    description: "Tracking #DLEX92831 — currently in transit via DTDC Express. Expected delivery tomorrow by 4 PM.",
    state: "active",
  },
  {
    label: "Delivered & inspected",
    state: "pending",
  },
  {
    label: "Funds released to supplier",
    state: "pending",
  },
];

export default function EscrowTimelinePage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      {/* Top bar */}
      <TopBar
        title="Order details"
        subtitle="ORDER · ORD-10482"
        backHref="/buyer/orders"
        rightAction={
          <button className="w-9 h-9 rounded-[11px] bg-paper-2 border border-line flex items-center justify-center">
            <MoreIcon size={18} />
          </button>
        }
      />

      <div className="flex-1 px-5 pb-5">
        {/* Stage label */}
        <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
          ESCROW · STAGE 3 OF 5
        </div>

        {/* Headline */}
        <h2 className="serif text-[32px] leading-[1.05] mt-2">
          ₹3,200{" "}
          <em className="italic text-accent-ink">is safely held</em>
        </h2>
        <p className="text-xs text-ink-3 mt-2 leading-[1.5] max-w-[320px]">
          Funds will be released to Kirinyaga Parts Ltd. only after you confirm the
          part fits your vehicle.
        </p>

        {/* Timeline */}
        <div className="mt-6">
          <EscrowTimeline steps={steps} />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-5 py-3.5 border-t border-line flex gap-2.5">
        <Button variant="default" dashed className="flex-1">
          Raise dispute
        </Button>
        <Button variant="primary" className="flex-1">
          Confirm fitment
        </Button>
      </div>
    </div>
  );
}
