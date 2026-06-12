import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: 'ready' | 'loading' | 'error' | 'offline' | 'pending' | 'success';
  className?: string;
  label?: string;
}

export function StatusChip({ status, className, label }: StatusChipProps) {
  const configs = {
    ready: { color: "bg-white/10 text-white border-white/20", dot: "bg-white" },
    success: { color: "bg-white/10 text-white border-white/20", dot: "bg-white" },
    loading: { color: "bg-zinc-800 text-zinc-400 border-zinc-700", dot: "bg-zinc-500 animate-pulse" },
    error: { color: "bg-zinc-900 text-zinc-500 border-zinc-800", dot: "bg-zinc-700" },
    offline: { color: "bg-zinc-900 text-zinc-500 border-zinc-800", dot: "bg-zinc-700" },
    pending: { color: "bg-zinc-800 text-zinc-400 border-zinc-700", dot: "bg-zinc-500" },
  };

  const config = configs[status] || configs.pending;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-widest",
      config.color,
      className
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {label || status}
    </div>
  );
}
