"use client";

import Link from "next/link";
import { useState } from "react";
import { BackIcon, SparkIcon, CameraIcon, ScanIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

/* ═══════════════════════════════════════════════════════
   VIN Scanner — Screen 07
   Full-bleed dark camera overlay with reticle and
   detected text preview.
   ═══════════════════════════════════════════════════════ */

const modes = ["VIN", "Part no.", "Photo"];

export default function ScanPage() {
  const [activeMode, setActiveMode] = useState(0);

  return (
    <div className="fixed inset-0 bg-ink text-paper flex flex-col z-50 overflow-hidden">
      {/* Simulated camera background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.22 0.01 240) 0%, oklch(0.10 0.01 240) 100%)",
        }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <Link
          href="/buyer"
          className="w-9 h-9 rounded-[11px] bg-white/10 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
        >
          <BackIcon size={18} />
        </Link>
        <div className="text-xs font-medium">Scan VIN or part number</div>
        <div className="w-9 h-9 rounded-[11px] bg-white/10 backdrop-blur flex items-center justify-center text-accent">
          <SparkIcon size={18} />
        </div>
      </div>

      {/* ── Mode toggle ── */}
      <div className="relative z-10 flex justify-center px-5 pt-2">
        <div className="flex bg-white/10 backdrop-blur rounded-full p-[3px]">
          {modes.map((m, i) => (
            <button
              key={m}
              onClick={() => setActiveMode(i)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === activeMode
                  ? "bg-paper text-ink"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reticle area ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-10">
        <div className="w-full aspect-square max-w-[250px] relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-7 h-7 border-t-[2.5px] border-l-[2.5px] border-accent rounded-tl-md" />
          <div className="absolute top-0 right-0 w-7 h-7 border-t-[2.5px] border-r-[2.5px] border-accent rounded-tr-md" />
          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[2.5px] border-l-[2.5px] border-accent rounded-bl-md" />
          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[2.5px] border-r-[2.5px] border-accent rounded-br-md" />

          {/* Scan line animation */}
          <div className="absolute inset-x-2 overflow-hidden">
            <div
              className="h-0.5 bg-accent/80"
              style={{
                boxShadow: "0 0 12px var(--accent), 0 0 24px var(--accent)",
                animation: "scan 2.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* Detected text preview */}
          <div className="absolute -bottom-14 left-0 right-0 text-center">
            <div className="mono text-sm tracking-[0.15em] opacity-70">
              MA3F<span className="text-accent opacity-100">JEB1</span>S00<span className="text-accent opacity-100">12345</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Match card ── */}
      <div className="relative z-10 px-5 pb-3">
        <Card className="!bg-white/10 !backdrop-blur-lg !border-white/20 !p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Chip variant="ok">VEHICLE IDENTIFIED</Chip>
          </div>
          <div className="text-sm font-medium">Maruti Swift ZXi+ · 2018</div>
          <div className="text-[11px] text-white/50 mt-0.5 mono">VIN MA3FJEB1S0012345</div>
          <Link href="/buyer/search">
            <Button variant="accent" block className="mt-3 !h-11 !text-[13px]">
              Browse parts for this car
            </Button>
          </Link>
        </Card>
      </div>

      {/* ── Bottom camera controls ── */}
      <div className="relative z-10 flex items-center justify-around px-8 py-5 pb-8">
        <button className="w-10 h-10 rounded-[11px] bg-white/10 flex items-center justify-center opacity-60">
          <CameraIcon size={20} />
        </button>

        {/* Shutter */}
        <button className="w-[60px] h-[60px] rounded-full border-[3px] border-accent/50 flex items-center justify-center active:scale-90 transition-transform">
          <div className="w-[48px] h-[48px] rounded-full bg-accent flex items-center justify-center">
            <ScanIcon size={22} className="text-ink" />
          </div>
        </button>

        <button className="w-10 h-10 rounded-[11px] bg-white/10 flex items-center justify-center opacity-60">
          <CameraIcon size={20} />
        </button>
      </div>

      {/* Scan animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(250px); opacity: 0; }
        }
      ` }} />
    </div>
  );
}
