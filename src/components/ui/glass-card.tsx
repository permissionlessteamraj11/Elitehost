"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  "aria-checked"?: boolean;
  "aria-label"?: string;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  onClick,
  onKeyDown,
  tabIndex,
  role,
  "aria-checked": ariaChecked,
  "aria-label": ariaLabel,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-checked={ariaChecked}
      aria-label={ariaLabel}
      className={cn(
        "glass-morphism rounded-2xl overflow-hidden relative group outline-none focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void transition-all",
        glow && "neon-border",
        className
      )}
    >
      {glow && (
        <div className="absolute -inset-px bg-gradient-to-r from-electric/20 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
