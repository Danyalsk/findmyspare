"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";

export default function BuyerLoginPage() {
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

      setAuth(res.user, res.token);

      // On successful buyer login
      if (res.user.role === "supplier") {
        router.push("/supplier/inquiries");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Sign In to FindMySpare
            </h1>
            <p className="text-stone-500 mt-2 text-sm">
              Enter your buyer account details to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Authenticating..." : "Sign In via Secure Portal"}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <div className="bg-stone-50 p-6 border-t border-stone-100 mt-2 text-center space-y-3">
          <p className="text-stone-600 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-bold">
              Register
            </Link>
          </p>
          <p className="text-stone-600 text-sm font-medium">
            Are you an auto parts supplier?
          </p>
          <Link
            href="/supplier/login"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-bold text-sm bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors border border-amber-200"
          >
            <Settings className="w-4 h-4" />
            Go to Supplier Portal Instead
          </Link>
        </div>
      </div>
    </main>
  );
}
