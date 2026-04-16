"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "supplier">("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      setAuth(res.user, res.token);

      if (res.user.role === "supplier") {
        router.push("/supplier/inquiries");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
              Create Your Account
            </h1>
            <p className="text-stone-500 mt-2 text-sm">
              Join FindMySpare as a buyer or supplier.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Role Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                role === "buyer"
                  ? "border-amber-500 bg-amber-50 text-stone-900"
                  : "border-stone-200 bg-white text-stone-500"
              }`}
            >
              🛒 Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole("supplier")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                role === "supplier"
                  ? "border-amber-500 bg-amber-50 text-stone-900"
                  : "border-stone-200 bg-white text-stone-500"
              }`}
            >
              🔧 Supplier
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading
                ? "Creating Account..."
                : role === "supplier"
                ? "Register as Supplier"
                : "Register as Buyer"}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <div className="bg-stone-50 p-6 border-t border-stone-100 text-center">
          <p className="text-stone-600 text-sm font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-amber-600 hover:text-amber-700 font-bold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
