'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  Search, 
  Truck, 
  User, 
  Settings, 
  Zap,
  ShoppingCart
} from 'lucide-react';

export default function DesktopNav() {
  const pathname = usePathname();
  
  return (
    <nav className="hidden md:flex sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center shadow-lg shadow-stone-900/20 group-hover:shadow-amber-500/20 transition-all">
            <Package className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
          </div>
          <span className="font-black text-stone-900 tracking-tight text-lg group-hover:text-amber-600 transition-colors">
            FindMySpare
          </span>
        </Link>
        
        {/* Primary Links */}
        <div className="flex items-center gap-8 ml-10">
          <Link href="/search" className={`text-sm font-bold transition-all ${pathname === '/search' ? 'text-amber-600' : 'text-stone-500 hover:text-stone-900'}`}>
             Catalog
          </Link>
          <Link href="/requests" className={`text-sm font-bold transition-all ${pathname === '/requests' ? 'text-amber-600' : 'text-stone-500 hover:text-stone-900'}`}>
             File RFQ
          </Link>
          <Link href="/orders" className={`text-sm font-bold transition-all ${pathname.startsWith('/orders') ? 'text-amber-600' : 'text-stone-500 hover:text-stone-900'}`}>
             Procurement Pipeline
          </Link>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-4">
          
          {/* Supplier Gateway Button */}
          <Link href="/supplier" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-black tracking-widest uppercase hover:bg-amber-100 transition-colors">
             <Zap className="w-3.5 h-3.5" fill="currentColor" />
             Become a Supplier
          </Link>

          <div className="w-px h-6 bg-stone-200 mx-1"></div>

          <Link href="/cart" className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all">
            <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
          </Link>

          <Link href="/profile" className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all">
            <User className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </nav>
  );
}
