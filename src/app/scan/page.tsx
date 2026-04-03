import Link from 'next/link';
import { 
  X, 
  Flashlight, 
  Image as ImageIcon,
  Aperture,
  Settings,
  ScanLine
} from 'lucide-react';

export default function PartScannerPage() {
  return (
    <div className="bg-stone-950 min-h-screen text-white font-['Inter',sans-serif] hide-scrollbar relative overflow-hidden flex flex-col">
      
      {/* Mock Camera Feed Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
           {/* Placeholder for actual camera feed. We'll use a static tech background for the mock */}
        </video>
        <div className="absolute inset-0 bg-stone-950/40"></div>
      </div>

      {/* Top Camera Controls */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900/80 backdrop-blur border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors">
          <X className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        
        <div className="flex gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900/80 backdrop-blur border border-stone-800 text-amber-400 hover:bg-stone-800 transition-colors">
            <Flashlight className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900/80 backdrop-blur border border-stone-800 text-stone-300 hover:bg-stone-800 transition-colors">
            <Settings className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* AI Crosshair / Focus Area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-8">
        
        <p className="text-stone-300 font-black text-sm tracking-widest uppercase mb-8 text-center drop-shadow-md">
          ALIGN PART WITHIN FRAME
        </p>

        {/* Reticle Focus Area */}
        <div className="w-full aspect-square max-w-[280px] relative">
          {/* Corner Guides */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl"></div>
          
          {/* Scanning Animation */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
             <div className="w-full h-1 bg-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,1)] absolute animate-[scan_2.5s_ease-in-out_infinite]"></div>
          </div>
          <div className="absolute inset-0 border border-stone-100/10 rounded-xl"></div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 p-8 pb-12 flex items-center justify-between bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent">
        <button className="w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl text-stone-300 hover:text-white transition-colors">
          <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden">
             <ImageIcon className="w-5 h-5" />
          </div>
        </button>

        {/* Capture Shutter */}
        <button className="w-20 h-20 rounded-full border-4 border-amber-400/50 flex items-center justify-center p-1 active:scale-90 transition-transform">
          <div className="w-full h-full bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
             <Aperture className="w-8 h-8 text-stone-950" strokeWidth={2} />
          </div>
        </button>

        <Link href="/requests" className="w-14 h-14 flex flex-col items-center justify-center rounded-2xl text-stone-300 hover:text-white transition-colors">
          <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden">
             <ScanLine className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[9px] font-black tracking-widest mt-1">MANUAL</span>
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
