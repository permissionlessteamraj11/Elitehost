"use client";

import { motion } from "framer-motion";
import { MobileDashboardWidget } from "@/components/dashboard/mobile-dashboard-widget";
import { ResourceCharts } from "@/components/dashboard/stats/resource-charts";
import { Rocket, Box, Activity, Zap, ArrowRight, History } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";

const stats = [
  { label: "Active Engines", value: "Active", icon: Zap, color: "text-primary", trend: "Stable" },
  { label: "Projects", value: "Ready", icon: Box, color: "text-white" },
  { label: "Node Latency", value: "24ms", icon: Activity, color: "text-accent", trend: "Low" },
  { label: "Mumbai Datacenter", value: "Connected", icon: Rocket, color: "text-emerald-500" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins">Overview</h1>
          <p className="text-white/40 text-sm mt-1">Command center for your cloud infrastructure.</p>
        </div>
        <div className="hidden sm:block">
           <AnimatedButton variant="outline" size="sm" className="gap-2">
             <History className="w-4 h-4" /> View Activity
           </AnimatedButton>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <MobileDashboardWidget
            key={idx}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <ResourceCharts />
      </motion.div>

      <motion.div variants={item}>
        <GlassCard className="p-8 text-center relative overflow-hidden group" glow>
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-electric opacity-5 blur-[100px] rounded-full group-hover:opacity-10 transition-opacity" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-neon-purple opacity-5 blur-[100px] rounded-full group-hover:opacity-10 transition-opacity" />

          <div className="relative z-10 max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Rocket className="w-8 h-8 text-electric" />
            </div>
            <h2 className="text-2xl font-bold mb-3 font-poppins">Ready to scale?</h2>
            <p className="text-white/50 mb-8 leading-relaxed">
              Launch your next big idea in seconds. Import from GitHub, upload a ZIP, or deploy raw code with enterprise-grade performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/new">
                <AnimatedButton className="w-full sm:w-auto gap-2 group/btn">
                  Create New Project <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>
              <AnimatedButton variant="secondary" className="w-full sm:w-auto">
                Read Documentation
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Spacing for mobile nav */}
      <div className="h-4 lg:hidden" />
    </motion.div>
  );
}
