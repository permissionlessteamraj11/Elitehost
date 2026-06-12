"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Key,
  HelpCircle,
  Save,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MessageCircle,
  Mail,
  FileText,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Maximize2,
  Minimize2
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { submitWithdrawalRequest } from "@/app/actions/credits";
import { getReferralStats } from "@/app/actions/referrals";
import { sendMessage, getMessages } from "@/app/actions/chat";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "wallet", label: "My Wallet", icon: Wallet },
  { id: "security", label: "Security", icon: Lock },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
];

import { useAuthStore } from "@/hooks/use-auth";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const { user } = useAuthStore();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Wallet State
  const [walletStats, setWalletStats] = useState({
    totalEarnings: 0,
    walletBalance: 0
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);

  useEffect(() => {
    if (activeTab === "wallet") {
      fetchWalletData();
    }
    if (activeTab === "help") {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    const res = await getMessages();
    if (res.success) {
      setChatMessages(res.messages || []);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatLoading(true);
    const res = await sendMessage(newMessage);
    if (res.success) {
      setNewMessage("");
      fetchMessages();
    }
    setChatLoading(false);
  };

  const fetchWalletData = async () => {
    const data = await getReferralStats();
    if (data) {
      setWalletStats({
        totalEarnings: data.stats.totalEarnings,
        walletBalance: data.stats.walletBalance
      });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawError(null);

    const res = await submitWithdrawalRequest(Number(withdrawAmount), upiId);

    if (res.success) {
      setWithdrawAmount("");
      setUpiId("");
      alert("Withdrawal request submitted successfully!");
      fetchWalletData();
    } else {
      setWithdrawError(res.error || "Failed to submit request");
    }
    setWithdrawLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest small-caps",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "account" && (
            <GlassCard className="p-8 space-y-8" hover={false}>
               <div className="space-y-1">
                  <h2 className="text-2xl font-bold font-heading small-caps">Account Settings</h2>
                  <p className="text-text-secondary text-sm">Update your public profile and account details.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Username</label>
                     <input
                        type="text"
                        defaultValue={user?.username}
                        disabled
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 opacity-50"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Email Address</label>
                     <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 opacity-50"
                        disabled
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Mobile Number</label>
                     <input
                        type="text"
                        defaultValue={(user as any)?.mobile}
                        disabled
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 opacity-50"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Referral Code</label>
                     <div className="relative">
                        <input
                           type="text"
                           readOnly
                           value={(user as any)?.referral_code || "GENERATE_CODE"}
                           className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none font-mono text-primary"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText((user as any)?.referral_code || "");
                            alert("Referral code copied!");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary leading-relaxed">
                  <strong>Referral System:</strong> Share your code with friends! When they sign up using your code, they get a <strong>10% discount</strong> on their first credit purchase.
               </div>
            </GlassCard>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Commission 30%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">₹{walletStats.totalEarnings.toFixed(2)}</div>
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1 small-caps">Total Earnings</div>
                </GlassCard>
                <GlassCard className="p-6" hover={false} glow>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ready to Withdraw</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">₹{walletStats.walletBalance.toFixed(2)}</div>
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1 small-caps">Wallet Balance</div>
                </GlassCard>
              </div>

              <GlassCard className="p-8 space-y-6" hover={false}>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-heading small-caps">Withdraw Funds</h3>
                  <p className="text-text-secondary text-sm">Transfer your earnings to your bank account or UPI.</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Withdraw Amount</label>
                     <input
                       type="number"
                       required
                       value={withdrawAmount}
                       onChange={(e) => setWithdrawAmount(e.target.value)}
                       placeholder="₹100 minimum"
                       className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">UPI ID / Payment Details</label>
                     <input
                       type="text"
                       required
                       value={upiId}
                       onChange={(e) => setUpiId(e.target.value)}
                       placeholder="user@upi"
                       className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                     />
                   </div>

                   {withdrawError && (
                     <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold uppercase flex items-center gap-2">
                       <AlertCircle className="w-3.5 h-3.5" />
                       {withdrawError}
                     </div>
                   )}

                   <AnimatedButton type="submit" loading={withdrawLoading} className="w-full sm:w-auto uppercase tracking-widest small-caps">
                     Request Withdrawal
                   </AnimatedButton>
                </form>

                <div className="flex items-center gap-2 text-[10px] text-text-secondary font-bold uppercase tracking-widest pt-4 border-t border-white/5">
                   <Clock className="w-3.5 h-3.5" />
                   Processed within 24-48 hours • Min ₹100
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "security" && (
             <div className="space-y-6">
                <GlassCard className="p-8 space-y-6" hover={false}>
                   <h3 className="text-xl font-bold font-heading small-caps">Password</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Current Password</label>
                        <input
                          type="password"
                          value={currentPwd}
                          onChange={(e) => setCurrentPwd(e.target.value)}
                          className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">New Password</label>
                        <input
                          type="password"
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                   </div>

                   {message && (
                     <div className={cn("p-3 rounded-lg text-xs", message.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                        {message.text}
                     </div>
                   )}

                   <AnimatedButton
                    variant="secondary"
                    size="sm"
                    loading={loading}
                    onClick={async () => {
                      setLoading(true);
                      setMessage(null);
                      try {
                        const res = await fetch("/api/auth/update-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ currentPwd, newPwd }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setMessage({ type: 'success', text: 'Password updated successfully!' });
                          setCurrentPwd("");
                          setNewPwd("");
                        } else {
                          setMessage({ type: 'error', text: data.error || 'Failed to update password' });
                        }
                      } catch (err) {
                        setMessage({ type: 'error', text: 'An unexpected error occurred' });
                      } finally {
                        setLoading(false);
                      }
                    }}
                   >
                     Update Password
                   </AnimatedButton>
                </GlassCard>

                <GlassCard className="p-8 border-red-500/20" hover={false}>
                   <h3 className="text-xl font-bold font-heading text-red-500">Danger Zone</h3>
                   <p className="text-text-secondary text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                   <AnimatedButton variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">Delete Account</AnimatedButton>
                </GlassCard>
             </div>
          )}

          {activeTab === "help" && (
            <div className="space-y-6">
              <GlassCard
                className={cn(
                  "p-0 overflow-hidden flex flex-col transition-all duration-500",
                  isChatMaximized ? "fixed inset-4 z-[100] h-[calc(100vh-32px)]" : "h-[600px]"
                )}
                hover={false}
              >
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold font-heading small-caps">Elite Support Chat</h2>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Online • Typical reply &lt; 2h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest hidden sm:block">ID: #{user?.id?.substring(0,8)}</div>
                     <button
                        onClick={() => setIsChatMaximized(!isChatMaximized)}
                        className="p-2 hover:bg-white/10 rounded-sm transition-colors text-white"
                     >
                        {isChatMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                     </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-void/30">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                      <div className="p-4 rounded-full bg-white/5">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">No messages yet</p>
                        <p className="text-xs">Send a message to start a conversation with our support team.</p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm",
                          msg.sender === 'user'
                            ? "bg-primary text-void font-medium rounded-tr-none"
                            : "bg-white/10 text-white rounded-tl-none border border-white/5"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-text-secondary mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-white/2 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                  <AnimatedButton type="submit" size="sm" loading={chatLoading} disabled={!newMessage.trim()}>
                    Send
                  </AnimatedButton>
                </form>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-6 space-y-4" hover={false}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-text-secondary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest small-caps">Email Support</h3>
                  </div>
                  <p className="text-xs text-text-secondary">Direct email for formal inquiries and business matters.</p>
                  <div className="text-xs font-bold text-primary">zynochat.in@zynochat.in</div>
                  <AnimatedButton variant="outline" size="sm" className="w-full" onClick={() => window.location.href='mailto:zynochat.in@zynochat.in'}>Compose Email</AnimatedButton>
                </GlassCard>

                <GlassCard className="p-6 space-y-4" hover={false}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-text-secondary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest small-caps">Documentation</h3>
                  </div>
                  <p className="text-xs text-text-secondary">Browse our extensive guides and API references.</p>
                  <AnimatedButton variant="outline" size="sm" className="w-full" onClick={() => window.open('/docs')}>Read Docs</AnimatedButton>
                </GlassCard>
              </div>

              <GlassCard className="p-8" hover={false}>
                 <h3 className="font-bold mb-4">Frequently Asked Questions</h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <div className="text-sm font-bold">How do I use my free credits?</div>
                       <p className="text-xs text-text-secondary">Free credits are automatically applied to your deployments. You can see your balance in the dashboard.</p>
                    </div>
                    <div className="space-y-1 border-t border-white/5 pt-4">
                       <div className="text-sm font-bold">Can I deploy from a private GitHub repo?</div>
                       <p className="text-xs text-text-secondary">Yes, simply authorize EliteHosting on your GitHub account during the project creation flow.</p>
                    </div>
                 </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "notifications" && (
            <GlassCard className="p-8 space-y-8" hover={false}>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-heading">Notifications</h2>
                <p className="text-text-secondary text-sm">Control how you receive updates and alerts.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Deployment Success", desc: "Notify when a build is successful." },
                  { label: "Deployment Failure", desc: "Urgent alerts for failed builds." },
                  { label: "Usage Alerts", desc: "Notify when approaching plan limits." },
                  { label: "Security Alerts", desc: "Notifications about account security." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-xs text-text-secondary">{item.desc}</div>
                    </div>
                    <div className="w-10 h-5 bg-primary/20 rounded-full relative cursor-pointer border border-primary/30">
                       <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
