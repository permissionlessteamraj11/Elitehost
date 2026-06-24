"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 border border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]",
    secondary: "bg-zinc-950 text-white hover:bg-zinc-900 border border-white/10",
    outline: "bg-transparent text-white border border-white/20 hover:bg-white/5 hover:border-white/40",
    ghost: "bg-transparent text-white hover:bg-white/5 border border-transparent",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]",
    md: "px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em]",
    lg: "px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em]",
  };

  const { onAnimationStart: _, ...restProps } = props as any;

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-live="polite"
      className={cn(
        "relative inline-flex items-center justify-center rounded-sm transition-all duration-200 focus-ring",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
      {...restProps}
    >
      {loading && (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span className="sr-only">Loading...</span>
        </>
      )}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>{children}</span>
      {loading && <span className="absolute inset-0 flex items-center justify-center">Processing</span>}
    </motion.button>
  );
}
