"use client";

import { Bell, Search, User } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { NodeStatusBadge } from "@/components/ui/node-status-badge";
import { motion } from "framer-motion";
import Link from "next/link";

export function AppHeader() {
  const { profile } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4 pb-2 lg:px-8 lg:pt-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism rounded-[24px] p-2 pr-3 pl-4 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-electric rounded-xl flex items-center justify-center text-void font-bold text-lg shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              E
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">EliteHost</span>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          <NodeStatusBadge nodeName="Mumbai Node" className="hidden xs:flex" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 text-white/50 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-electric rounded-full border-2 border-void shadow-[0_0_8px_#00E5FF]" />
          </motion.button>

          <Link href="/dashboard/settings" className="flex items-center gap-3 ml-2 group">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-white uppercase tracking-wider">{profile?.username || "Developer"}</div>
              <div className="text-[10px] text-electric font-mono font-bold tracking-tight">₹{profile?.credit_balance || "0.00"}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-neon-purple p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-void flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-white/80" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
