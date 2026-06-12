"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Zap } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020108] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.05),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-lg bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 flex items-center justify-center group-hover:bg-[#FFFFFF]/20 transition-colors">
              <Zap className="w-6 h-6 text-[#FFFFFF]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Elite<span className="text-[#FFFFFF]">Hosting</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome back.</h1>
          <p className="text-gray-400">Sign in to your dashboard and ship today.</p>
        </div>

        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or Mobile"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-sm font-medium text-gray-400">Password</label>
                <Link href="/auth/forgot-password" title="Coming soon" className="text-xs text-[#FFFFFF] hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-[#FFFFFF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              New to EliteHosting?{" "}
              <Link href="/auth/register" className="text-white font-semibold hover:text-[#FFFFFF] transition-colors">
                Create free account
              </Link>
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-8 grid grid-cols-4 gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="text-center">
            <div className="text-xs font-bold">2,847+</div>
            <div className="text-[10px] text-gray-500 uppercase">Devs</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold">99.9%</div>
            <div className="text-[10px] text-gray-500 uppercase">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold">&lt;30ms</div>
            <div className="text-[10px] text-gray-500 uppercase">Latency</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold">₹99</div>
            <div className="text-[10px] text-gray-500 uppercase">Price</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
