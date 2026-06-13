"use client";

import { useState, useEffect } from "react";
import { Github, ArrowRight, Loader2, Plus, X, ChevronLeft, Search, Lock, Globe, Link2, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GitHubDeploymentPage() {
  const [activeTab, setActiveTab] = useState<"import" | "public">("import");
  const [loading, setLoading] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<any>(null);

  // Configuration State
  const [name, setName] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [buildCommand, setBuildCommand] = useState("");
  const [deployCommand, setDeployCommand] = useState("");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "import") {
      fetchRepos();
    }
  }, [activeTab]);

  const fetchRepos = async () => {
    setReposLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/repositories");
      const data = await res.json();
      if (res.ok) {
        setRepositories(data.repositories);
      } else {
        if (data.error !== "GitHub not connected") {
          setError(data.error || "Failed to fetch repositories");
        } else {
           setError("GitHub not connected");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching repositories");
    } finally {
      setReposLoading(false);
    }
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddEnv = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const handleRemoveEnv = (index: number) => setEnvVars(envVars.filter((_, i) => i !== index));
  const handleEnvChange = (index: number, field: "key" | "value", val: string) => {
    const newVars = [...envVars];
    newVars[index][field] = val;
    setEnvVars(newVars);
  };

  const handleDeploy = async () => {
    if (activeTab === "import" && !selectedRepo) return;
    if (activeTab === "public" && !publicUrl) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || (activeTab === "import" ? selectedRepo.name : "Public App"),
          method: activeTab === "import" ? "github" : "github_public",
          repoUrl: activeTab === "import" ? selectedRepo.url : publicUrl,
          branch: branch,
          framework: activeTab === "import" ? (selectedRepo.language || "Universal") : "Universal",
          build_command: buildCommand,
          deploy_command: deployCommand,
          env_vars: envVars.filter(v => v.key && v.value),
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

  const renderConfigFields = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Project Name</label>
          <input
            type="text"
            placeholder="My Awesome App"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Branch</label>
          <input
            type="text"
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Build Command</label>
            <span className="text-[10px] text-zinc-600">(Optional)</span>
          </div>
          <input
            type="text"
            placeholder="npm run build"
            value={buildCommand}
            onChange={(e) => setBuildCommand(e.target.value)}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all font-mono"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Deploy Command</label>
            <span className="text-[10px] text-zinc-600">(Optional)</span>
          </div>
          <input
            type="text"
            placeholder="npm start"
            value={deployCommand}
            onChange={(e) => setDeployCommand(e.target.value)}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all font-mono"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Environment Variables</label>
          <button onClick={handleAddEnv} className="text-[10px] text-white hover:underline flex items-center gap-1 font-bold uppercase tracking-wider">
            <Plus className="w-3 h-3" /> Add Variable
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {envVars.map((ev, idx) => (
            <div key={idx} className="flex gap-3 animate-in zoom-in-95 duration-200">
              <input
                type="text"
                placeholder="KEY"
                value={ev.key}
                onChange={(e) => handleEnvChange(idx, 'key', e.target.value)}
                className="flex-1 bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/30 font-mono"
              />
              <input
                type="text"
                placeholder="VALUE"
                value={ev.value}
                onChange={(e) => handleEnvChange(idx, 'value', e.target.value)}
                className="flex-1 bg-void/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/30 font-mono"
              />
              {envVars.length > 1 && (
                <button onClick={() => handleRemoveEnv(idx)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
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
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Start Deployment <ArrowRight className="w-4 h-4" /></>}
        </AnimatedButton>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/dashboard/new" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest small-caps">
        <ChevronLeft className="w-4 h-4" /> Back to options
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading small-caps">Deploy from GitHub</h1>
          <p className="text-white/40">Highly advanced deployment via repository import or public URL.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => { setActiveTab("import"); setSelectedRepo(null); setError(null); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === "import" ? "bg-white text-void" : "text-zinc-500 hover:text-white"
            )}
          >
            Import Account
          </button>
          <button
            onClick={() => { setActiveTab("public"); setSelectedRepo(null); setError(null); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === "public" ? "bg-white text-void" : "text-zinc-500 hover:text-white"
            )}
          >
            Public URL
          </button>
        </div>
      </div>

      {activeTab === "import" ? (
        <>
          {error === "GitHub not connected" ? (
            <GlassCard className="p-12 text-center space-y-6" hover={false} glow>
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                <Github className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold small-caps">Connect GitHub</h2>
                <p className="text-white/40 max-w-sm mx-auto text-sm">Connect your GitHub account to access your private and public repositories directly.</p>
              </div>
              <AnimatedButton onClick={() => window.location.href = "/api/github/connect"} className="px-8 py-3 gap-2 text-[10px] font-bold uppercase tracking-widest">
                <Github className="w-4 h-4" /> Authorize EliteHosting
              </AnimatedButton>
            </GlassCard>
          ) : !selectedRepo ? (
            <GlassCard className="p-0 overflow-hidden" hover={false}>
              <div className="p-6 border-b border-white/5 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search your repositories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-void/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {reposLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-white/40">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Retrieving repositories...</p>
                  </div>
                ) : filteredRepos.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {filteredRepos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => {
                          setSelectedRepo(repo);
                          setName(repo.name);
                        }}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Github className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{repo.full_name}</span>
                              {repo.private ? <Lock className="w-3 h-3 text-white/20" /> : <Globe className="w-3 h-3 text-white/20" />}
                            </div>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider truncate max-w-md">{repo.description || "No description provided"}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-white/40 space-y-2">
                    <p className="text-sm font-bold uppercase tracking-widest">No repositories found</p>
                    <p className="text-[10px]">Try a different search term or reconnect your account.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 space-y-8" hover={false} glow>
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{selectedRepo.full_name}</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest small-caps font-bold">Source: GitHub Account</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRepo(null)}
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-bold underline decoration-zinc-800 underline-offset-4"
                >
                  Change Repository
                </button>
              </div>
              {renderConfigFields()}
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard className="p-8 space-y-8" hover={false} glow>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Public Repository URL</label>
              <div className="relative">
                 <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input
                  type="text"
                  placeholder="https://github.com/username/repository"
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  className="w-full bg-void/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-white/30 font-mono transition-all"
                />
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Example: https://github.com/nextjs/nextjs-blog</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Advanced Configuration</h3>
             </div>
             {renderConfigFields()}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
