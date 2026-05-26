"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface MobileDashboardWidgetProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: string;
  className?: string;
}

export function MobileDashboardWidget({
  label,
  value,
  icon: Icon,
  trend,
  color = "text-electric",
  className,
}: MobileDashboardWidgetProps) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">{label}</div>
        <div className={cn("text-2xl font-bold tracking-tight", color)}>{value}</div>
      </div>

      {/* Decorative background element */}
      <div className={cn(
        "absolute -bottom-2 -right-2 w-16 h-16 blur-2xl opacity-10 rounded-full",
        color.includes("electric") ? "bg-electric" : "bg-white"
      )} />
    </GlassCard>
  );
}
