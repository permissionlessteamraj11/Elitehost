"use client";

import { useState } from "react";
import { FileJson, ArrowRight, Loader2, Plus, X, ChevronLeft, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";

export default function JsonDeploymentPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [jsonConfig, setJsonConfig] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeploy = async () => {
    if (!jsonConfig.trim()) {
        setError("JSON configuration cannot be empty.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      let config = {};
      try {
        config = JSON.parse(jsonConfig);
      } catch (e) {
        setError("Invalid JSON configuration. Please ensure it is a valid JSON object.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || (config as any).name || "JSON Deployment",
          method: "json",
          config,
          framework: (config as any).framework || (config as any).projectType || "Universal",
          build_command: (config as any).buildCommand || (config as any).build?.command,
          deploy_command: (config as any).deployCommand || (config as any).start?.command,
          env_vars: (config as any).env_vars || [],
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
      <Link href="/dashboard/new" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest small-caps">
        <ChevronLeft className="w-4 h-4" /> Back to options
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading small-caps">Deploy with JSON</h1>
        <p className="text-white/40">Highly advanced deployment control via elitehosting.json schema.</p>
      </div>

      <GlassCard className="p-8 space-y-8" hover={false} glow>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Project Name (Optional)</label>
            <input
              type="text"
              placeholder="My Awesome App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all"
            />
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">JSON Configuration</label>
                <span className="text-[10px] text-zinc-600 font-mono">elitehosting.json</span>
             </div>
             <textarea
                placeholder='{
  "name": "my-bot",
  "framework": "nodejs",
  "buildCommand": "npm run build",
  "deployCommand": "npm start",
  "env_vars": [
    { "key": "TOKEN", "value": "xyz" }
  ]
}'
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                className="w-full h-96 bg-void/50 border border-white/10 rounded-xl p-4 font-mono text-xs focus:outline-none focus:border-white/30 transition-all custom-scrollbar"
              />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="pt-4">
          <AnimatedButton
            onClick={handleDeploy}
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3 gap-2 text-[10px] uppercase tracking-widest font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Parse & Deploy <ArrowRight className="w-4 h-4" /></>}
          </AnimatedButton>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <GlassCard className="p-6" hover={false}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Pro Tip</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
                Using JSON deployment allows you to define complex environment configurations and version-controlled infrastructure parameters in a single block.
            </p>
         </GlassCard>
         <GlassCard className="p-6" hover={false}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Schema Support</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
                The EliteHosting engine automatically detects framework requirements from your JSON. Ensure `name` and `framework` are present for optimal performance.
            </p>
         </GlassCard>
      </div>
    </div>
  );
}
