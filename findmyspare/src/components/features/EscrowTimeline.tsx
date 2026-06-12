import React from "react";
import { clsx } from "clsx";
import { CheckIcon } from "@/lib/icons";

/* ═══════════════════════════════════════════════════════
   EscrowTimeline — vertical step timeline from Screen 05
   Steps: done, active, pending
   ═══════════════════════════════════════════════════════ */

export interface EscrowStep {
  label: string;
  timestamp?: string;
  description?: string;
  state: "done" | "active" | "pending";
}

export interface EscrowTimelineProps {
  steps: EscrowStep[];
  className?: string;
}

export function EscrowTimeline({ steps, className }: EscrowTimelineProps) {
  return (
    <div className={clsx("flex flex-col", className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        return (
          <div key={step.label} className="flex gap-3.5">
            {/* Left: dot + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Dot */}
              {step.state === "done" ? (
                <div className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center">
                  <CheckIcon size={14} />
                </div>
              ) : step.state === "active" ? (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-paper" />
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full border-[1.5px] bg-paper"
                  style={{ borderStyle: "dashed", borderColor: "var(--line-2)" }}
                />
              )}

              {/* Connector line */}
              {!isLast && (
                <div
                  className="w-px flex-1 min-h-[32px]"
                  style={{
                    borderLeft: step.state === "done"
                      ? "1.5px solid var(--ink)"
                      : "1.5px dashed var(--line-2)",
                  }}
                />
              )}
            </div>

            {/* Right: content */}
            <div className={clsx("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
              <div
                className={clsx(
                  "font-medium text-[13px] leading-[1]",
                  step.state === "pending" ? "text-ink-3" : "text-ink"
                )}
              >
                {step.label}
              </div>
              {step.timestamp && (
                <div className="mono text-[10px] text-ink-3 tracking-[0.06em] mt-1">
                  {step.timestamp}
                </div>
              )}

              {/* Active step detail card */}
              {step.state === "active" && step.description && (
                <div className="mt-2 bg-accent-wash text-accent-ink rounded-[10px] px-3 py-2.5 text-xs leading-[1.4]">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
