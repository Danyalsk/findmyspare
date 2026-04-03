import Link from 'next/link';
import { 
  ArrowLeft, 
  MoreVertical, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search,
  ChevronRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <h2 className="text-lg font-black tracking-tight text-center text-stone-900">Your Procurement</h2>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Status Pipeline Summary */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col items-center justify-center gap-1.5 focus:border-amber-400">
            <span className="text-xl font-black text-amber-500">2</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 text-center leading-tight">Pending<br/>Review</span>
          </div>
          <div className="bg-stone-900 rounded-2xl p-4 shadow-lg shadow-stone-900/10 border border-stone-800 flex flex-col items-center justify-center gap-1.5 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#fafaf9] relative">
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 border-2 border-[#fafaf9] rounded-full animate-pulse"></span>
            <span className="text-xl font-black text-white">1</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 text-center leading-tight">Awaiting<br/>Payment</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col items-center justify-center gap-1.5">
            <span className="text-xl font-black text-stone-900">5</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 text-center leading-tight">Paid &<br/>Shipped</span>
          </div>
        </div>


        <div className="flex flex-col md:flex-row md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 items-start">
        
        {/* Column 1: Action Required: Awaiting Payment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="w-4 h-4 text-red-500" strokeWidth={3} />
            <h3 className="font-black text-stone-900 text-sm tracking-tight">Action Required</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-amber-400 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base leading-tight">Amber Central Warehouse</h3>
                  <p className="text-[11px] font-bold text-emerald-600 mt-0.5 tracking-wide">SUPPLIER VERIFIED STOCK</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100 z-10">
              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200">
                 <img alt="Bosch Alternator" className="w-full h-full object-cover mix-blend-multiply p-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWoEkB2RsSMEKlgmpl_IuSMNmR31XmkAaxKnAPJ6LzgIbZs55okb0y5BVRNpxjloDUtECMDiyomv5N6QcsHdfX_MIM1SLtfl4hFUYv8N6k2AvAs7-mZrOSOaHyc07_WOoBqXBBrAjHfRIzi74uZxVt4zd_hf-fsbm6J30F1SvJPBEVcQ37sH30PlPwMLvJUx8eo4VVsh4CBX_ikCqujlCyLLf7bYsGOm0r9K4MkjuNDtRTv1XXLjttBPoVfpzmPVBTDKSZMN45tAW0" />
              </div>
              <div className="flex-1">
                 <p className="text-xs font-black text-stone-900 line-clamp-1">Bosch High-Output Alternator 12V</p>
                 <p className="text-[10px] font-bold text-stone-400 mt-0.5">Quantity: 1</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-stone-900">$289.00</p>
              </div>
            </div>

            <Link href="/checkout" className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-all z-10 shadow-lg shadow-stone-900/10">
              Proceed to Secure Escrow
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Column 2: Pending Inquiries */}
        <div className="space-y-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-stone-400" strokeWidth={3} />
            <h3 className="font-black text-stone-500 text-sm tracking-tight uppercase">Awaiting Supplier Check</h3>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 opacity-60">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
                  <Clock className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base leading-tight">Detroit Auto Parts</h3>
                  <p className="text-[11px] font-bold text-stone-500 mt-0.5 tracking-wide">PENDING VERIFICATION</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-stone-50/50 rounded-xl p-3 border border-stone-100 border-dashed opacity-70">
              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200 grayscale">
                 <img alt="Brake Pads" className="w-full h-full object-cover mix-blend-multiply p-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3auAonGiuhzqqmU6HT8TgpNvWefGz6WU4Rc7HikLXAvhGz_-Tx0uaoEJFusSNfeI9_Zm0TYFxbnhL_zn3UHbbtFpfh9whaSM12-xZ_0iJF5qfBpTRwMLcQenq2gZ_qUMlgKAk0y_yqelvZHr1v7dbmar5tG8OI1imq1lCwCmwrcVPEnXF9OG1wCOw-IexBk2nvSBf0CT4JxHub4Sy1KkvVpAYFOnvcVxF2yYj1o-WCxCiKbimiNr-VFt6nWHq9S6_KiDocJoiEVAI" />
              </div>
              <div className="flex-1">
                 <p className="text-xs font-black text-stone-900 line-clamp-1">Ceramic Brake Pads (Set of 4)</p>
                 <p className="text-[10px] font-bold text-stone-400 mt-0.5">Quantity: 1</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-stone-400">TBD</p>
              </div>
            </div>
            
            <p className="text-[10px] font-bold text-stone-400 text-center">Supplier typically responds within 24 hours.</p>
          </div>
        </div>


        {/* Column 3: Paid & Shipped Orders */}
        <div className="space-y-4 w-full mt-4 xl:mt-0">
          <div className="flex items-center gap-2 px-1">
            <Truck className="w-4 h-4 text-emerald-500" strokeWidth={3} />
            <h3 className="font-black text-stone-900 text-sm tracking-tight uppercase">In Transit</h3>
          </div>

          <Link href="/orders/ORD-998-AZ2" className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col gap-4 hover:border-emerald-300 transition-colors group block">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                  <Package className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base leading-tight">Amber Central Warehouse</h3>
                  <p className="text-[11px] font-bold text-emerald-600 mt-0.5 tracking-wide">SHIPPED VIA FEDEX</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
            </div>

            <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200">
                 <img alt="Brake Caliper" className="w-full h-full object-cover mix-blend-multiply p-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3auAonGiuhzqqmU6HT8TgpNvWefGz6WU4Rc7HikLXAvhGz_-Tx0uaoEJFusSNfeI9_Zm0TYFxbnhL_zn3UHbbtFpfh9whaSM12-xZ_0iJF5qfBpTRwMLcQenq2gZ_qUMlgKAk0y_yqelvZHr1v7dbmar5tG8OI1imq1lCwCmwrcVPEnXF9OG1wCOw-IexBk2nvSBf0CT4JxHub4Sy1KkvVpAYFOnvcVxF2yYj1o-WCxCiKbimiNr-VFt6nWHq9S6_KiDocJoiEVAI" />
              </div>
              <div className="flex-1">
                 <p className="text-xs font-black text-stone-900 line-clamp-1">Performance Brake Calipers</p>
                 <p className="text-[10px] font-bold text-stone-400 mt-0.5">Quantity: 2</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-black text-stone-900">$392.58</p>
                <span className="text-[9px] font-black bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded mt-1">PAID</span>
              </div>
            </div>
            
            <p className="text-[11px] font-black text-stone-900 text-center uppercase tracking-widest mt-1">Est. Delivery: Tomorrow</p>
          </Link>

        </div>
        
        </div>
      </main>
    </div>
  );
}
