import Link from 'next/link';
import { 
  ArrowLeft,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function SupplierLandingPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen font-['Inter',sans-serif] hide-scrollbar">
      
      {/* Top App Bar Custom Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] pt-2 pb-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3 mt-2">
          <Link href="/" className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-sm font-black tracking-tight text-stone-900">Partner Program</h2>
            <span className="text-[10px] font-bold text-stone-400">Amber Industrial Network</span>
          </div>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-lg mx-auto flex flex-col pb-32">

        {/* Hero Section */}
        <section className="bg-stone-900 text-white px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-32 -left-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6 border border-amber-300">
               <Building2 className="w-8 h-8 text-stone-950" strokeWidth={2.5} />
            </div>
            
            <h1 className="text-3xl font-black tracking-tighter leading-tight mb-4">
              Sell to 10,000+ <br/> <span className="text-amber-400">Pro Mechanics.</span>
            </h1>
            <p className="text-stone-400 font-medium text-sm leading-relaxed max-w-[280px]">
              Access exclusive daily RFQs, zero-chargeback escrow, and nationwide buyers.
            </p>
          </div>
        </section>

        {/* Value Props */}
        <div className="px-5 -mt-8 relative z-20 space-y-4">
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
              <TrendingUp className="w-6 h-6 text-amber-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-stone-900 leading-tight">Instant RFQ Access</h3>
              <p className="text-xs font-medium text-stone-500 mt-1 leading-snug">Tap into a live feed of buyers searching for rare obsolete and heavy-duty parts.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-stone-900 leading-tight">Zero Chargeback Risk</h3>
              <p className="text-xs font-medium text-stone-500 mt-1 leading-snug">Our SafeTrade Escrow system guarantees your funds the moment tracking shows delivered.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center shrink-0 border border-stone-200">
              <Globe className="w-6 h-6 text-stone-600" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-stone-900 leading-tight">Direct Messaging</h3>
              <p className="text-xs font-medium text-stone-500 mt-1 leading-snug">Negotiate directly with buyers on freight costs and condition grading before deals close.</p>
            </div>
          </div>

        </div>

        {/* The Pricing Pitch */}
        <div className="mx-6 mt-8 p-6 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl shadow-xl shadow-stone-900/10 text-white relative overflow-hidden border border-stone-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pro Network Pass</span>
          </div>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black tracking-tighter">$499</span>
            <span className="text-stone-400 font-bold text-sm tracking-wide">/ mo</span>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={3} />
              <span className="text-sm font-medium text-stone-300">Unlimited incoming RFQs</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={3} />
              <span className="text-sm font-medium text-stone-300">100% Escrow Protection</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={3} />
              <span className="text-sm font-medium text-stone-300">Verified "Trusted" Badge</span>
            </li>
          </ul>

          <Link href="/supplier/checkout" className="w-full bg-amber-400 hover:bg-amber-500 text-stone-950 py-4.5 rounded-xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
            Secure Your Territory
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        </div>

      </main>
    </div>
  );
}
