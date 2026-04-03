import Link from 'next/link';
import { 
  ArrowLeft, 
  UploadCloud, 
  Car, 
  FileText, 
  Tag,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function PartRequestPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      
      {/* Top App Bar Custom Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] pt-2 pb-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3 mt-2">
          <Link href="/" className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-sm font-black tracking-tight text-stone-900">Custom Part Sourcing</h2>
            <span className="text-[10px] font-bold text-stone-400">Amber Industrial Network</span>
          </div>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Intro */}
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg shadow-amber-500/10">
            <FileText className="w-7 h-7 text-amber-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">Can't Find Something?</h1>
          <p className="text-sm font-medium text-stone-500 leading-relaxed">
            Describe what you need. Our network of 5,000+ verified suppliers will source it and send you a custom quote in under 24 hours.
          </p>
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-stone-100 space-y-6">
          
          {/* Equipment Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500">Equipment / Vehicle Details</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. 2019 Ford F-150 / CAT Excavator 308" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
              />
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={2.5} />
            </div>
          </div>

          {/* Part Name / OEM */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500">Part Number or Name</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="OEM Part Number, Brand, or Alias" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
              />
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={2.5} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500">Detailed Description</label>
            <textarea 
              rows={4}
              placeholder="Describe what happened to the old part, or specific variations you need..." 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500">Attach Photos (Optional)</label>
            <div className="w-full border-2 border-stone-200 border-dashed rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 gap-2">
              <UploadCloud className="w-8 h-8 text-amber-500" strokeWidth={2} />
              <p className="text-sm font-bold text-stone-600">Upload Broken Part Image</p>
              <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">JPEG, PNG up to 10MB</p>
            </div>
          </div>

        </div>

      </main>

      {/* Sticky Bottom Release Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-4 pb-safe z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto pb-4">
          <button className="w-full bg-gradient-to-r from-stone-900 to-stone-800 text-white border border-stone-900 py-4.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 group transition-all shadow-xl shadow-stone-900/20 active:scale-95">
            <ShieldCheck className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
            Submit Sourcing Request
          </button>
          <p className="text-[10px] font-bold text-center text-stone-400 mt-2">No payment required. You'll receive actionable quotes.</p>
        </div>
      </div>

    </div>
  );
}
