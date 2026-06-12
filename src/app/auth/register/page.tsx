"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Zap, User, Gift, Phone } from "lucide-react";
import { getPlatformSetting } from "@/app/actions/platform";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [freePlanEnabled, setFreePlanEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getPlatformSetting('free_plan_enabled').then(val => {
        if (val !== null) setFreePlanEnabled(val === true);
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mobile, password, username, referralCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
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
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter uppercase">
              EliteHosting
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Create your account.</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Join elite developers and ship in seconds.</p>
        </div>

        <div className="p-8 rounded-sm border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          {freePlanEnabled && (
            <div className="mb-6 p-3 rounded-sm bg-white/10 border border-white/20 flex items-center gap-3">
              <Gift className="w-5 h-5 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">2 free credits — no card required</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="johndoe"
                  className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/40 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="9931989952"
                  className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/40 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/40 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/40 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Referral Code (Optional)</label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ELITE2025"
                  className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/40 transition-all font-mono uppercase text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-white text-black rounded-sm font-bold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-[0.2em] ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-200 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-gray-400 hover:text-white underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-gray-400 hover:text-white underline">Privacy</Link>.
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-white font-semibold hover:text-[#00E5FF] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
