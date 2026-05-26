"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DeploymentProgressProps {
  progress: number;
  status: string;
  className?: string;
}

export function DeploymentProgress({ progress, status, className }: DeploymentProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
        <span>{status}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-electric to-neon-purple shadow-[0_0_10px_rgba(0,229,255,0.5)]"
        />
      </div>
    </div>
  );
}
