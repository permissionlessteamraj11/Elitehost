"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FloatingActionButtonProps {
  href: string;
  icon?: React.ElementType;
  className?: string;
}

export function FloatingActionButton({ href, icon: Icon = Plus, className }: FloatingActionButtonProps) {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Create new project"
        className={cn(
          "fixed bottom-24 right-6 w-14 h-14 bg-electric text-void rounded-2xl shadow-[0_8px_32px_rgba(0,229,255,0.4)] flex items-center justify-center z-40 lg:hidden",
          className
        )}
      >
        <Icon className="w-7 h-7" />
      </motion.button>
    </Link>
  );
}
