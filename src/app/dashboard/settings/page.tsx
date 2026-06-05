"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [showKey, setShowKey] = useState(false);
  const [notifications, setNotifications] = useState({
    deploymentSuccess: true,
    deploymentFailure: true,
    usageAlerts: false,
    securityAlerts: true
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
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
                     <label htmlFor="username" className="text-xs font-bold text-text-secondary uppercase tracking-widest cursor-pointer">Username</label>
                     <input
                        id="username"
                        type="text"
                        defaultValue="elite_user"
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                     />
                  </div>
                  <div className="space-y-2">
                     <label htmlFor="email" className="text-xs font-bold text-text-secondary uppercase tracking-widest cursor-pointer">Email Address</label>
                     <input
                        id="email"
                        type="email"
                        defaultValue="user@elitehosting.in"
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 opacity-50"
                        disabled
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label htmlFor="bio" className="text-xs font-bold text-text-secondary uppercase tracking-widest cursor-pointer">Bio</label>
                     <textarea
                        id="bio"
                        className="w-full h-24 bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                        placeholder="Tell us about yourself..."
                     />
                  </div>
               </div>

               <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                  <AnimatedButton variant="outline">Cancel</AnimatedButton>
                  <AnimatedButton className="gap-2"><Save className="w-4 h-4" /> Save Changes</AnimatedButton>
               </div>
            </GlassCard>
          )}

          {activeTab === "api-keys" && (
            <GlassCard className="p-8 space-y-8" hover={false}>
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-bold font-heading">API Keys</h2>
                     <p className="text-text-secondary text-sm">Manage your personal access tokens.</p>
                  </div>
                  <AnimatedButton size="sm">Create New Key</AnimatedButton>
               </div>

               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                     <div className="space-y-1">
                        <div className="text-sm font-bold">Production CLI</div>
                        <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
                           <span>{showKey ? "eh_live_9k2m1n8v7b6c5x4z3a2s1" : "eh_live_••••••••••••••••••••••"}</span>
                           <button onClick={() => setShowKey(!showKey)} className="hover:text-white transition-colors">
                              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                           </button>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-red-400/10 text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary leading-relaxed">
                  <strong>Security Tip:</strong> Never share your API keys or commit them to source control. Use environment variables instead.
               </div>
            </GlassCard>
          )}

          {activeTab === "security" && (
             <div className="space-y-6">
                <GlassCard className="p-8 space-y-6" hover={false}>
                   <h3 className="text-xl font-bold font-heading">Password</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="current_password" className="text-xs font-bold text-text-secondary uppercase tracking-widest cursor-pointer">Current Password</label>
                        <input id="current_password" type="password" name="current_password"  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="new_password" className="text-xs font-bold text-text-secondary uppercase tracking-widest cursor-pointer">New Password</label>
                        <input id="new_password" type="password" name="new_password" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
                      </div>
                   </div>
                   <AnimatedButton variant="secondary" size="sm">Update Password</AnimatedButton>
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
                    <p className="text-xs text-text-secondary">support@elitehosting.in</p>
                    <AnimatedButton variant="outline" size="sm" className="w-full mt-2">Send Email</AnimatedButton>
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
                  { id: "deploymentSuccess" as const, label: "Deployment Success", desc: "Notify when a build is successful." },
                  { id: "deploymentFailure" as const, label: "Deployment Failure", desc: "Urgent alerts for failed builds." },
                  { id: "usageAlerts" as const, label: "Usage Alerts", desc: "Notify when approaching plan limits." },
                  { id: "securityAlerts" as const, label: "Security Alerts", desc: "Notifications about account security." }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-xs text-text-secondary">{item.desc}</div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifications[item.id]}
                      aria-label={`Toggle ${item.label}`}
                      onClick={() => toggleNotification(item.id)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors duration-200 border",
                        notifications[item.id] ? "bg-primary/20 border-primary/30" : "bg-white/5 border-white/10"
                      )}
                    >
                       <motion.div
                        animate={{ x: notifications[item.id] ? 20 : 2 }}
                        className={cn(
                          "absolute top-0.5 left-0 w-4 h-4 rounded-full transition-colors",
                          notifications[item.id] ? "bg-primary" : "bg-white/20"
                        )}
                       />
                    </button>
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
