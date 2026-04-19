"use client";

import Link from "next/link";
import {
  BackIcon,
  MoreIcon,
  CheckIcon,
  ShieldIcon,
  StarIcon,
  ChatIcon,
  ArrowRightIcon,
} from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

/* ═══════════════════════════════════════════════════════
   Product Detail — Screen 04
   Trust-first: OEM, KYC supplier, escrow are primary.
   Hero image, specs, supplier card, bottom CTA bar.
   ═══════════════════════════════════════════════════════ */

const specs = [
  ["Make / Model", "Maruti Swift ZXi+"],
  ["Year range", "2015 — 2022"],
  ["OEM number", "04465-0K350"],
  ["Material", "Semi-metallic"],
  ["Warranty", "6 months"],
];

export default function ProductDetailPage() {
  return (
    <div className="flex-1 flex flex-col relative">
      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden pb-[100px]">
        {/* Hero image */}
        <div className="relative">
          <div
            className="w-full"
            style={{
              aspectRatio: "1/1.1",
              background:
                "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
            }}
          >
            <span className="absolute left-2.5 bottom-10 mono text-[9px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-1.5 py-0.5 rounded border border-line">
              PART IMAGE · 3/5
            </span>
          </div>

          {/* Overlay nav */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Link
              href="/buyer/search"
              className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-line active:scale-90 transition-transform"
            >
              <BackIcon size={18} />
            </Link>
            <button className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-line active:scale-90 transition-transform">
              <MoreIcon size={18} />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-[5px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full"
                style={{
                  width: i === 2 ? 18 : 6,
                  background: i === 2 ? "var(--ink)" : "var(--paper)",
                  opacity: i === 2 ? 1 : 0.8,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Product info ── */}
        <div className="px-5 pt-[18px]">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
                OEM · 04465-0K350
              </div>
              <h2 className="serif text-[28px] leading-[1.05] mt-1.5">
                OEM Brake pad<br />set — front axle
              </h2>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="mono text-[10px] text-ink-3">INR</div>
              <div className="mono text-[22px] font-semibold">3,200</div>
            </div>
          </div>

          {/* Fitment chips */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            <Chip variant="ok">
              <CheckIcon size={12} /> Genuine
            </Chip>
            <Chip>Fits &apos;15–&apos;22 Swift</Chip>
            <Chip>12 in stock</Chip>
          </div>
        </div>

        {/* ── Escrow trust card ── */}
        <div className="px-5 pt-5">
          <Card variant="accent" className="!p-4">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-[10px] bg-paper flex items-center justify-center text-accent-ink flex-shrink-0">
                <ShieldIcon size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[13px] text-accent-ink">
                  Protected by Escrow
                </div>
                <div className="text-xs text-accent-ink opacity-85 mt-0.5 leading-[1.4]">
                  We hold your payment until the part arrives and you confirm it
                  fits.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Supplier card ── */}
        <div className="px-5 pt-5">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
            SUPPLIER
          </div>
          <div className="flex gap-3 items-center mt-2.5 p-3 border border-line rounded-[12px]">
            <Avatar initials="KP" size="lg" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Kirinyaga Parts Ltd.</div>
              <div className="text-[11px] text-ink-3 mt-0.5">
                <span className="inline-block w-2.5 h-2.5 align-[-1px]">
                  <StarIcon size={10} className="text-ink" />
                </span>{" "}
                4.9 · 2,104 orders · KYC verified
              </div>
            </div>
            <Chip>Chat</Chip>
          </div>
        </div>

        {/* ── Fitment & specs ── */}
        <div className="px-5 pt-5 pb-5">
          <div className="mono text-[10px] text-ink-3 tracking-[0.12em]">
            FITMENT &amp; SPECS
          </div>
          <div className="mt-2.5">
            {specs.map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between py-2.5 border-b border-line text-[13px]"
              >
                <span className="text-ink-3">{k}</span>
                <span className="mono text-xs">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA bar ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-3.5 border-t border-line bg-paper flex gap-2.5 items-center z-10">
        <Link
          href="/messages/1"
          className="w-12 h-12 rounded-[12px] bg-paper-2 border border-line flex items-center justify-center flex-shrink-0 hover:bg-paper-3 transition-colors active:scale-95"
        >
          <ChatIcon size={20} />
        </Link>
        <Button variant="primary" block>
          Buy with escrow · ₹3,200
        </Button>
      </div>
    </div>
  );
}
