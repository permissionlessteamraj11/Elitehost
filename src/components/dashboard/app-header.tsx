"use client";

import { Bell, Search, User, Zap, Wallet, X } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { NodeStatusBadge } from "@/components/ui/node-status-badge";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getBroadcasts } from "@/app/actions/broadcast";

export function AppHeader() {
  const { profile } = useAuthStore();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    const res = await getBroadcasts();
    if (res.success) {
      setBroadcasts(res.broadcasts || []);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4 pb-2 lg:px-8 lg:pt-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism rounded-sm p-2 pr-3 pl-4 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-6 h-6 sm:w-8 sm:h-8">
              <Image src="/logo.png" alt="EliteHosting Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight hidden xs:block font-heading small-caps">EliteHosting</span>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          <NodeStatusBadge nodeName="Mumbai Node" className="hidden xs:flex" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Credit Display */}
          <Link href="/dashboard/credits">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm bg-white/10 border border-white/20 text-white cursor-pointer"
            >
              <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[10px] sm:text-xs font-bold font-mono">{profile?.credit_balance?.toFixed(2) || "0.00"} CR</span>
            </motion.div>
          </Link>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-white/50 hover:text-white transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {broadcasts.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-void shadow-[0_0_8px_#6366F1]" />
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X className="w-3 h-3 text-text-secondary" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                    {broadcasts.length > 0 ? broadcasts.map((b) => (
                      <div key={b.id} className="p-4 hover:bg-white/5 transition-colors space-y-1">
                        <div className="text-[11px] font-bold text-primary uppercase tracking-wider">{b.title}</div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{b.message}</p>
                        <div className="text-[9px] text-zinc-600 font-mono mt-2">{new Date(b.timestamp).toLocaleString()}</div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-xs text-zinc-500 italic">No notifications yet.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/dashboard/settings" className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 group">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-white uppercase tracking-wider small-caps">{profile?.username || "Developer"}</div>
              <div className="text-[10px] text-white font-mono font-bold tracking-tight small-caps">VIP STATUS</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-white p-[1px]">
              <div className="w-full h-full rounded-sm bg-void flex items-center justify-center overflow-hidden">
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
