"use client";

import { useState, useRef } from "react";
import { Upload, ArrowRight, Loader2, Plus, X, ChevronLeft, FileArchive, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ZipDeploymentPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [deployCommand, setDeployCommand] = useState("");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAddEnv = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const handleRemoveEnv = (index: number) => setEnvVars(envVars.filter((_, i) => i !== index));
  const handleEnvChange = (index: number, field: "key" | "value", val: string) => {
    const newVars = [...envVars];
    newVars[index][field] = val;
    setEnvVars(newVars);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.zip')) {
        setError("Only ZIP files are supported.");
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit.");
        return;
      }
      setFile(selectedFile);
      if (!name) setName(selectedFile.name.replace('.zip', ''));
      setError(null);
    }
  };

  const handleDeploy = async () => {
    if (!file) {
      setError("Please select a ZIP file first.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('build_command', buildCommand);
    formData.append('deploy_command', deployCommand);
    formData.append('env_vars', JSON.stringify(envVars.filter(v => v.key && v.value)));

    try {
      const res = await fetch("/api/deployments/zip", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Deployment failed");
      } else {
        router.push(`/dashboard/deployments/${data.deploymentId}`);
      }
    } catch (err) {
      setError("An unexpected error occurred during upload.");
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
        <h1 className="text-3xl font-bold font-heading small-caps">Deploy ZIP Archive</h1>
        <p className="text-white/40">Upload your project bundle directly with advanced configurations.</p>
      </div>

      <GlassCard className="p-8 space-y-8" hover={false} glow>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Project Name</label>
            <input
              type="text"
              placeholder="My Awesome Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all"
            />
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
                "relative text-center p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer group",
                file ? "border-white/30 bg-white/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".zip"
              className="hidden"
            />
            <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500",
                file ? "bg-white text-void" : "bg-white/5 text-white/40 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white"
            )}>
              {file ? <FileArchive className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold font-poppins mb-1 small-caps">
                {file ? file.name : "Drop your ZIP here"}
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mx-auto">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change` : "Max 50MB. Click to browse."}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Advanced Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Build Command (Optional)</label>
                    <input
                        type="text"
                        placeholder="npm run build"
                        value={buildCommand}
                        onChange={(e) => setBuildCommand(e.target.value)}
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 font-mono transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest small-caps">Deploy Command (Optional)</label>
                    <input
                        type="text"
                        placeholder="npm start"
                        value={deployCommand}
                        onChange={(e) => setDeployCommand(e.target.value)}
                        className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 font-mono transition-all"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
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
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="pt-4">
          <AnimatedButton
            onClick={handleDeploy}
            disabled={loading || !file}
            className="w-full sm:w-auto px-10 py-3 gap-2 text-[10px] uppercase tracking-widest font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upload & Deploy <ArrowRight className="w-4 h-4" /></>}
          </AnimatedButton>
        </div>
      </GlassCard>
    </div>
  );
}
