"use client";

import { useState } from "react";
import { GitBranch, Upload, Code, FileJson, ArrowRight, Loader2, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DeployOptionCard } from "./deploy-option-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { GlassCard } from "@/components/ui/glass-card";

const methods = [
  { id: "git", icon: GitBranch, label: "GitHub Repo", description: "Seamlessly connect and import from GitHub." },
  { id: "zip", icon: Upload, label: "Upload ZIP", description: "Drag and drop your project bundle directly." },
  { id: "raw", icon: Code, label: "Raw Code", description: "Paste and deploy your source code instantly." },
  { id: "json", icon: FileJson, label: "JSON Config", description: "Deploy using an elitehosting.json config." },
];

export function ProjectCreationFlow() {
  const [method, setMethod] = useState<string>("git");
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-4xl font-bold font-poppins tracking-tight">New Deployment</h1>
        <p className="text-white/40 mt-2 text-lg">Select your preferred deployment method to begin.</p>
      </motion.div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        role="radiogroup"
        aria-label="Deployment method"
      >
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
              isActive={method === m.id}
              onClick={() => setMethod(m.id)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={method}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8 lg:p-10" hover={false} glow>
            {method === "git" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-poppins">Import from GitHub</h3>
                    <p className="text-sm text-white/40">Enter your repository URL below</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative group">
                    <label htmlFor="github-url" className="sr-only">GitHub Repository URL</label>
                    <input
                      id="github-url"
                      type="text"
                      placeholder="https://github.com/username/repo"
                      className="w-full bg-void/50 border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all placeholder:text-white/20"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-electric/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <AnimatedButton className="w-full sm:w-auto px-10 py-4 gap-2 text-base shadow-[0_8px_24px_rgba(0,229,255,0.25)]">
                    Import Repository <ArrowRight className="w-5 h-5" />
                  </AnimatedButton>
                </div>
              </div>
            )}

            {method === "zip" && (
              <div className="space-y-6">
                <div className="text-center p-12 lg:p-20 border-2 border-dashed border-white/10 rounded-[32px] hover:border-electric/30 hover:bg-electric/5 transition-all cursor-pointer group">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-electric group-hover:text-void transition-all duration-500">
                    <Upload className="w-10 h-10 text-white/40 group-hover:text-void" />
                  </div>
                  <h3 className="text-xl font-bold font-poppins mb-2">Drop your ZIP here</h3>
                  <p className="text-white/40 max-w-xs mx-auto">Click to browse or drag and drop your project bundle. Max size 50MB.</p>
                </div>
              </div>
            )}

            {method === "raw" && (
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold font-poppins">Deploy Raw Snippet</h3>
                    <p className="text-sm text-white/40">Paste your source code to deploy instantly</p>
                  </div>
                <label htmlFor="raw-code" className="sr-only">Source Code</label>
                <textarea
                  id="raw-code"
                  placeholder="Paste your code here..."
                  className="w-full h-80 bg-void/50 border border-white/10 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all placeholder:text-white/20"
                />
                <AnimatedButton className="w-full sm:w-auto px-10 py-4 text-base">
                  Deploy Snippet
                </AnimatedButton>
              </div>
            )}

            {method === "json" && (
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold font-poppins">Configuration Deployment</h3>
                    <p className="text-sm text-white/40">Use elitehosting.json for advanced control</p>
                  </div>
                <label htmlFor="config-json" className="sr-only">Configuration JSON</label>
                <textarea
                  id="config-json"
                  placeholder='{ "framework": "nextjs", ... }'
                  className="w-full h-80 bg-void/50 border border-white/10 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all placeholder:text-white/20"
                />
                <AnimatedButton className="w-full sm:w-auto px-10 py-4 text-base">
                  Deploy with Config
                </AnimatedButton>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
