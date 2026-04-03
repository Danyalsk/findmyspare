import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Phone,
  MessageCircle,
  FileText
} from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      
      {/* Top App Bar Custom Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <Link href="/orders" className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div className="flex flex-col items-center">
            <h2 className="text-sm font-black tracking-tight text-stone-900">Order #ORD-998-AZ2</h2>
            <span className="text-[10px] font-bold text-stone-400">Amber Central Warehouse</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <FileText className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Tracking Map Graphic Placeholder */}
        <div className="w-full h-48 bg-stone-100 rounded-3xl border border-stone-200 relative overflow-hidden flex items-center justify-center flex-col">
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=11&size=600x300&maptype=roadmap&style=element:labels|visibility:off&style=feature:administrative.land_parcel|visibility:off&style=feature:administrative.neighborhood|visibility:off&format=jpg')] bg-cover bg-center opacity-40 mix-blend-multiply"></div>
          
          <div className="relative z-10 flex items-center gap-1 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-stone-200 text-stone-700">
            <Truck className="w-4 h-4 text-amber-500" strokeWidth={3} />
            <span className="text-xs font-black tracking-wide">In Transit</span>
          </div>
          <span className="relative z-10 text-[10px] font-bold text-stone-500 mt-2 bg-stone-100 px-2 rounded">Est. Delivery: Tomorrow, 2:00 PM</span>
        </div>

        {/* Escrow Status Pillar */}
        <div className="bg-emerald-50 rounded-3xl p-5 shadow-sm border border-emerald-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
            <ShieldCheck className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[15px] font-black text-emerald-950 leading-tight">Funds in Escrow</h4>
            <p className="text-[12px] font-medium text-emerald-700/80 mt-1 leading-relaxed">Your $392.58 payment is securely locked. The supplier will only receive funds after you verify the shipment.</p>
          </div>
        </div>

        {/* Vertical Pipeline Tracker */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-stone-100 space-y-6">
          <h3 className="font-black text-lg text-stone-900 border-b border-stone-100 pb-4">Tracking History</h3>
          
          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-stone-200 before:to-stone-200">
            
            {/* Step 1: Verified */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-amber-400 shadow absolute -left-[35px] z-10">
                <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />
              </div>
              <div className="flex flex-col flex-1 pl-4">
                <h4 className="text-sm font-black text-stone-900">Supplier Verified & Shipped</h4>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Tracking: FEDEX 1Z99923838</p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-1">Today, 09:42 AM</span>
              </div>
            </div>

            {/* Step 2: Escrow Funded */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-emerald-400 shadow absolute -left-[35px] z-10">
                <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />
              </div>
              <div className="flex flex-col flex-1 pl-4">
                <h4 className="text-sm font-black text-stone-900">Escrow Funded</h4>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Payment Authorized via Card **1234</p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-1">Today, 08:30 AM</span>
              </div>
            </div>

            {/* Step 3: Order Placed */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-stone-300 shadow absolute -left-[35px] z-10">
                <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />
              </div>
              <div className="flex flex-col flex-1 pl-4">
                <h4 className="text-sm font-black text-stone-900">Inquiry Submitted</h4>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Order requested from inventory.</p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-1">Yesterday, 04:15 PM</span>
              </div>
            </div>

          </div>
        </div>

        {/* Supplier Contact */}
        <div className="flex gap-3">
          <button className="flex-1 bg-white border border-stone-200 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-stone-700 hover:border-amber-400 hover:text-amber-600">
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            Call Supplier
          </button>
          <Link href="/messages" className="flex-1 bg-white border border-stone-200 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-stone-700 hover:border-amber-400 hover:text-amber-600">
            <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
            Message
          </Link>
        </div>

      </main>

      {/* Sticky Bottom Release Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-4 pb-safe z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto pb-4">
          <button className="w-full bg-gradient-to-r from-stone-900 to-stone-800 text-white border border-stone-900 py-4.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 group transition-all opacity-50 cursor-not-allowed">
            <AlertCircle className="w-4 h-4 text-emerald-400" strokeWidth={3} />
            Release Funds to Supplier
          </button>
          <p className="text-[10px] font-bold text-center text-emerald-600 mt-2">Button will activate upon confirmed delivery scan.</p>
        </div>
      </div>

    </div>
  );
}
