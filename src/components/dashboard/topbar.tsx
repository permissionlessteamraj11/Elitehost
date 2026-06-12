"use client";

import { Bell, Search, User, Globe } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";

export function Topbar() {
  const { profile } = useAuthStore();

  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full bg-white/5 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
          <Globe className="w-3 h-3" /> Mumbai Node
        </div>

        <button className="text-gray-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#00E5FF] rounded-full border-2 border-[#020108]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-white">{profile?.username || "Developer"}</div>
            <div className="text-xs text-[#00E5FF] font-mono">₹{profile?.credit_balance || "0.00"} Credits</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] flex items-center justify-center border border-white/20">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
