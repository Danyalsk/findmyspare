import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  Car, 
  Settings, 
  Home, 
  PlusCircle, 
  Package, 
  User,
  Star,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      
      {/* Top App Bar & Search Input */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] pt-2 pb-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3 mt-2">
          <Link href="/" className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search by part # or name..." 
              defaultValue="Industrial Alternator"
              className="w-full bg-stone-50 border border-stone-200 rounded-full pl-11 pr-4 py-2.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" strokeWidth={3} />
          </div>
          <button className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 active:scale-90 transition-all">
            <SlidersHorizontal className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Category Pills */}
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar mt-4 px-1">
          <button className="bg-stone-900 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-wide whitespace-nowrap shadow-md shadow-stone-900/10 border border-stone-800">
            All Matches
          </button>
          <button className="bg-white text-stone-500 border border-stone-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap hover:bg-stone-50 hover:text-stone-900 transition-colors">
            Electrical (12)
          </button>
          <button className="bg-white text-stone-500 border border-stone-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap hover:bg-stone-50 hover:text-stone-900 transition-colors">
            Heavy Duty (4)
          </button>
          <button className="bg-white text-stone-500 border border-stone-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap hover:bg-stone-50 hover:text-stone-900 transition-colors">
            OEE Certified
          </button>
        </div>
      </div>

      {/* Main Content: Search Results */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Result Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-black text-stone-900">16 Results Found</span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sort: Relevance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Product Card 1 */}
        <Link href="/product" className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 flex gap-4 hover:border-amber-300 transition-colors group">
          <div className="w-28 h-28 shrink-0 rounded-2xl bg-stone-50 border border-stone-100 flex py-2 px-1 relative">
            <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm z-10">Best Match</div>
            <img alt="Bosch Alternator" className="w-full h-full object-cover mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWoEkB2RsSMEKlgmpl_IuSMNmR31XmkAaxKnAPJ6LzgIbZs55okb0y5BVRNpxjloDUtECMDiyomv5N6QcsHdfX_MIM1SLtfl4hFUYv8N6k2AvAs7-mZrOSOaHyc07_WOoBqXBBrAjHfRIzi74uZxVt4zd_hf-fsbm6J30F1SvJPBEVcQ37sH30PlPwMLvJUx8eo4VVsh4CBX_ikCqujlCyLLf7bYsGOm0r9K4MkjuNDtRTv1XXLjttBPoVfpzmPVBTDKSZMN45tAW0" />
          </div>
          <div className="flex flex-col justify-between py-1 w-full">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Part #B001-X992-AL</p>
              <h3 className="font-black text-stone-900 text-sm leading-tight line-clamp-2">Bosch High-Output Car Alternator 12V 150A</h3>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-stone-500">4.9 (128 reviews)</span>
            </div>
            <div className="flex items-end justify-between mt-auto pt-2">
              <div>
                <p className="text-[10px] font-bold text-stone-500 line-through decoration-stone-300">$320.00</p>
                <p className="font-black text-stone-900 text-lg leading-none tracking-tight">$289.00</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-white transition-all text-stone-400">
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </div>
            </div>
          </div>
        </Link>

        {/* Product Card 2 (Supplier Verification Variant) */}
        <Link href="/product" className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 flex gap-4 hover:border-amber-300 transition-colors group">
          <div className="w-28 h-28 shrink-0 rounded-2xl bg-stone-50 border border-stone-100 flex py-2 px-1 relative">
            <div className="absolute top-1.5 left-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm z-10 flex items-center gap-0.5">
              <ShieldCheck className="w-2 h-2" /> Verified
            </div>
            <img alt="Denso Alternator" className="w-full h-full object-cover mix-blend-multiply grayscale-[20%]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWoEkB2RsSMEKlgmpl_IuSMNmR31XmkAaxKnAPJ6LzgIbZs55okb0y5BVRNpxjloDUtECMDiyomv5N6QcsHdfX_MIM1SLtfl4hFUYv8N6k2AvAs7-mZrOSOaHyc07_WOoBqXBBrAjHfRIzi74uZxVt4zd_hf-fsbm6J30F1SvJPBEVcQ37sH30PlPwMLvJUx8eo4VVsh4CBX_ikCqujlCyLLf7bYsGOm0r9K4MkjuNDtRTv1XXLjttBPoVfpzmPVBTDKSZMN45tAW0" />
          </div>
          <div className="flex flex-col justify-between py-1 w-full">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Part #DN-994-EL</p>
              <h3 className="font-black text-stone-900 text-sm leading-tight line-clamp-2">Denso Heavy-Duty Remanufactured Alternator</h3>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-stone-500">4.7 (89 reviews)</span>
            </div>
            <div className="flex items-end justify-between mt-auto pt-2">
              <div>
                <p className="text-[10px] font-bold text-stone-400 invisible line-through">$0.00</p>
                <p className="font-black text-stone-900 text-lg leading-none tracking-tight">$315.00</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-white transition-all text-stone-400">
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </div>
            </div>
          </div>
        </Link>

        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 flex justify-around items-end pb-5 pt-3 px-2 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <Link href="/" className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
          <Home className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-1 w-12 text-amber-600 transition-colors active:scale-90">
          <Search className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Search</span>
        </Link>
        <Link href="/scan" className="flex flex-col items-center -mt-8 relative z-10 outline-none">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 shadow-[0_4px_16px_rgba(245,158,11,0.45)] flex items-center justify-center text-white border-4 border-[#fafaf9] active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
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
