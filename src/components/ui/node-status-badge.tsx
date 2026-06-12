import { Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeStatusBadgeProps {
  nodeName: string;
  className?: string;
}

export function NodeStatusBadge({ nodeName, className }: NodeStatusBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm",
      className
    )}>
      <Server className="w-3 h-3 text-white" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        {nodeName}: <span className="text-white">Active</span>
      </span>
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    </div>
  );
}
