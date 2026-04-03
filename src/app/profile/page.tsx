import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Package, 
  CreditCard, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen text-stone-900 pb-32 font-['Inter',sans-serif] hide-scrollbar">
      
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <h2 className="text-lg font-black tracking-tight text-center text-stone-900">Your Profile</h2>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <Settings className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          
          {/* Left Sidebar: Settings Links */}
          <div className="w-full md:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              <Link href="/orders" className="flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                    <Package className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-stone-900 text-[15px]">Order Pipeline</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transition-colors" strokeWidth={2.5} />
              </Link>
              <button className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center shrink-0 border border-stone-200">
                    <MapPin className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-stone-900 text-[15px]">Saved Addresses</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transition-colors" strokeWidth={2.5} />
              </button>
              <button className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center shrink-0 border border-stone-200">
                    <CreditCard className="w-5 h-5 text-stone-500" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-stone-900 text-[15px]">Payment Methods</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transition-colors" strokeWidth={2.5} />
              </button>
            </div>

            <Link href="/supplier" className="w-full flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Zap className="w-5 h-5 text-stone-900" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start">
                   <span className="font-black text-stone-900 text-[15px] leading-tight">Become a Supplier</span>
                   <span className="font-bold text-amber-700 text-[10px] uppercase tracking-widest leading-tight mt-0.5">Partner Program</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500 group-hover:text-stone-900 transition-colors" strokeWidth={2.5} />
            </Link>

            <button className="w-full flex items-center justify-center gap-2 py-4 mt-6 text-red-500 font-black text-[13px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
              Sign Out
            </button>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-stone-100">
              <div className="flex items-center gap-5 md:gap-8">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-4xl border-4 border-white">
                    D
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-white shadow-sm">
                    Verified
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">Danyal Developer</h1>
                  <p className="text-base md:text-lg font-bold text-stone-500 mt-1">Industrial Repair Shop</p>
                  <div className="flex items-center gap-1.5 mt-3 bg-stone-50 border border-stone-100 w-fit px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-500 mb-2 md:mb-0">
                    <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" strokeWidth={3} />
                    Pro Buyer Account
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 shadow-lg shadow-stone-900/10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                <TrendingUp className="w-6 h-6 text-amber-400 mb-3 relative z-10" strokeWidth={2.5} />
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter relative z-10">$12.4k</h3>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2 relative z-10">Escrow Spend</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col justify-between hover:border-amber-200 transition-colors">
                <FileText className="w-6 h-6 text-stone-400 mb-3" strokeWidth={2.5} />
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-stone-900">14</h3>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">Active RFQs</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hidden lg:flex flex-col justify-between hover:border-amber-200 transition-colors">
                <Package className="w-6 h-6 text-stone-400 mb-3" strokeWidth={2.5} />
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-stone-900">8</h3>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">Active Orders</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
