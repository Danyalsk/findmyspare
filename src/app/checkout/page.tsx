import Link from 'next/link';
import { 
  ArrowLeft, 
  MoreVertical, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  ChevronRight, 
  Lock, 
  MapPin 
} from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <h2 className="text-lg font-black tracking-tight text-center text-stone-900">Order Summary</h2>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Flow Context */}
          <div className="flex-1 w-full space-y-6">        {/* Product Snapshot Card */}
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 hover:border-amber-300 transition-colors">
          <div className="flex gap-4">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-stone-50 overflow-hidden relative border border-stone-100">
              <img alt="Bosch Alternator" className="w-full h-full object-cover mix-blend-multiply p-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWoEkB2RsSMEKlgmpl_IuSMNmR31XmkAaxKnAPJ6LzgIbZs55okb0y5BVRNpxjloDUtECMDiyomv5N6QcsHdfX_MIM1SLtfl4hFUYv8N6k2AvAs7-mZrOSOaHyc07_WOoBqXBBrAjHfRIzi74uZxVt4zd_hf-fsbm6J30F1SvJPBEVcQ37sH30PlPwMLvJUx8eo4VVsh4CBX_ikCqujlCyLLf7bYsGOm0r9K4MkjuNDtRTv1XXLjttBPoVfpzmPVBTDKSZMN45tAW0" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h3 className="font-black text-stone-900 text-lg leading-tight">Bosch Alternator</h3>
              <p className="text-sm font-bold text-stone-400">Supplier: Amber Central Warehouse</p>
              <div className="inline-flex items-center gap-1 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest text-stone-500 w-fit mt-1">
                <span>ID: #B001-X992-AL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Address (Filled the missing UX gap) */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5 group cursor-pointer hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Delivery Address</h4>
            <span className="text-amber-600 text-xs font-black uppercase tracking-wider hover:text-amber-700 transition-colors">Edit</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0 border border-amber-100">
                <MapPin className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-stone-900 text-sm">Industrial Repair Shop</p>
                <p className="text-sm font-medium text-stone-500 mt-0.5 leading-relaxed">
                  123 Automotive Way, Suite B<br />
                  Detroit, Michigan 48201
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transition-colors mt-2" strokeWidth={2.5} />
          </div>
        </section>

        {/* Payment Method Selector */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5 group cursor-pointer hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Payment Method</h4>
            <span className="text-amber-600 text-xs font-black uppercase tracking-wider hover:text-amber-700 transition-colors">Change</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-stone-50 rounded border border-stone-200 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-stone-400" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-stone-900 text-sm">Business Visa</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-0.5">Ending in •••• 4242</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transition-colors" strokeWidth={2.5} />
          </div>
        </section>

        {/* Cost Breakdown Card */}
        </div>
          
        {/* Right Column: Checkout Block */}
        <div className="w-full lg:w-[420px] shrink-0 space-y-6 lg:sticky lg:top-24">
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-500">Subtotal (2 Items)</span>
              <span className="font-black text-stone-900">$363.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-500">Estimated Shipping</span>
              <span className="text-sm font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">FREE</span>
            </div>
            <div className="flex justify-between items-center group relative cursor-help">
              <div className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 transition-colors">
                <span className="text-sm font-bold">Escrow Fee (1%)</span>
                <Info className="w-4 h-4 text-stone-400" strokeWidth={2.5} />
              </div>
              <span className="font-black text-stone-900">$3.64</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-500">Taxes</span>
              <span className="font-black text-stone-900">$29.08</span>
            </div>
          </div>
          {/* Divider */}
          <div className="h-px bg-stone-100 mx-6"></div>
            <div className="p-6 flex flex-col gap-4 bg-stone-50/50 pt-8 pb-8">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-stone-500">Total Amount</span>
                <span className="text-3xl font-black text-stone-900 tracking-tighter">$396.22</span>
              </div>
              <Link href="/payment" className="hidden lg:flex w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-stone-900 border border-amber-400/50 py-4 rounded-xl font-black text-[15px] items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20 mt-2">
                <Lock className="w-5 h-5" strokeWidth={2.5} />
                Pay $396.22 into Escrow
              </Link>
            </div>
          </section>

        {/* Escrow Protection Badge */}
        <section className="bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-3xl p-5 flex gap-4 items-start border border-amber-200/50 shadow-sm">
          <div className="bg-white text-amber-500 p-2.5 rounded-2xl shrink-0 flex items-center justify-center border border-amber-100 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-amber-500" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-stone-900 text-sm mb-1 leading-tight">AmberTrade Protection</h4>
            <p className="text-stone-500 font-medium text-[13px] leading-relaxed">
              Your funds are held safely in a neutral escrow account. We only release payment to the supplier after you confirm delivery.
            </p>
            <button className="text-[11px] font-black uppercase tracking-widest text-amber-600 mt-3 flex items-center gap-1 hover:text-amber-700 transition-colors">
              Learn how it works <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>
        </section>

        <p className="text-center font-bold text-[10px] uppercase tracking-widest text-stone-400 px-4 leading-relaxed mt-4">
            By proceeding, you agree to the FindMySpare Terms of Service and Escrow Agreement.
        </p>
          </div>
        </div>
      </main>

      {/* Sticky Footer CTA (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-4 pb-safe z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto pb-4">
          <Link href="/payment" className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-stone-900 border border-amber-400/50 py-4 check rounded-xl font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
            <Lock className="w-5 h-5" strokeWidth={2.5} />
            Pay $396.22 into Escrow
          </Link>
        </div>
      </div>
    </div>
  );
}
