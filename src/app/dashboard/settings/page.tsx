"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Lock,
  Bell,
  Key,
  CreditCard,
  Github,
  Globe,
  Save,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { StatusChip } from "@/components/ui/status-chip";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [showKey, setShowKey] = useState(false);

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
                  ? "bg-electric/10 text-electric border border-electric/20"
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
                  <h2 className="text-2xl font-bold font-space-grotesk">Account Settings</h2>
                  <p className="text-text-secondary text-sm">Update your public profile and account details.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Username</label>
                     <input
                        type="text"
                        defaultValue="alex_elite"
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Email Address</label>
                     <input
                        type="email"
                        defaultValue="alex@elitehosting.io"
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 opacity-50"
                        disabled
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Bio</label>
                     <textarea
                        className="w-full h-24 bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50"
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
                     <h2 className="text-2xl font-bold font-space-grotesk">API Keys</h2>
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

               <div className="p-4 rounded-xl bg-electric/5 border border-electric/20 text-xs text-electric leading-relaxed">
                  <strong>Security Tip:</strong> Never share your API keys or commit them to source control. Use environment variables instead.
               </div>
            </GlassCard>
          )}

          {activeTab === "security" && (
             <div className="space-y-6">
                <GlassCard className="p-8 space-y-6" hover={false}>
                   <h3 className="text-xl font-bold font-space-grotesk">Password</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Current Password</label><input type="password" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50" /></div>
                      <div className="space-y-2"><label className="text-xs font-bold text-text-secondary uppercase tracking-widest">New Password</label><input type="password" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50" /></div>
                   </div>
                   <AnimatedButton variant="secondary" size="sm">Update Password</AnimatedButton>
                </GlassCard>

                <GlassCard className="p-8 border-red-500/20" hover={false}>
                   <h3 className="text-xl font-bold font-space-grotesk text-error">Danger Zone</h3>
                   <p className="text-text-secondary text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                   <AnimatedButton variant="outline" className="border-error/50 text-error hover:bg-error/10">Delete Account</AnimatedButton>
                </GlassCard>
             </div>
          )}

          {activeTab === "billing" && (
            <GlassCard className="p-8 space-y-8" hover={false}>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-space-grotesk">Billing & Subscription</h2>
                <p className="text-text-secondary text-sm">Manage your plan and payment methods.</p>
              </div>
              <div className="p-6 rounded-2xl bg-electric/5 border border-electric/20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="text-xs font-bold text-electric uppercase tracking-widest mb-1">Current Plan</div>
                  <div className="text-2xl font-bold">Pro Elite (Monthly)</div>
                  <div className="text-sm text-text-secondary">$29.00 / month</div>
                </div>
                <AnimatedButton>Manage Subscription</AnimatedButton>
              </div>
              <div className="space-y-4">
                 <h3 className="font-bold text-sm">Payment Methods</h3>
                 <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <CreditCard className="w-5 h-5 text-text-secondary" />
                       <span className="text-sm">Visa ending in 4242</span>
                    </div>
                    <StatusChip status="success" label="Primary" />
                 </div>
              </div>
            </GlassCard>
          )}

          {activeTab === "notifications" && (
            <GlassCard className="p-8 space-y-8" hover={false}>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-space-grotesk">Notifications</h2>
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
                    <div className="w-10 h-5 bg-electric/20 rounded-full relative cursor-pointer border border-electric/30">
                       <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-electric rounded-full" />
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
