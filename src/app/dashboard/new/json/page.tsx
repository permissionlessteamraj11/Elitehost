"use client";

import { useState } from "react";
import { FileJson, ArrowRight, Loader2, Plus, X, ChevronLeft } from "lucide-react";
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
    setLoading(true);
    setError(null);
    try {
      let config = {};
      try {
        config = JSON.parse(jsonConfig);
      } catch (e) {
        setError("Invalid JSON configuration");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "My Awesome Bot",
          method: "json",
          config,
          framework: (config as any).framework || "Universal",
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
        <h1 className="text-3xl font-bold font-heading small-caps">Deploy with JSON</h1>
        <p className="text-white/40">Use elitehosting.json for advanced deployment control.</p>
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
              className="w-full bg-void/50 border border-white/10 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-electric/50"
            />
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-text-secondary uppercase tracking-widest small-caps">JSON Configuration</label>
             <textarea
                placeholder='{ "framework": "nextjs", "buildCommand": "npm run build", ... }'
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                className="w-full h-80 bg-void/50 border border-white/10 rounded-sm p-4 font-mono text-xs focus:outline-none focus:border-electric/50"
              />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-sm bg-red-500/10 border border-red-500/20 text-red-500 text-xs small-caps font-bold">
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
