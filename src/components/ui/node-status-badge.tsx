import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeStatusBadgeProps {
  nodeName: string;
  className?: string;
}

export function NodeStatusBadge({ nodeName, className }: NodeStatusBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/5 border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest",
      className
    )}>
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_#FFFFFF]" />
      <Globe className="w-3 h-3" />
      {nodeName}
    </div>
  );
}
