"use client";

import { motion } from "framer-motion";
import { GitBranch, Upload, Code, FileJson } from "lucide-react";
import { DeployOptionCard } from "./deploy-option-card";
import { useRouter } from "next/navigation";

const methods = [
  { id: "git", icon: GitBranch, label: "GitHub Repo", description: "Seamlessly connect and import from GitHub.", href: "/dashboard/new/git" },
  { id: "zip", icon: Upload, label: "Upload ZIP", description: "Drag and drop your project bundle directly.", href: "/dashboard/new/zip" },
  { id: "raw", icon: Code, label: "Raw Code", description: "Paste and deploy your source code instantly.", href: "/dashboard/new/raw" },
  { id: "json", icon: FileJson, label: "JSON Config", description: "Deploy using an elitehosting.json config.", href: "/dashboard/new/json" },
];

export function ProjectCreationFlow() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
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
              onClick={() => router.push(m.href)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
