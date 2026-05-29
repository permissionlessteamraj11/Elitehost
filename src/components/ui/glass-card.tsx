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
  role?: string;
  "aria-checked"?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  onClick,
  tabIndex,
  onKeyDown,
  role,
  "aria-checked": ariaChecked,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      role={role}
      aria-checked={ariaChecked}
      className={cn(
        "glass-morphism rounded-2xl overflow-hidden relative group",
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
