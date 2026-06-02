"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Sparkles,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: Layers, label: "Deployments", href: "/dashboard/deployments" },
  { icon: PlusCircle, label: "New", href: "/dashboard/new", center: true },
  { icon: Sparkles, label: "AI", href: "/dashboard/ai-studio" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none lg:hidden">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-morphism rounded-[32px] px-2 py-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.center) {
              return (
                <Link key={item.href} href={item.href} className="relative group" aria-label="Create new project">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-background flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-transform active:scale-90">
                    <item.icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                </Link>
              );
            }

            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center px-4 py-1.5 transition-all active:scale-95">
                <div className={cn(
                  "p-2 rounded-xl transition-colors relative z-10",
                  isActive ? "text-primary" : "text-white/40 group-hover:text-white"
                )}>
                  <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold mt-0.5 tracking-tighter uppercase transition-colors relative z-10",
                  isActive ? "text-primary" : "text-white/40"
                )}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/5 rounded-2xl -z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
