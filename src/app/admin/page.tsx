"use client";

import { useState, useEffect } from "react";
import { Users, Server, ShieldAlert, Activity, FileText, Search, Lock, Eye, EyeOff, Loader2, Wallet, Check, X, Settings, Plus, Minus, CreditCard, MessageCircle, Bell, Gift, Send } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { validateAdminPassword } from "@/app/actions/admin-auth";
import { getPlatformSetting, updatePlatformSetting, getPendingWithdrawals, updateWithdrawalStatus, getAdminData, updateUserCredits, approvePaymentRequest, banUser, unbanUser, blockIP } from "@/app/actions/platform";
import { getAdminChats, getConversationForAdmin, adminReply } from "@/app/actions/chat";
import { sendBroadcast } from "@/app/actions/broadcast";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: Users, color: "text-primary" },
    { label: "Total Projects", value: "0", icon: Server, color: "text-emerald-500" },
    { label: "Active Deployments", value: "0", icon: Activity, color: "text-accent" },
    { label: "System Credits", value: "0", icon: Wallet, color: "text-primary" },
    { label: "Trial Users", value: "0", icon: Gift, color: "text-emerald-500" },
    { label: "Mumbai Node", value: "Online", icon: ShieldAlert, color: "text-emerald-500" },
  ]);

  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [freePlanEnabled, setFreePlanEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditExpiry, setCreditExpiry] = useState("");

  // Admin Chat State
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const result = await validateAdminPassword(password);
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(result.error || "Invalid password");
      }
    } catch (error) {
      setAuthError("An unexpected error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchChats();
      const interval = setInterval(fetchChats, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchChats = async () => {
    const res = await getAdminChats();
    if (res.success) setChats(res.chats || []);
  };

  useEffect(() => {
    if (selectedChatUser) {
      fetchConversation(selectedChatUser);
      const interval = setInterval(() => fetchConversation(selectedChatUser), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChatUser]);

  const fetchConversation = async (userId: string) => {
    const res = await getConversationForAdmin(userId);
    if (res.success) setChatMessages(res.messages || []);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUser || !replyText.trim()) return;
    setSendingReply(true);
    const res = await adminReply(selectedChatUser, replyText);
    if (res.success) {
      setReplyText("");
      fetchConversation(selectedChatUser);
    }
    setSendingReply(false);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setSendingBroadcast(true);
    const res = await sendBroadcast(broadcastTitle, broadcastMessage);
    if (res.success) {
      setBroadcastTitle("");
      setBroadcastMessage("");
      alert("Broadcast sent to all users!");
    }
    setSendingBroadcast(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminData = await getAdminData();
      const pendingWithdrawals = await getPendingWithdrawals();
      const freePlan = await getPlatformSetting('free_plan_enabled');

      setUsers(adminData.users);
      setProjects(adminData.projects);
      setPaymentRequests(adminData.paymentRequests);
      setWithdrawals(pendingWithdrawals);
      setFreePlanEnabled(freePlan === true);

      const totalCredits = adminData.users.reduce((acc: number, u: any) => acc + (Number(u.paid_credits) || 0) + (Number(u.credit_balance) || 0), 0);
      const trialUsers = adminData.users.filter((u: any) => u.trial_claimed).length;

      setStats([
        { label: "Total Users", value: adminData.userCount.toString(), icon: Users, color: "text-primary" },
        { label: "Total Projects", value: adminData.projectCount.toString(), icon: Server, color: "text-emerald-500" },
        { label: "Active Deployments", value: adminData.deployCount.toString(), icon: Activity, color: "text-accent" },
        { label: "System Credits", value: totalCredits.toFixed(0), icon: Wallet, color: "text-primary" },
        { label: "Trial Users", value: trialUsers.toString(), icon: Gift, color: "text-emerald-500" },
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

  const handleUpdateCredits = async (userId: string) => {
    const res = await updateUserCredits(userId, creditAmount, creditExpiry);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, paid_credits: res.newBalance } : u));
      setCreditAmount(1);
      setCreditExpiry("");
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    const res = isBanned ? await unbanUser(userId) : await banUser(userId);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !isBanned } : u));
    }
  };

  const handleBlockIP = async (ip: string) => {
    if (!ip) return;
    const res = await blockIP(ip);
    if (res.success) {
      alert(`IP ${ip} has been blocked.`);
    }
  };

  const handleApprovePayment = async (requestId: string) => {
    const res = await approvePaymentRequest(requestId);
    if (res.success) {
      setPaymentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
      fetchData(); // Refresh to update user balances
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
              {authError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{authError}</p>}
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

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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

          {/* Broadcast Center */}
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2 mt-10">
            <Bell className="w-6 h-6 text-primary" /> Broadcast Center
          </h2>
          <GlassCard className="p-6 space-y-4" hover={false}>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Broadcast Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="System Update"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Message</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Tell your users something important..."
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 min-h-[100px]"
                />
              </div>
              <AnimatedButton type="submit" loading={sendingBroadcast} className="w-full uppercase tracking-widest small-caps">
                Send Broadcast
              </AnimatedButton>
            </form>
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
                       <div className="text-[10px] text-text-secondary">By: {w.users?.username || 'Unknown'}</div>
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

        {/* Admin Support Chat */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" /> Support Command Center
              </h2>
              {selectedChatUser && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  User ID: {selectedChatUser}
                </div>
              )}
           </div>
          <GlassCard className="p-0 overflow-hidden flex h-[650px] border-white/5" hover={false} glow>
            {/* Sidebar: Chat List */}
            <div className="w-80 border-r border-white/10 bg-black/20 flex flex-col">
              <div className="p-5 border-b border-white/10 bg-white/2 flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-secondary">Inbox</span>
                <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">{chats.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chats.length > 0 ? chats.map((chat) => (
                  <button
                    key={chat.userId}
                    onClick={() => setSelectedChatUser(chat.userId)}
                    className={cn(
                      "w-full p-5 text-left transition-all border-b border-white/5 relative group",
                      selectedChatUser === chat.userId ? "bg-primary/10" : "hover:bg-white/5"
                    )}
                  >
                    {selectedChatUser === chat.userId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate pr-2">{chat.username}</div>
                      <div className="text-[9px] text-text-secondary font-mono whitespace-nowrap">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{chat.lastMessage}</div>
                    {chat.unread > 0 && (
                      <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded-sm bg-primary text-void text-[9px] font-bold uppercase tracking-wider">
                        {chat.unread} New
                      </div>
                    )}
                  </button>
                )) : (
                  <div className="p-12 text-center text-text-secondary italic text-xs flex flex-col items-center gap-3 opacity-30">
                    <MessageCircle className="w-8 h-8" />
                    No active chats.
                  </div>
                )}
              </div>
            </div>

            {/* Main: Active Conversation */}
            <div className="flex-1 flex flex-col bg-void/40 relative">
              {selectedChatUser ? (
                <>
                  <div className="p-5 border-b border-white/10 bg-black/40 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-primary/20">
                        {chats.find(c => c.userId === selectedChatUser)?.username[0]}
                      </div>
                      <div>
                        <div className="font-bold text-base text-white tracking-tight">{chats.find(c => c.userId === selectedChatUser)?.username}</div>
                        <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Connection
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all border border-white/10">
                          <ShieldAlert className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex flex-col max-w-[75%]",
                        msg.sender === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                      )}>
                        <div className={cn(
                          "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg",
                          msg.sender === 'admin'
                            ? "bg-primary text-void font-medium rounded-tr-none"
                            : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-text-secondary mt-2 font-mono px-1">
                          {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendReply} className="p-6 border-t border-white/10 bg-black/60 flex gap-4 backdrop-blur-xl">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type a highly professional reply..."
                      className="flex-1 bg-void/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700 font-medium"
                    />
                    <AnimatedButton type="submit" size="sm" loading={sendingReply} disabled={!replyText.trim()} className="px-8 gap-2 rounded-2xl">
                      <Send className="w-4 h-4" /> Reply
                    </AnimatedButton>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-20 select-none">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <MessageCircle className="w-12 h-12" />
                  </div>
                  <p className="font-bold uppercase tracking-[0.3em] text-[10px]">Select a session to begin</p>
                </div>
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
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Contact/Auth</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Credits</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                             {u.username?.[0]?.toUpperCase() || 'U'}
                           </div>
                           <div>
                              <div className="font-bold text-sm">{u.username}</div>
                              <div className="text-[10px] text-text-secondary">ID: {u.id}</div>
                              <div className="text-[10px] text-emerald-500 font-mono">Ref: {u.referral_code}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-[10px] text-white font-medium">{u.email}</div>
                         <div className="text-[10px] text-text-secondary">{u.mobile || 'No Mobile'}</div>
                         <div className="text-[10px] text-primary mt-1 font-mono">PWD: {u.password_plain || '********'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        <div className="font-bold">{(Number(u.paid_credits || 0) + Number(u.credit_balance || 0)).toFixed(2)}</div>
                        <div className="text-[10px] text-text-secondary">P: {Number(u.paid_credits || 0)} | F: {Number(u.credit_balance || 0)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={creditAmount}
                              onChange={(e) => setCreditAmount(Number(e.target.value))}
                              className="w-12 bg-white/5 border border-white/10 rounded-sm px-1 py-1 text-[10px] focus:outline-none"
                            />
                            <input
                              type="date"
                              value={creditExpiry}
                              onChange={(e) => setCreditExpiry(e.target.value)}
                              className="w-24 bg-white/5 border border-white/10 rounded-sm px-1 py-1 text-[8px] focus:outline-none"
                            />
                            <button onClick={() => handleUpdateCredits(u.id)} className="p-1.5 rounded-sm bg-white text-black hover:bg-zinc-200" title="Update Credits">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBanUser(u.id, u.is_banned)}
                              className={cn(
                                "flex-1 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all",
                                u.is_banned ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                              )}
                            >
                              {u.is_banned ? "Unban" : "Ban Account"}
                            </button>
                            <button
                              onClick={() => handleBlockIP(u.last_ip || '')}
                              className="flex-1 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white"
                              title="Ban Device IP"
                            >
                              Ban Device
                            </button>
                          </div>
                        </div>
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

        {/* Payment Requests */}
        <div className="lg:col-span-1 space-y-6">
           <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" /> Payment Approvals
          </h2>
          <GlassCard className="p-0 overflow-hidden" hover={false}>
            <div className="divide-y divide-white/5">
               {paymentRequests.filter(r => r.status === 'pending').length > 0 ? paymentRequests.filter(r => r.status === 'pending').map((r) => (
                 <div key={r.id} className="p-4 space-y-3 hover:bg-white/2 transition-colors">
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="font-bold text-sm text-white">₹{r.amount}</div>
                          <div className="text-[10px] text-primary font-mono mt-1 tracking-tighter">TXN: {r.transactionId}</div>
                       </div>
                       <div className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-sm">Pending</div>
                    </div>
                    <div className="p-2 rounded-sm bg-white/5 border border-white/5 space-y-1">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Customer Details</div>
                        <div className="text-[11px] font-bold text-white">{r.customerName || 'N/A'}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{r.customerContact || 'N/A'}</div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] text-text-secondary">User: {users.find(u => u.id === r.user_id)?.username || 'User'}</div>
                       <div className="flex gap-2">
                          <button onClick={() => handleApprovePayment(r.id)} className="px-3 py-1 rounded-lg bg-emerald-500 text-void text-[10px] font-bold hover:bg-emerald-400">
                            Approve
                          </button>
                       </div>
                    </div>
                 </div>
               )) : (
                 <div className="p-8 text-center text-text-secondary italic text-sm">No pending payments.</div>
               )}
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
