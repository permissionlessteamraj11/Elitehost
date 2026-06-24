"use client";

import { Bell, Search, User, Globe } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";

export function Topbar() {
  const { profile } = useAuthStore();

  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full bg-white/5 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
          <Globe className="w-3 h-3" /> Mumbai Node
        </div>

        <button className="text-zinc-500 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border-2 border-black shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white tracking-tight">{profile?.username || "Developer"}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">₹{profile?.credit_balance || "0.00"} Credits</div>
          </div>
          <div className="w-9 h-9 rounded-sm bg-white text-black flex items-center justify-center border border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
