import Link from 'next/link';
import { 
  ArrowLeft,
  Lock,
  Building2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function SupplierCheckoutPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen font-['Inter',sans-serif] hide-scrollbar pb-32 text-stone-900">
      
      {/* Top Header */}
      <div className="bg-white px-4 py-4 border-b border-stone-100 flex items-center justify-between sticky top-0 z-50">
        <Link href="/supplier" className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        <div className="flex items-center gap-1.5 opacity-60">
          <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure TLS Checkout</span>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Plan Summary */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl shadow-stone-900/10 border border-stone-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h2 className="text-sm font-black tracking-tight text-white">Pro Network Pass</h2>
              </div>
              <p className="text-[11px] font-bold text-stone-400">Amber Industrial Sourcing</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black tracking-tighter text-white">$499</span>
              <span className="text-stone-400 font-bold text-xs">/mo</span>
            </div>
          </div>

          <div className="space-y-2 relative z-10 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between">
               <span className="text-xs font-medium text-stone-400">Billed monthly (cancel anytime)</span>
               <span className="text-xs font-black text-white">$499.00</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-xs font-medium text-stone-400">Onboarding Fee</span>
               <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Waived</span>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-black text-base text-stone-900 mb-2">Business Details</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Legal Business Name</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. Detroit Auto Parts LLC" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all cursor-text font-mono"
              />
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Federal Tax ID (EIN) / VAT</label>
            <input 
              type="text" 
              placeholder="XX-XXXXXXX" 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex gap-1">
             <div className="w-8 h-5 bg-stone-100 rounded flex items-center justify-center text-[8px] font-black tracking-widest text-stone-400 border border-stone-200">VISA</div>
             <div className="w-8 h-5 bg-stone-100 rounded flex items-center justify-center text-[8px] font-black tracking-widest text-stone-400 border border-stone-200">MC</div>
          </div>

          <h3 className="font-black text-base text-stone-900 mb-2">Payment Method</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Card Number</label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="4242 4242 4242 4242" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-4 text-sm font-bold text-stone-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
              />
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={2.5} />
              <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Expiry</label>
              <input 
                type="text" 
                defaultValue="12/28" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-sm font-bold text-stone-900 text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">CVC</label>
              <input 
                type="password" 
                defaultValue="123" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-sm font-bold text-stone-900 text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-4 pb-safe z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto pb-4">
          <Link href="/success" className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-stone-900 border border-amber-400/50 py-4.5 rounded-xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20 group">
            <ShieldCheck className="w-5 h-5 text-amber-700" strokeWidth={2.5} />
            Subscribe & Join Network
          </Link>
          <p className="text-[10px] font-bold text-center text-stone-400 mt-2">By continuing, you agree to the Vendor Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}
