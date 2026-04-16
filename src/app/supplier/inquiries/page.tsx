"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import { Package, Search, ExternalLink, Calendar, MapPin, Target } from "lucide-react";

export default function SupplierInquiriesPage() {
  const { user, token, logout, isHydrated } = useAuthStore();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || !token || user.role !== "supplier") {
      router.push("/supplier/login");
      return;
    }

    const fetchInquiries = async () => {
      try {
        const data = await fetchApi("/inquiries", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInquiries(data.inquiries || []);
      } catch (err: any) {
        setError(err.message || "Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user, token, isHydrated, router]);

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* Top Nav */}
      <nav className="bg-stone-950 border-b border-stone-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-stone-900" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white leading-tight">Supplier Center</h1>
            <p className="text-xs text-stone-400 font-medium">FindMySpare Business</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-stone-300 bg-stone-800 px-3 py-1.5 rounded-full">
            {user?.name}
          </span>
          <button 
            onClick={() => {
              logout();
              router.push("/supplier/login");
            }}
            className="text-stone-400 hover:text-white text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Active Inquiries</h2>
            <p className="text-stone-400 mt-1">Live requests from buyers looking for parts right now.</p>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search parts, makes..." 
              className="bg-stone-800 border border-stone-700 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 w-full md:w-64"
            />
          </div>
        </header>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-red-400 mb-8 font-medium">
            {error}
          </div>
        )}

        {inquiries.length === 0 && !error ? (
          <div className="bg-stone-800/50 border border-stone-800 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-stone-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Inquiries</h3>
            <p className="text-stone-400 max-w-sm">
              We'll notify you as soon as buyers request parts matching your inventory. Keep an eye out!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inquiries.map((inq: any) => (
              <div key={inq.id} className="bg-stone-800 border border-stone-700 hover:border-stone-600 transition-colors rounded-2xl p-5 flex flex-col relative group">
                
                {/* Status Badge */}
                <div className="absolute top-5 right-5">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                    inq.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                    inq.status === 'responded' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    'bg-stone-700 text-stone-400'
                  }`}>
                    {inq.status}
                  </span>
                </div>

                <div className="mb-4 pr-16">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{inq.partName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold bg-stone-700/50 text-stone-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {inq.make} {inq.model}
                    </span>
                    <span className="text-xs font-semibold bg-stone-700/50 text-stone-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {inq.year}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-stone-400 line-clamp-2 mb-6 flex-grow">
                  {inq.description || "No description provided by the buyer."}
                </p>
                
                <div className="pt-4 border-t border-stone-700/50 flex items-center justify-between mt-auto">
                  <div className="text-xs text-stone-500 font-medium">
                    {new Date(inq.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <button className="text-sm font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
                    Send Quote
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
