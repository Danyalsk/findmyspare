import { DesktopNav } from "@/components/layout/DesktopNav";
import { TabBar } from "@/components/layout/TabBar";

/* ═══════════════════════════════════════════════════════
   Buyer Layout Shell
   Desktop: DesktopNav (top) + content
   Mobile: content + TabBar (bottom)
   ═══════════════════════════════════════════════════════ */

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DesktopNav />
      <main className="flex-1 flex flex-col pb-[78px] md:pb-0">
        {children}
      </main>
      <TabBar role="buyer" />
    </div>
  );
}
