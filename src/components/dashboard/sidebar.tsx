"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Sparkles,
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
  { icon: Sparkles, label: "AI Studio", href: "/dashboard/ai-studio" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthStore();

  return (
    <aside className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="EliteHosting Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight font-heading">EliteHosting</span>
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
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-white")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <Link
          href="/dashboard/settings?tab=help"
          className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Help & Support</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-text-secondary hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
