import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  ShoppingCart, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Award, 
  Truck, 
  Home, 
  Car, 
  PlusCircle, 
  Package, 
  User,
  Plus,
  Minus
} from 'lucide-react';

export default function ProductPage() {
  return (
    <div className="bg-[#fafaf9] text-stone-900 h-screen overflow-y-auto hide-scrollbar pb-24 font-sans">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <h1 className="font-black text-lg tracking-tight text-stone-900">FindMySpare</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <Settings className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all relative">
            <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 border-2 border-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">2</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-5xl mx-auto space-y-6">
        {/* Product Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 relative group">
              <img alt="Bosch Alternator" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy5OQtWPT6AfX-zfW3Qex-IduwLppRhjuThFasFFglp6kzCWnPdqa92dr8E9XhQZQ-tbuiM3ZkiDgOYX16IR7axhG15Wb-aY_IrFtFTk5wVsG8TXBfLo_Cc0IH4gVQj3ZQO9gUc1Il28jzU1VTuzzv5iityHPCp13_mCIfbQHAO5w5lh8CHcMXnFKhS2lxmUZR0KKQHjSIZRYG4tMxW210zw8pPgtr0ZvMaQfeoCr1ZmeZMwGt3v5K3EcE--4crUP3LViqb816bRTo" />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-amber-400 text-stone-900 border border-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">Verified Spare</span>
              </div>
            </div>
            
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2">
              <button className="w-20 h-20 rounded-2xl bg-white border-2 border-amber-400 flex-shrink-0 overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
                <img alt="Thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBND92MS0vS2zvbdb9TBJxVY4GDAcFV-eozlXiK-gjNR9vRvgm5W01I0-0_f5DMKj9V83HY_r01Dg5u9AfP6TUfFxvyUOUY54DhgGj6QZ3JHoF6KPjlYG2Vc5DczSXu3yDU3yJymjyyegtVFhVlJBHas9Cq9Q6Pva4vx4SkLyKGLB1kwiKrRaRWB1lP4TzQ9WoQH_xMvlcrzEjI2CAWgS131XFiATYiV-5JgSxU36Q-_Y5OBxyQa5Ys8facT4ixvOy0Pl5UyN-CylIC" />
              </button>
              <button className="w-20 h-20 rounded-2xl bg-white border border-stone-200 flex-shrink-0 overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                <img alt="Thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4cFAa_YCQSLJVjfK01pz6fRkYjAN0Pzaq7TBf-d3qEp2PerzbUfOmFN_JAY_0N5R5lY7fa8mLrzmIXVeoiTsRExTcCYIZE6kR2TXQvXH2-QGrYK4fGLiTBShfPLyl6NFElbw_NF967DkEbDnVlQTpoYjqRRE4_Q_ICg7OA7FSBZ6MKcdco7yeTRizrwvdxSQ2ZxBLHL0G2Pg2mNMfikguxVOmEFomWzyLmfZd6oLY8qfichnGxd1vLgr3XM59EyFuHfGyhr6lEx3E" />
              </button>
            </div>
          </div>

          {/* Product Summary Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">Bosch AL0851N New Alternator</h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-stone-500 text-sm font-semibold">Part No:</p>
                <code className="bg-stone-100 text-stone-800 text-xs font-bold px-2 py-1 rounded-md">BOS-77291-AM</code>
              </div>
            </div>

            {/* Compatibility Badge */}
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 flex items-center gap-4 mb-6 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Fits your BMW 3 Series</p>
                <p className="text-xs font-medium text-emerald-700/80 mt-0.5">Based on your saved vehicle (2018 330i)</p>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-stone-100 flex-1 flex flex-col justify-end">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Your Price</p>
                  <span className="text-4xl font-black tracking-tighter text-stone-900">$120.00</span>
                </div>
                <span className="text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">Only 2 left in stock</span>
              </div>

              <div className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-2xl p-2 mb-6 w-full lg:mb-8">
                <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-colors active:scale-90">
                  <Minus className="w-4 h-4" strokeWidth={3} />
                </button>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-stone-900 leading-none">1</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mt-1">Quantity</span>
                </div>
                <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-600 hover:text-amber-600 hover:border-amber-200 transition-colors active:scale-90">
                  <Plus className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>

              <div className="bg-[#fafaf9] rounded-2xl p-4 border border-stone-100 mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-5 h-5 text-amber-500 shrink-0" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm font-black text-stone-900 leading-tight">Free Next-Day Delivery</p>
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mt-0.5">Order within 2 hrs 14 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm font-black text-stone-900 leading-tight">14-Day Free Returns</p>
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mt-0.5">Must be uninstalled & sealed</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-stone-900 border border-amber-400/50 py-4 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                  Add to Inquiry
                </button>
                <button className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-stone-900/10">
                  <ShieldCheck className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
                  Request Availability
                </button>
              </div>
              
              <div className="pt-5 flex items-center gap-2 justify-center opacity-70 hover:opacity-100 transition-opacity">
                <Lock className="w-3.5 h-3.5 text-stone-500" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Secured by Industrial Escrow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Key Features */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Product Description
            </h3>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-sm leading-relaxed text-stone-500 text-sm font-medium">
              This Bosch Alternator is engineered to provide superior performance and reliability in extreme conditions. Built with high-quality internal components, it ensures a stable voltage output to power your vehicle&apos;s electrical systems while maintaining battery health.
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50 group hover:bg-amber-50 transition-colors">
                <Award className="w-7 h-7 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Warranty</p>
                <p className="text-[14px] font-black text-stone-800 mt-1">24 Months Limited</p>
              </div>
              <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 group hover:bg-blue-50 transition-colors">
                <Truck className="w-7 h-7 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Delivery</p>
                <p className="text-[14px] font-black text-stone-800 mt-1">Next Day (by 10 AM)</p>
              </div>
            </div>
          </div>
          
          {/* Technical Specs */}
          <div className="bg-stone-100/50 rounded-3xl p-6 sm:p-8 border border-stone-200/50">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-6 relative inline-block">
              Specifications
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-stone-300 rounded-full" />
            </h3>
            <div className="space-y-4">
              {[
                { label: "Amperage", value: "150 Amps" },
                { label: "Voltage", value: "12 Volts" },
                { label: "Rotation", value: "CW Rotation" },
                { label: "Weight", value: "12.4 lbs" },
                { label: "Core Charge", value: "$45.00" },
              ].map((spec, i, arr) => (
                <div key={spec.label} className={`flex justify-between items-center ${i !== arr.length - 1 ? "border-b border-stone-200/80 pb-3" : ""}`}>
                  <span className="text-sm font-medium text-stone-500">{spec.label}</span>
                  <span className="text-sm font-black text-stone-800">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Block */}
        <div className="bg-amber-400/5 rounded-3xl p-6 sm:p-8 border border-amber-400/20 flex flex-col md:flex-row items-center gap-6 mt-4">
          <div className="w-16 h-16 bg-amber-100/50 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-amber-600" strokeWidth={2} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-black text-lg text-stone-900 leading-tight">Amber Protection Guaranteed</h4>
            <p className="text-sm font-medium text-stone-500 mt-1">Your payment is held in escrow until you confirm the part fits and functions as described. 14-day hassle-free returns.</p>
          </div>
          <button className="text-sm font-black text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-6 py-3 rounded-xl transition-colors whitespace-nowrap border border-amber-200/50">
            Learn More
          </button>
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
        <button className="flex flex-col items-center gap-1 w-12 text-amber-600 transition-colors active:scale-90">
          <Car className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Product</span>
        </button>
        <button className="flex flex-col items-center -mt-8 relative z-10 outline-none">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 shadow-[0_4px_16px_rgba(245,158,11,0.45)] flex items-center justify-center text-white border-4 border-[#fafaf9] active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
          <Package className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 text-stone-400 hover:text-amber-500 transition-colors active:scale-90">
          <User className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-black text-[9px] tracking-wider uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
}
