"use client";

import { useEffect, useState, use } from "react";
import { TerminalLogs } from "@/components/dashboard/deployments/terminal-logs";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { History, RefreshCw, RotateCcw, Save, Loader2, AlertCircle } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";

export default function DeploymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deployment, setDeployment] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>(["Initializing..."]);
  const [configJson, setConfigJson] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeployment();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchDeployment = async () => {
    try {
      const res = await fetch(`/api/deployments/${id}`);
      const data = await res.json();
      if (res.ok) {
        setDeployment(data.deployment);
        setVersions(data.versions || []);
        setConfigJson(JSON.stringify(data.deployment.config, null, 2));
      }
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/deployments/${id}/logs`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs.split('\n'));
        if (data.status && deployment?.status !== data.status) {
          setDeployment((prev: any) => ({ ...prev, status: data.status }));
        }
      }
    } catch (e) {}
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setError("");
    try {
      const config = JSON.parse(configJson);
      const res = await fetch(`/api/deployments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, changes: "Manual config update" }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
        fetchDeployment();
      } else {
        setError(data.error || "Failed to save configuration");
      }
    } catch (e) {
      setError("Invalid JSON format");
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (version: number) => {
    if (!confirm(`Are you sure you want to rollback to version ${version}?`)) return;
    try {
      const res = await fetch(`/api/deployments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback", version }),
      });
      if (res.ok) {
        fetchDeployment();
        alert("Rollback initiated");
      }
    } catch (e) {
      alert("Rollback failed");
    }
  };

  const handleRedeploy = async () => {
    try {
      const res = await fetch(`/api/deployments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeploy" }),
      });
      if (res.ok) {
        alert("Redeployment initiated");
      }
    } catch (e) {
      alert("Redeploy failed");
    }
  };

  if (!deployment) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-white/20" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading small-caps">{deployment.name}</h1>
            <StatusChip status={deployment.status} />
          </div>
          <p className="text-white/40 text-sm font-mono">{id}</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatedButton onClick={handleRedeploy} variant="secondary" className="px-4 py-2 text-xs gap-2 small-caps font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Redeploy
          </AnimatedButton>
          <AnimatedButton onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 text-xs gap-2 small-caps font-bold">
            <Save className="w-3.5 h-3.5" /> {isEditing ? "Cancel Edit" : "Edit Config"}
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isEditing ? (
            <GlassCard className="p-6 space-y-4" hover={false} glow>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest small-caps">Configuration (JSON)</h3>
                <div className="flex items-center gap-2">
                  {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</span>}
                  <button
                    disabled={saving}
                    onClick={handleSaveConfig}
                    className="text-xs text-primary hover:underline small-caps font-bold disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                className="w-full h-[500px] bg-void border border-white/10 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-primary/50 resize-none custom-scrollbar"
              />
            </GlassCard>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-bold font-heading small-caps flex items-center gap-2">
                <TerminalLogs logs={logs} />
              </h2>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6 space-y-6" hover={false}>
            <h3 className="text-sm font-bold uppercase tracking-widest small-caps flex items-center gap-2">
              <History className="w-4 h-4" /> Version History
            </h3>
            <div className="space-y-4">
              {versions.slice().reverse().map((v: any) => (
                <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">v{v.version}</span>
                      {v.version === versions.length && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Active</span>}
                    </div>
                    <p className="text-[10px] text-white/40">{new Date(v.created_at).toLocaleString()}</p>
                  </div>
                  {v.version !== versions.length && (
                    <button
                      onClick={() => handleRollback(v.version)}
                      className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-primary"
                      title="Rollback to this version"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4" hover={false}>
            <h3 className="text-sm font-bold uppercase tracking-widest small-caps">Environment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Framework</span>
                <span className="font-bold">{deployment.config.projectType}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Runtime</span>
                <span className="font-bold">{deployment.config.runtime.language} {deployment.config.runtime.version}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Source</span>
                <span className="font-bold">{deployment.config.source.type}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
