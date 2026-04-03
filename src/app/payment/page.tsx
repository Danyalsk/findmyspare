import Link from 'next/link';
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  HelpCircle,
  Building2,
  Wallet
} from 'lucide-react';

export default function PaymentPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <Link href="/checkout" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <h2 className="text-lg font-black tracking-tight text-center text-stone-900">Secure Payment</h2>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <HelpCircle className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Total Summary */}
        <section className="bg-gradient-to-br from-stone-900 to-stone-800 p-6 rounded-3xl shadow-lg shadow-stone-900/10 text-white flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1">Total to Pay</p>
            <p className="text-3xl font-black tracking-tighter">$396.22</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Lock className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
        </section>

        {/* Payment Methods */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-500 mb-2 px-1">Select Method</h3>
          
          <label className="flex items-center justify-between bg-white rounded-2xl shadow-sm border-2 border-amber-400 p-4 cursor-pointer relative overflow-hidden transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-stone-50 rounded border border-stone-200 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-stone-900 text-sm leading-tight">Credit / Debit Card</p>
                <p className="text-[11px] font-bold text-stone-400 mt-0.5">Visa, Mastercard, Amex</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-4 border-amber-500 bg-white"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-bl-full -mr-4 -mt-4"></div>
          </label>

          <label className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-stone-100 p-4 cursor-pointer hover:border-amber-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-[#0070BA]/5 rounded border border-[#0070BA]/20 flex items-center justify-center shrink-0">
                <span className="font-black italic text-[#0070BA] tracking-tighter">PayPal</span>
              </div>
              <p className="font-black text-stone-900 text-sm">PayPal</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-stone-300 bg-white"></div>
          </label>

          <label className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-stone-100 p-4 cursor-pointer hover:border-amber-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-stone-900 text-sm leading-tight">Bank Transfer</p>
                <p className="text-[11px] font-bold text-stone-400 mt-0.5">Net 30 Terms available</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-stone-300 bg-white"></div>
          </label>
        </section>

        {/* Card Details Form */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 mt-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-stone-900 text-base">Card Details</h3>
            <div className="flex gap-1.5">
              <div className="w-8 h-5 bg-stone-100 rounded flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-500/80 -mr-2 mix-blend-multiply"></div>
                <div className="w-4 h-4 rounded-full bg-amber-500/80 mix-blend-multiply"></div>
              </div>
              <div className="w-8 h-5 bg-stone-100 rounded flex items-center justify-center">
                <span className="text-[8px] font-black text-blue-800 italic">VISA</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Card Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
                />
                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={2} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Expiry</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">CVC</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="123" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
                  />
                  <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" strokeWidth={2} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="Danyal Developer" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Security Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 opacity-50">
            <Lock className="w-4 h-4 text-stone-600" strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">256-Bit SSL</span>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="w-4 h-4 text-stone-600" strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Amber Secure</span>
          </div>
        </div>

      </main>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-4 pb-safe z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto pb-4">
          <Link href="/success" className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-stone-900 border border-amber-400/50 py-4.5 rounded-xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20 group">
            Confirm Payment
            <Lock className="w-4 h-4 ml-1 group-hover:block hidden" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
