"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface DeployOptionCardProps {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

export function DeployOptionCard({
  id,
  icon: Icon,
  label,
  description,
  isActive,
  onClick,
}: DeployOptionCardProps) {
  return (
    <GlassCard
      className={cn(
        "p-6 cursor-pointer transition-all duration-300",
        isActive
          ? "neon-border bg-white/5 ring-1 ring-electric/30"
          : "hover:bg-white/5 border-white/5"
      )}
      onClick={onClick}
      glow={isActive}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-sm transition-all duration-300",
          isActive
            ? "bg-white text-void shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            : "bg-white/5 text-white/40 group-hover:text-white"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={cn(
            "text-lg font-bold font-poppins transition-colors",
            isActive ? "text-white" : "text-white"
          )}>
            {label}
          </h3>
          <p className="text-sm text-white/40 mt-1 leading-snug">
            {description}
          </p>
        </div>
      </div>

      {/* Active Indicator Dot */}
      {isActive && (
        <motion.div
          layoutId="activeDot"
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#00E5FF]"
        />
      )}
    </GlassCard>
  );
}
