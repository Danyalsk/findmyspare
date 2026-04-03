import Link from 'next/link';
import { 
  CheckCircle2, 
  FileText, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen flex flex-col font-['Inter',sans-serif] hide-scrollbar">
      
      {/* Immersive Success Header */}
      <section className="relative pt-20 pb-12 px-6 bg-gradient-to-br from-stone-900 to-stone-800 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-6 border-4 border-stone-800/50">
          <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        
        <h1 className="relative z-10 text-3xl font-black text-white text-center tracking-tight leading-tight">Payment Secured!</h1>
        <p className="relative z-10 text-stone-400 font-bold text-sm mt-3 text-center max-w-[250px]">Your funds are safely locked in Amber Escrow until delivery.</p>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto p-6 -mt-6 z-20">
        
        {/* Receipt Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-900/5 border border-stone-100 mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 border-dashed mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">Order Ref</span>
            <span className="text-sm font-bold text-stone-900 font-mono bg-stone-50 px-2 py-0.5 rounded">#ORD-998-AZ2</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-stone-900 text-[15px]">SafeTrade Escrow</p>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Funds Locked</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center shrink-0 border border-stone-100">
                <Building2 className="w-6 h-6 text-stone-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-stone-900 text-[15px]">Amber Central Warehouse</p>
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Supplier Notified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-400" strokeWidth={2.5} />
            <span className="text-sm font-bold text-stone-500">Total Authorized</span>
          </div>
          <span className="text-xl font-black text-stone-900 tracking-tighter">$396.22</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/orders" className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-stone-900 py-4.5 rounded-xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
            <Package className="w-5 h-5" strokeWidth={2.5} />
            Track in Pipeline
          </Link>
          
          <Link href="/" className="w-full bg-white text-stone-900 py-4.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-stone-200">
            Continue Sourcing Parts
          </Link>
        </div>

      </main>
    </div>
  );
}
