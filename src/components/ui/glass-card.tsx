"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  onClick,
  "aria-label": ariaLabel
}: GlassCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      className={cn(
        "glass-morphism rounded-2xl overflow-hidden relative group",
        onClick && "cursor-pointer focus-ring outline-none",
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
