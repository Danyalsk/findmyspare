import Link from 'next/link';
import { 
  Settings, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  Trash2, 
  Minus, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Home, 
  Package, 
  PlusCircle, 
  Car, 
  User,
  Search
} from 'lucide-react';

export default function CartPage() {
  return (
    <div className="bg-[#fafaf9] text-stone-900 min-h-screen pb-40 font-['Inter',sans-serif] hide-scrollbar">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
              <Settings className="w-5 h-5" strokeWidth={2.5} />
            </Link>
            <h1 className="font-black text-lg tracking-tight text-stone-900">FindMySpare</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-amber-500 hover:bg-stone-100 active:scale-90 transition-all">
              <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white border-2 border-[#fafaf9] text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">2</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-6xl mx-auto">
        {/* Progress Stepper (Contextual) */}
        <div className="flex items-center justify-between mb-10 px-2 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShoppingCart className="w-4 h-4 text-stone-900" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Cart</span>
          </div>
          <div className="flex-1 h-0.5 bg-stone-200 mx-4 -mt-6"></div>
          <div className="flex flex-col items-center gap-2 opacity-40">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
              <Truck className="w-4 h-4 text-stone-500" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Shipping</span>
          </div>
          <div className="flex-1 h-0.5 bg-stone-200 mx-4 -mt-6"></div>
          <div className="flex flex-col items-center gap-2 opacity-40">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
              <CreditCard className="w-4 h-4 text-stone-500" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-8">
          <div className="flex-1 w-full">
            <h1 className="text-2xl font-black tracking-tight mb-6 px-2 text-stone-900">Your Basket <span className="text-stone-400 font-medium text-lg">(2 Items)</span></h1>
        
        {/* Cart Items List: Supplier Group 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <Truck className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-stone-900 text-sm tracking-tight">Amber Central Warehouse</h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded ml-auto">1 Item</span>
          </div>
          <div className="space-y-4">

          {/* Bosch Alternator Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:border-amber-300 transition-colors flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-36 h-36 rounded-2xl bg-stone-50 overflow-hidden flex-shrink-0 border border-stone-100">
              <img alt="Bosch Alternator" className="w-full h-full object-cover mix-blend-multiply p-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWoEkB2RsSMEKlgmpl_IuSMNmR31XmkAaxKnAPJ6LzgIbZs55okb0y5BVRNpxjloDUtECMDiyomv5N6QcsHdfX_MIM1SLtfl4hFUYv8N6k2AvAs7-mZrOSOaHyc07_WOoBqXBBrAjHfRIzi74uZxVt4zd_hf-fsbm6J30F1SvJPBEVcQ37sH30PlPwMLvJUx8eo4VVsh4CBX_ikCqujlCyLLf7bYsGOm0r9K4MkjuNDtRTv1XXLjttBPoVfpzmPVBTDKSZMN45tAW0" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-md mb-2 inline-block">Alternators</span>
                  <h2 className="text-lg font-black text-stone-900 leading-tight">Bosch High-Output Car Alternator 12V 150A</h2>
                  <p className="text-xs font-bold text-stone-400 mt-1">Part <span className="bg-stone-50 text-stone-600 px-1 py-0.5 rounded">#B001-X992-AL</span></p>
                </div>
                <button className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl shrink-0 -mt-1 -mr-1">
                  <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex items-end justify-between mt-6">
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl p-1.5 w-fit">
                  <button className="w-8 h-8 rounded-lg bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-colors active:scale-90">
                    <Minus className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <span className="w-6 text-center font-black text-stone-900">1</span>
                  <button className="w-8 h-8 rounded-lg bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-colors active:scale-90">
                    <Plus className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Price</span>
                  <span className="text-xl font-black text-stone-900 tracking-tight">$289.00</span>
                </div>
              </div>
            </div>
          </div>

          </div>
        </div>

        {/* Cart Items List: Supplier Group 2 */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
              <Package className="w-4 h-4 text-stone-500" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-stone-900 text-sm tracking-tight">Detroit Auto Parts</h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded ml-auto">1 Item</span>
          </div>
          <div className="space-y-4">
            {/* Brake Pads Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:border-amber-300 transition-colors flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-36 h-36 rounded-2xl bg-stone-50 overflow-hidden flex-shrink-0 border border-stone-100">
              <img alt="Ceramic Brake Pads" className="w-full h-full object-cover mix-blend-multiply p-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3auAonGiuhzqqmU6HT8TgpNvWefGz6WU4Rc7HikLXAvhGz_-Tx0uaoEJFusSNfeI9_Zm0TYFxbnhL_zn3UHbbtFpfh9whaSM12-xZ_0iJF5qfBpTRwMLcQenq2gZ_qUMlgKAk0y_yqelvZHr1v7dbmar5tG8OI1imq1lCwCmwrcVPEnXF9OG1wCOw-IexBk2nvSBf0CT4JxHub4Sy1KkvVpAYFOnvcVxF2yYj1o-WCxCiKbimiNr-VFt6nWHq9S6_KiDocJoiEVAI" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-md mb-2 inline-block">Brake System</span>
                  <h2 className="text-lg font-black text-stone-900 leading-tight">High-Performance Ceramic Brake Pads (Set of 4)</h2>
                  <p className="text-xs font-bold text-stone-400 mt-1">Part <span className="bg-stone-50 text-stone-600 px-1 py-0.5 rounded">#CP-4422-BK</span></p>
                </div>
                <button className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl shrink-0 -mt-1 -mr-1">
                  <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex items-end justify-between mt-6">
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl p-1.5 w-fit">
                  <button className="w-8 h-8 rounded-lg bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-colors active:scale-90">
                    <Minus className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <span className="w-6 text-center font-black text-stone-900">1</span>
                  <button className="w-8 h-8 rounded-lg bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-colors active:scale-90">
                    <Plus className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Price</span>
                  <span className="text-xl font-black text-stone-900 tracking-tight">$74.50</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Protection Badge (System Guideline) */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-3xl p-5 border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
            <ShieldCheck className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[15px] font-black text-emerald-950 leading-tight">Amber Industrial Protection</h4>
            <p className="text-[13px] font-medium text-emerald-700/80 mt-1 leading-snug">Every purchase is backed by our authentic fitment guarantee and 12-month industrial warranty.</p>
          </div>
        </div>
        </div>

        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          {/* Summary Section */}
        <div className="mt-8 bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-stone-100">
          <div className="p-6 md:p-8 space-y-4">
            <h3 className="font-black text-lg text-stone-900 mb-6 pb-4 border-b border-stone-100">Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-500">Subtotal <span className="text-stone-400 font-medium">(2 items)</span></span>
              <span className="text-sm font-black text-stone-900">$363.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-500">Estimated Shipping</span>
              <span className="text-sm font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-500">Tax</span>
              <span className="text-sm font-black text-stone-900">$29.08</span>
            </div>
          </div>
          <div className="bg-stone-50/80 p-6 md:p-8 flex flex-col gap-6 border-t border-stone-100">
            <div className="flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-widest text-stone-500">Order Total</span>
              <span className="text-3xl font-black tracking-tighter text-stone-900">$392.58</span>
            </div>
            <Link href="/orders" className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-stone-900/10">
              <ShieldCheck className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
              Request Availability
            </Link>
            <p className="text-[11px] font-bold text-center text-stone-400">Your card will not be charged. Securing inventory...<br/>Orders are split by supplier.</p>
          </div>
          </div>
        </div>
        </div>
      </main>

      {/* Bottom Nav Spacer */}
      <div className="h-24 md:hidden" />

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 flex justify-around items-end pb-5 pt-3 px-2 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <Link href="/" className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
          <Home className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
          <Search className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Search</span>
        </Link>
        <Link href="/scan" className="flex flex-col items-center -mt-8 relative z-10 outline-none">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 shadow-[0_4px_16px_rgba(245,158,11,0.45)] flex items-center justify-center text-white border-4 border-[#fafaf9] active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-1 w-12 text-amber-600 transition-colors active:scale-90">
          <Package className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Orders</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
          <User className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
