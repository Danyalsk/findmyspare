"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";

export default function SupplierLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.user.role !== "supplier") {
        throw new Error("This portal is restricted to authorized suppliers only.");
      }

      setAuth(res.user, res.token);
      router.push("/supplier/inquiries");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-stone-800 rounded-2xl shadow-xl overflow-hidden border border-stone-700">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">
              Supplier Command Center
            </h1>
            <p className="text-stone-400 mt-2 text-sm">
              Log in to view incoming parts inquiries and manage your sales.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/50 text-red-400 rounded-xl text-sm font-medium border border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">
                Authorized Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-900 text-stone-100 focus:bg-stone-950 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all placeholder-stone-600"
                placeholder="supplier@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-900 text-stone-100 focus:bg-stone-950 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all placeholder-stone-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-100 hover:bg-white text-stone-900 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <div className="bg-stone-950/50 p-6 border-t border-stone-800 mt-2 text-center">
          <p className="text-stone-500 text-sm font-medium">
            Not a registered supplier?
          </p>
          <Link
            href="/login"
            className="mt-3 inline-flex items-center gap-2 text-stone-300 hover:text-white font-bold text-sm bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded-lg transition-colors border border-stone-700"
          >
            <User className="w-4 h-4" />
            Go to Buyer Login
          </Link>
        </div>
      </div>
    </main>
  );
}
