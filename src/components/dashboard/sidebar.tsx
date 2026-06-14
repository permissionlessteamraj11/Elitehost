"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Bot,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: PlusCircle, label: "New Project", href: "/dashboard/new" },
  { icon: Layers, label: "Deployments", href: "/dashboard/deployments" },
  { icon: Bot, label: "AI Studio", href: "/dashboard/ai-studio" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthStore();

  return (
    <aside className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="EliteHosting Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tighter font-heading uppercase">EliteHosting</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-sm transition-all group font-bold text-[10px] uppercase tracking-widest",
                isActive
                  ? "bg-white text-black border border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-black" : "group-hover:text-white")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-sm transition-all font-bold text-[10px] uppercase tracking-widest"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-zinc-500 hover:text-white hover:bg-white/5 rounded-sm transition-all font-bold text-[10px] uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
