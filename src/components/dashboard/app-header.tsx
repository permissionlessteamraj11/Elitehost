"use client";

import { Bell, Search, User, Zap, Wallet } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { NodeStatusBadge } from "@/components/ui/node-status-badge";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function AppHeader() {
  const { profile } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4 pb-2 lg:px-8 lg:pt-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism rounded-[24px] p-2 pr-3 pl-4 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="EliteHosting Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block font-heading">EliteHosting</span>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          <NodeStatusBadge nodeName="Mumbai Node" className="hidden xs:flex" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Credit Display */}
          <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-xs font-bold font-mono">{profile?.credit_balance?.toFixed(2) || "2.00"} CR</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Search"
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Notifications"
            className="p-2 text-white/50 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-void shadow-[0_0_8px_#6366F1]" />
          </motion.button>

          <Link href="/dashboard/settings" className="flex items-center gap-3 ml-2 group">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-white uppercase tracking-wider">{profile?.username || "Developer"}</div>
              <div className="text-[10px] text-primary font-mono font-bold tracking-tight">VIP STATUS</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-void flex items-center justify-center overflow-hidden">
                 {profile?.avatar_url ? (
                   <Image src={profile.avatar_url} alt="Profile" width={40} height={40} className="object-cover" />
                 ) : (
                   <User className="w-6 h-6 text-white/80" />
                 )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
