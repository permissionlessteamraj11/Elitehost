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
  ExternalLink
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "account", label: "Account", icon: User },
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
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
                  <h2 className="text-2xl font-bold font-heading">Account Settings</h2>
                  <p className="text-text-secondary text-sm">Update your public profile and account details.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Username</label>
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

          {activeTab === "security" && (
             <div className="space-y-6">
                <GlassCard className="p-8 space-y-6" hover={false}>
                   <h3 className="text-xl font-bold font-heading">Password</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Current Password</label>
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
              <GlassCard className="p-8 space-y-8" hover={false}>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold font-heading">Help & Support</h2>
                  <p className="text-text-secondary text-sm">Get assistance with your deployments or account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                    <MessageCircle className="w-8 h-8 text-primary" />
                    <h3 className="font-bold">Live Chat</h3>
                    <p className="text-xs text-text-secondary">Typical response time: &lt; 2 hours</p>
                    <AnimatedButton size="sm" className="w-full mt-2">Start Chat</AnimatedButton>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <Mail className="w-8 h-8 text-text-secondary" />
                    <h3 className="font-bold">Email Support</h3>
                    <p className="text-xs text-text-secondary">zynochat.in@zynochat.in</p>
                      <p className="text-[10px] text-primary">Call: 9931989952</p>
                    <AnimatedButton variant="outline" size="sm" className="w-full mt-2" onClick={() => window.location.href='mailto:zynochat.in@zynochat.in'}>Send Email</AnimatedButton>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-text-secondary">Quick Links</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Documentation", icon: FileText, href: "/docs" },
                      { label: "System Status", icon: ExternalLink, href: "https://status.elitehosting.in" },
                      { label: "Community Discord", icon: MessageCircle, href: "https://discord.gg/elitehosting" }
                    ].map((item, i) => (
                      <a key={i} href={item.href} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-primary" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-text-secondary" />
                      </a>
                    ))}
                  </div>
                </div>
              </GlassCard>

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
