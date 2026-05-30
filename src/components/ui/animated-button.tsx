"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  glow?: boolean;
}

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  glow = true,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const variants = {
    primary: "bg-electric text-void font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)]",
    secondary: "bg-surface-3 text-white font-semibold",
    outline: "border border-electric/30 text-electric hover:bg-electric/5",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs rounded-lg",
    md: "px-6 py-2.5 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl",
    icon: "p-3 rounded-xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden focus-ring",
        variants[variant],
        sizes[size],
        glow && variant === "primary" && "animate-glow-pulse",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}

      {/* Ripple Effect Container */}
      <span className="absolute inset-0 pointer-events-none bg-white/10 opacity-0 active:opacity-100 transition-opacity" />
    </motion.button>
  );
}
