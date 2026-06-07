"use client";

import { useState, useEffect } from "react";
import { Users, Server, ShieldAlert, Activity, FileText, Search, ExternalLink, Lock, Eye, EyeOff, Loader2, Wallet, Check, X, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { validateAdminPassword } from "@/app/actions/admin-auth";
import { getPlatformSetting, updatePlatformSetting, getPendingWithdrawals, updateWithdrawalStatus } from "@/app/actions/platform";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: Users, color: "text-primary" },
    { label: "Total Projects", value: "0", icon: Server, color: "text-emerald-500" },
    { label: "Active Deployments", value: "0", icon: Activity, color: "text-accent" },
    { label: "Mumbai Node", value: "Online", icon: ShieldAlert, color: "text-emerald-500" },
  ]);

  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [freePlanEnabled, setFreePlanEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(false);

    try {
      const result = await validateAdminPassword(password);
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(true);
      }
    } catch (error) {
      setAuthError(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: userData, count: userCount } = await supabase.from('users').select('*', { count: 'exact' });
      const { data: projectData, count: projectCount } = await supabase.from('projects').select('*', { count: 'exact' });
      const { count: deployCount } = await supabase.from('deployments').select('*', { count: 'exact', head: true });

      const pendingWithdrawals = await getPendingWithdrawals();
      const freePlan = await getPlatformSetting('free_plan_enabled');

      setUsers(userData || []);
      setProjects(projectData || []);
      setWithdrawals(pendingWithdrawals);
      setFreePlanEnabled(freePlan === true);

      setStats([
        { label: "Total Users", value: userCount?.toString() || "0", icon: Users, color: "text-primary" },
        { label: "Total Projects", value: projectCount?.toString() || "0", icon: Server, color: "text-emerald-500" },
        { label: "Active Deployments", value: deployCount?.toString() || "0", icon: Activity, color: "text-accent" },
        { label: "Mumbai Node", value: "Online", icon: ShieldAlert, color: "text-emerald-500" },
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreePlan = async () => {
    const newValue = !freePlanEnabled;
    const res = await updatePlatformSetting('free_plan_enabled', newValue);
    if (res.success) setFreePlanEnabled(newValue);
  };

  const handleWithdrawal = async (id: string, status: 'approved' | 'rejected') => {
    const res = await updateWithdrawalStatus(id, status);
    if (res.success) {
      setWithdrawals(prev => prev.filter(w => w.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 space-y-6" hover={false}>
          <div className="text-center space-y-2">
            <div className="relative w-12 h-12 mx-auto mb-4">
               <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold font-heading">Admin Access</h1>
            <p className="text-text-secondary text-sm">Enter the master password to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full bg-void/50 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all",
                    authError ? "border-red-500" : "border-white/10 focus:border-primary/50"
                  )}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Invalid password</p>}
            </div>
            <AnimatedButton type="submit" className="w-full gap-2" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {isLoggingIn ? "Validating..." : "Unlock Dashboard"}
            </AnimatedButton>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-[#0B0F19] min-h-screen text-[#F9FAFB]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-heading">Admin Command Center</h1>
          <p className="text-text-secondary">System-wide monitoring and real-time analytics.</p>
        </div>
        <div className="flex gap-3">
          <AnimatedButton variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <Activity className="w-4 h-4" /> Refresh Data
          </AnimatedButton>
          <button className="px-6 py-2 bg-red-600/10 border border-red-600/20 text-red-500 font-bold rounded-xl hover:bg-red-600/20 transition-all text-sm uppercase tracking-widest">
            Emergency Lockdown
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <GlassCard key={idx} className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-white/5 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Live</span>
            </div>
            <div className="text-3xl font-bold mb-1 font-mono">{s.value}</div>
            <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Settings */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Platform Settings
          </h2>
          <GlassCard className="p-6 space-y-6" hover={false}>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-bold">Free Plan Status</div>
                <div className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                  {freePlanEnabled ? 'Currently Active' : 'Currently Disabled'}
                </div>
              </div>
              <button
                onClick={handleToggleFreePlan}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  freePlanEnabled ? "bg-emerald-500" : "bg-white/10"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  freePlanEnabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
               <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Security Status</div>
               <div className="text-lg font-bold">SQL Injection Guard Active</div>
               <div className="text-[10px] text-text-secondary mt-1">Real-time threat monitoring is enabled.</div>
            </div>
          </GlassCard>

          {/* Withdrawals */}
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2 mt-10">
            <Wallet className="w-6 h-6 text-accent" /> Withdrawal Requests
          </h2>
          <GlassCard className="p-0 overflow-hidden" hover={false}>
            <div className="divide-y divide-white/5">
               {withdrawals.length > 0 ? withdrawals.map((w) => (
                 <div key={w.id} className="p-4 space-y-3 hover:bg-white/2 transition-colors">
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="font-bold text-sm">₹{w.amount}</div>
                          <div className="text-[10px] text-text-secondary font-mono mt-1">{w.upi_id}</div>
                       </div>
                       <div className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-lg">Pending</div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] text-text-secondary">By: {w.users.username}</div>
                       <div className="flex gap-2">
                          <button onClick={() => handleWithdrawal(w.id, 'approved')} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleWithdrawal(w.id, 'rejected')} className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30">
                            <X className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </div>
                 </div>
               )) : (
                 <div className="p-8 text-center text-text-secondary italic text-sm">No pending requests.</div>
               )}
            </div>
          </GlassCard>
        </div>

        {/* User Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading">User Directory</h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input type="text" placeholder="Search users..." className="w-full bg-void/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <GlassCard className="overflow-hidden" hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                             {u.username[0].toUpperCase()}
                           </div>
                           <div>
                              <div className="font-bold text-sm">{u.username}</div>
                              <div className="text-[10px] text-text-secondary">{u.email}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                          u.plan === 'pro' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-text-secondary'
                        )}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {u.credit_balance.toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-text-secondary italic text-sm">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Projects Table */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading">Recent Deployments</h2>
          <GlassCard className="overflow-hidden" hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Project</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Framework</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.length > 0 ? projects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-[10px] text-text-secondary font-mono">{p.subdomain}.elitehosting.in</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5 text-text-secondary" />
                           <span className="text-xs uppercase tracking-wider font-bold">{p.framework || 'unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
                          p.status === 'ready' ? 'text-emerald-500' : 'text-primary'
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", p.status === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-primary')} />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-text-secondary italic text-sm">No projects active.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
