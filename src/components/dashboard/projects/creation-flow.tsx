"use client";

import { useState } from "react";
import { GitBranch, Upload, Code, FileJson, ArrowRight, Loader2, Github, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DeployOptionCard } from "./deploy-option-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useRouter } from "next/navigation";

const methods = [
  { id: "git", icon: GitBranch, label: "GitHub Repo", description: "Seamlessly connect and import from GitHub." },
  { id: "zip", icon: Upload, label: "Upload ZIP", description: "Drag and drop your project bundle directly." },
  { id: "raw", icon: Code, label: "Raw Code", description: "Paste and deploy your source code instantly." },
  { id: "json", icon: FileJson, label: "JSON Config", description: "Deploy using an elitehosting.json config." },
];

export function ProjectCreationFlow() {
  const [method, setMethod] = useState<string>("git");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [rawCode, setRawCode] = useState("");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddEnv = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const handleRemoveEnv = (index: number) => setEnvVars(envVars.filter((_, i) => i !== index));
  const handleEnvChange = (index: number, field: "key" | "value", val: string) => {
    const newVars = [...envVars];
    newVars[index][field] = val;
    setEnvVars(newVars);
  };

  const handleDeploy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "My Awesome Bot",
          method,
          repoUrl: method === 'git' ? repoUrl : undefined,
          rawCode: method === 'raw' ? rawCode : undefined,
          env_vars: envVars.filter(v => v.key && v.value),
          framework: "Universal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Deployment failed");
      } else {
        router.push(`/dashboard/deployments/${data.deploymentId}`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
          <GlassCard className="p-8 lg:p-10 space-y-8" hover={false} glow>
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Project Name</label>
              <input
                type="text"
                placeholder="My Awesome Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-void/50 border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-electric/50 transition-all"
              />
            </div>

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
                    <input
                      type="text"
                      placeholder="https://github.com/username/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="w-full bg-void/50 border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all placeholder:text-white/20"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-electric/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                  </div>
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
                <textarea
                  placeholder="Paste your code here..."
                  value={rawCode}
                  onChange={(e) => setRawCode(e.target.value)}
                  className="w-full h-80 bg-void/50 border border-white/10 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all placeholder:text-white/20"
                />
              </div>
            )}

            {method === "json" && (
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold font-poppins">Configuration Deployment</h3>
                    <p className="text-sm text-white/40">Use elitehosting.json for advanced control</p>
                  </div>
                <textarea
                  placeholder='{ "framework": "nextjs", ... }'
                  className="w-full h-80 bg-void/50 border border-white/10 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all placeholder:text-white/20"
                />
              </div>
            )}

            {/* Environment Variables Section */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Environment Variables</label>
                <button onClick={handleAddEnv} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Variable
                </button>
              </div>
              <div className="space-y-3">
                {envVars.map((ev, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="KEY"
                      value={ev.key}
                      onChange={(e) => handleEnvChange(idx, 'key', e.target.value)}
                      className="flex-1 bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary/50 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="VALUE"
                      value={ev.value}
                      onChange={(e) => handleEnvChange(idx, 'value', e.target.value)}
                      className="flex-1 bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary/50 font-mono"
                    />
                    {envVars.length > 1 && (
                      <button onClick={() => handleRemoveEnv(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="pt-4">
              <AnimatedButton
                onClick={handleDeploy}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 gap-2 text-base shadow-[0_8px_24px_rgba(0,229,255,0.25)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Deploy Project <ArrowRight className="w-5 h-5" /></>}
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
