"use client";

import { motion } from "framer-motion";
import { Users, Gift, TrendingUp, Wallet, ArrowRight, Copy, Check, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { submitWithdrawalRequest } from "@/app/actions/credits";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRefers: 0,
    activeRefers: 0,
    totalEarnings: 0,
    walletBalance: 0
  });
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("LOADING...");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (userData) {
      setUser(userData);
      setReferralCode(userData.username.toUpperCase());
      setStats(prev => ({
        ...prev,
        walletBalance: Number(userData.wallet_balance || 0)
      }));

      // Fetch referrals
      const { data: referrals, count } = await supabase
        .from('referrals')
        .select('*, referred:referred_id(username, created_at)', { count: 'exact' })
        .eq('referrer_id', userData.id);

      if (referrals) {
        setRecentReferrals(referrals);
        setStats(prev => ({
          ...prev,
          totalRefers: count || 0,
          activeRefers: referrals.filter(r => r.status === 'completed').length,
          totalEarnings: referrals.reduce((acc, r) => acc + (r.status === 'completed' ? Number(r.reward_amount) : 0), 0)
        }));
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://www.elitehosting.in/auth/register?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitWithdrawalRequest(user.id, Number(withdrawAmount), upiId);

    if (res.success) {
        setWithdrawAmount("");
        setUpiId("");
        alert("Withdrawal request submitted successfully!");
        fetchData();
    } else {
        setError(res.error || "Failed to submit request");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-white/40 mt-1">Invite friends and earn 20% commission on every purchase.</p>
        </div>
        <div className="flex items-center gap-3 p-1 bg-white/5 border border-white/10 rounded-2xl">
           <div className="px-4 py-2 text-sm font-mono text-electric">{referralCode}</div>
           <button
             onClick={copyToClipboard}
             className="p-2 bg-electric text-void rounded-xl hover:scale-105 active:scale-95 transition-all"
           >
             {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Refers", value: stats.totalRefers, icon: Users, color: "text-blue-500" },
          { label: "Active Refers", value: stats.activeRefers, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Total Earnings", value: `₹${stats.totalEarnings.toFixed(2)}`, icon: Gift, color: "text-purple-500" },
          { label: "Wallet Balance", value: `₹${stats.walletBalance.toFixed(2)}`, icon: Wallet, color: "text-electric" },
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-6" hover={false}>
            <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color} mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold font-mono">{stat.value}</div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Recent Referrals</h2>
          <GlassCard className="overflow-hidden" hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentReferrals.length > 0 ? recentReferrals.map((ref, i) => (
                    <tr key={i} className="hover:bg-white/2 transition-colors">
                       <td className="px-6 py-4 text-sm font-medium">{(ref.referred as any)?.username || 'Unknown'}</td>
                       <td className="px-6 py-4 text-sm text-white/40">{new Date(ref.created_at).toLocaleDateString()}</td>
                       <td className={`px-6 py-4 font-mono text-sm ${ref.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        ₹{Number(ref.reward_amount).toFixed(2)}
                       </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-white/20 italic text-sm">
                        No referrals yet. Start sharing your link!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Withdraw Funds</h2>
          <GlassCard className="p-6 space-y-6" hover={false} glow>
            <div className="p-4 rounded-xl bg-electric/10 border border-electric/20">
               <div className="text-xs text-electric font-bold uppercase tracking-widest mb-1">Available for Withdrawal</div>
               <div className="text-3xl font-bold font-mono">₹{stats.walletBalance.toFixed(2)}</div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-white/40 uppercase ml-1">Withdraw Amount</label>
                 <input
                   type="number"
                   required
                   value={withdrawAmount}
                   onChange={(e) => setWithdrawAmount(e.target.value)}
                   placeholder="₹500 minimum"
                   className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric/50"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-white/40 uppercase ml-1">UPI ID / Bank Details</label>
                 <input
                   type="text"
                   required
                   value={upiId}
                   onChange={(e) => setUpiId(e.target.value)}
                   placeholder="user@upi"
                   className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric/50"
                 />
               </div>
               {error && (
                 <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase flex items-center gap-2">
                   <AlertCircle className="w-3.5 h-3.5" />
                   {error}
                 </div>
               )}

               <AnimatedButton type="submit" loading={loading} className="w-full">
                 Request Withdrawal
               </AnimatedButton>
            </form>

            <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest justify-center">
               <Clock className="w-3 h-3" />
               Processed within 24-48 hours
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
