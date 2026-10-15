import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** Minimal chrome for public, token-scoped pages (no login needed). */
export function PublicFrame({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="min-h-dvh bg-paper-3">
      <header className="bg-paper border-b border-line no-print">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={24} /></Link>
          {badge && <span className="text-[12.5px] font-bold text-ink-3">{badge}</span>}
        </div>
      </header>
      <main className="max-w-[900px] mx-auto px-4 py-6 md:py-10">{children}</main>
      <footer className="text-center text-[12px] text-ink-4 pb-8 no-print">FindMySpare · Sahi part. Pakka record.</footer>
    </div>
  );
}
