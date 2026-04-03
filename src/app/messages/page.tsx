import Link from 'next/link';
import { 
  ArrowLeft,
  MessageCircle,
  MoreVertical,
  CheckCheck,
  Search,
  Building2,
  Phone
} from 'lucide-react';

export default function MessagesChatPage() {
  return (
    <div className="bg-[#fafaf9] min-h-screen flex flex-col text-stone-900 font-['Inter',sans-serif]">
      
      {/* App Bar (Chat Header) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <Link href="/orders/123" className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-stone-50 border border-stone-100 text-stone-600 hover:bg-stone-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
                <Building2 className="w-5 h-5 text-stone-400" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-stone-900 leading-tight">Amber Central Warehouse</h2>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wide uppercase">Online • Usually replies in 5m</span>
            </div>
          </div>

          <button className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full text-stone-600 hover:bg-stone-50 active:scale-90 transition-all">
            <Phone className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Context Strip (Order Attachment) */}
        <div className="max-w-lg mx-auto mt-3 bg-stone-50 border border-stone-100 rounded-xl p-2 flex items-center justify-between">
           <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Regarding Order</span>
           <span className="text-xs font-bold text-stone-900 font-mono">#ORD-998-AZ2</span>
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col gap-4 overflow-y-auto pb-32">
        
        {/* Timestamp */}
        <div className="text-center my-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">Yesterday, 14:32</span>
        </div>

        {/* Incoming Bubble */}
        <div className="flex gap-3 justify-start max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-auto">
            <img src="https://ui-avatars.com/api/?name=Amber&background=f5f5f4&color=78716c" className="w-full h-full rounded-full" alt="Supplier" />
          </div>
          <div className="bg-white border border-stone-100 shadow-sm p-3.5 rounded-2xl rounded-bl-sm text-sm font-medium text-stone-700 leading-relaxed">
            Hello Danyal. We received your Request for Availability on the Bosch High-Output Alternator. We are physically checking the bin now.
          </div>
        </div>

        {/* Incoming Bubble Grouped */}
        <div className="flex gap-3 justify-start max-w-[85%]">
          <div className="w-8 h-8 shrink-0"></div> {/* Spacer for avatar alignment */}
          <div className="bg-white border border-stone-100 shadow-sm p-3.5 rounded-2xl rounded-tl-sm rounded-bl-sm text-sm font-medium text-stone-700 leading-relaxed">
            Good news—we have exactly 1 left in OEM sealed condition. I have authorized Escrow on our end. You can proceed to payment whenever ready.
          </div>
        </div>

        {/* Outgoing Bubble */}
        <div className="flex gap-3 justify-end max-w-[85%] self-end mt-4">
          <div className="bg-amber-500 text-stone-950 p-3.5 flex flex-col gap-1 rounded-2xl rounded-br-sm shadow-sm text-sm font-medium leading-relaxed">
            <span>Awesome! I'll fund the escrow immediately. Can you make sure to ship via FedEx Priority Overnight?</span>
            <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
              <span className="text-[9px] font-black uppercase">15:05</span>
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-center my-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">Today, 09:44</span>
        </div>

         {/* Incoming Bubble */}
         <div className="flex gap-3 justify-start max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-auto">
            <img src="https://ui-avatars.com/api/?name=Amber&background=f5f5f4&color=78716c" className="w-full h-full rounded-full" alt="Supplier" />
          </div>
          <div className="bg-white border border-stone-100 shadow-sm p-3.5 rounded-2xl rounded-bl-sm text-sm font-medium text-stone-700 leading-relaxed">
            We saw the Escrow fund come through. We packed it and it's on the FedEx truck now. Tracking: 1Z99923838
          </div>
        </div>

      </main>

      {/* Message Composer Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-3 pb-safe z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="flex-1 bg-stone-50 border border-stone-200 rounded-full flex items-center px-4 py-1">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium py-2 placeholder:text-stone-400"
            />
          </div>
          <button className="w-12 h-12 bg-amber-400 hover:bg-amber-500 rounded-full flex items-center justify-center text-stone-900 border border-amber-500 shadow-lg shadow-amber-500/20 active:scale-90 transition-all shrink-0">
             <MessageCircle className="w-5 h-5 fill-stone-900" strokeWidth={0} />
          </button>
        </div>
      </div>

    </div>
  );
}
