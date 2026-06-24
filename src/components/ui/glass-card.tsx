"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  onClick,
  tabIndex,
  onKeyDown
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
      onClick={onClick}
      tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
      onKeyDown={onKeyDown}
      role={onClick ? "button" : undefined}
      className={cn(
        "glass-morphism rounded-sm overflow-hidden relative group transition-all duration-300",
        glow && "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]",
        onClick && "cursor-pointer focus-ring",
        className
      )}
    >
      {glow && (
        <div className="absolute -inset-px bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
