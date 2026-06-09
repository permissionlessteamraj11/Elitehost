"use client";

import { useState } from "react";
import { Upload, ArrowRight, Loader2, Plus, X, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";

export default function ZipDeploymentPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [deployCommand, setDeployCommand] = useState("");
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
      // Simulate ZIP upload deployment
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "My Awesome Bot",
          method: "zip",
          build_command: buildCommand,
          deploy_command: deployCommand,
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/dashboard/new" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest small-caps">
        <ChevronLeft className="w-4 h-4" /> Back to options
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading small-caps">Deploy ZIP Archive</h1>
        <p className="text-white/40">Upload your project bundle and go live instantly.</p>
      </div>

      <GlassCard className="p-8 space-y-8" hover={false} glow>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Project Name</label>
            <input
              type="text"
              placeholder="My Awesome Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50"
            />
          </div>

          <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-3xl hover:border-electric/30 hover:bg-electric/5 transition-all cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-electric group-hover:text-void transition-all duration-500">
              <Upload className="w-8 h-8 text-white/40 group-hover:text-void" />
            </div>
            <h3 className="text-lg font-bold font-poppins mb-1 small-caps">Drop your ZIP here</h3>
            <p className="text-xs text-white/40 max-w-xs mx-auto uppercase tracking-widest">Click to browse or drag and drop. Max 50MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Build Command (Optional)</label>
            <input
              type="text"
              placeholder="npm run build"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50 font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Deploy Command (Optional)</label>
            <input
              type="text"
              placeholder="npm start"
              value={deployCommand}
              onChange={(e) => setDeployCommand(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50 font-mono"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">Environment Variables</label>
            <button onClick={handleAddEnv} className="text-xs text-primary hover:underline flex items-center gap-1 small-caps font-bold">
              <Plus className="w-3 h-3" /> Add Variable
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
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
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs small-caps font-bold">
            {error}
          </div>
        )}

        <div className="pt-4">
          <AnimatedButton
            onClick={handleDeploy}
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3 gap-2 text-sm uppercase tracking-widest small-caps"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Deploy Project <ArrowRight className="w-4 h-4" /></>}
          </AnimatedButton>
        </div>
      </GlassCard>
    </div>
  );
}
