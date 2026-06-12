"use client";

import { motion } from "framer-motion";
import { GitBranch, Upload, Code, FileJson, AlertCircle } from "lucide-react";
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
          className="p-6 bg-white/5 border border-white/10 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-white/10 rounded-sm">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">Insufficient Credits</h3>
              <p className="text-zinc-500 text-xs mt-1">You need at least 1 credit to initiate a deployment.</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/credits')}
            className="w-full md:w-auto px-6 py-2.5 bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-zinc-200 transition-all"
          >
            Buy Credits
          </button>
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
                if (!hasCredits) {
                  router.push('/dashboard/credits');
                } else {
                  router.push(m.href);
                }
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
