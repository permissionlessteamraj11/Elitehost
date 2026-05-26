import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: "success" | "error" | "pending" | "info";
  label: string;
  className?: string;
}

export function StatusChip({ status, label, className }: StatusChipProps) {
  const styles = {
    success: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    error: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    pending: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    info: "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20",
  };

  return (
    <div className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[status],
      className
    )}>
      {label}
    </div>
  );
}
