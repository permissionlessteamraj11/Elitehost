"use client";

import { motion } from "framer-motion";
import { GitBranch, Upload, Code, FileJson, AlertCircle, Zap } from "lucide-react";
import { DeployOptionCard } from "./deploy-option-card";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth";

const methods = [
  { id: "git", icon: GitBranch, label: "GitHub Repo", description: "Seamlessly connect and import from GitHub.", href: "/dashboard/new/git" },
  { id: "zip", icon: Upload, label: "Upload ZIP", description: "Drag and drop your project bundle directly.", href: "/dashboard/new/zip" },
  { id: "raw", icon: Code, label: "Raw Code", description: "Paste and deploy your source code instantly.", href: "/dashboard/new/raw" },
  { id: "json", icon: FileJson, label: "JSON Config", description: "Deploy using an elitehosting.json config.", href: "/dashboard/new/json" },
];

export function ProjectCreationFlow() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const hasCredits = (profile?.credit_balance || 0) > 0 || (profile?.paid_credits || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {!hasCredits && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-primary/5 border border-primary/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-primary/10 rounded-sm">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">3-Hour Free Trial Available</h3>
              <p className="text-zinc-500 text-xs mt-1">You have 0 credits. You can deploy one project for 3 hours as a trial.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => router.push('/dashboard/credits')}
              className="flex-1 md:flex-none px-6 py-2.5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-white/5 transition-all"
            >
              Buy Credits
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-3xl font-bold font-heading tracking-tight small-caps">New Deployment</h1>
        <p className="text-white/40 mt-2 text-lg">Select your preferred deployment method to begin.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <DeployOptionCard
              id={m.id}
              icon={m.icon}
              label={m.label}
              description={m.description}
              isActive={false}
              onClick={() => {
                router.push(m.href);
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
