"use client";

import { useState } from "react";
import { GitBranch, Upload, Code, FileJson, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const methods = [
  { id: "git", icon: GitBranch, label: "GitHub Repo", description: "Connect and import from GitHub" },
  { id: "zip", icon: Upload, label: "Upload ZIP", description: "Drag and drop project files" },
  { id: "raw", icon: Code, label: "Raw Code", description: "Paste your source code directly" },
  { id: "json", icon: FileJson, label: "JSON Config", description: "Deploy with elitehosting.json" },
];

export function ProjectCreationFlow() {
  const [method, setMethod] = useState<string>("git");
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">New Deployment</h1>
        <p className="text-gray-400">Choose how you want to deploy your application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex items-start gap-4 p-6 rounded-xl border text-left transition-all",
              method === m.id
                ? "border-[#00E5FF] bg-[#00E5FF]/5 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg bg-black/40",
              method === m.id ? "text-[#00E5FF]" : "text-gray-400"
            )}>
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">{m.label}</div>
              <div className="text-sm text-gray-500">{m.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-8 rounded-xl border border-white/5 bg-white/5 space-y-6">
        {method === "git" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">GitHub Repository URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://github.com/username/repo"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00E5FF]/50"
              />
              <button className="px-6 py-2 bg-[#00E5FF] text-black font-bold rounded-lg flex items-center gap-2">
                Import <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {method === "zip" && (
          <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-[#00E5FF]/30 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-300">Drop your ZIP here</div>
            <div className="text-sm text-gray-500">Maximum file size: 50MB</div>
          </div>
        )}

        {method === "raw" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Source Code</label>
            <textarea
              placeholder="Paste your code here..."
              className="w-full h-64 bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-[#00E5FF]/50"
            />
            <button className="px-6 py-2 bg-[#00E5FF] text-black font-bold rounded-lg">
              Deploy Snippet
            </button>
          </div>
        )}

        {method === "json" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Deployment Config (JSON)</label>
            <textarea
              placeholder='{ "framework": "nextjs", ... }'
              className="w-full h-64 bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-[#00E5FF]/50"
            />
            <button className="px-6 py-2 bg-[#00E5FF] text-black font-bold rounded-lg">
              Deploy with Config
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
