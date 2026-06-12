"use client";

import { useEffect, useState } from "react";
import { TerminalLogs } from "@/components/dashboard/deployments/terminal-logs";
import { use } from "react";
import {
  Cpu,
  MemoryStick as Memory,
  Globe,
  Clock,
  Shield,
  RotateCcw,
  StopCircle,
  Play,
  ArrowLeft,
  Settings,
  ExternalLink,
  Terminal
} from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";
import { GlassCard } from "@/components/ui/glass-card";

export default function DeploymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [logs, setLogs] = useState<string[]>([
    "🚀 Initializing build sequence...",
    "📦 Pulling repository...",
    "⚡ Detecting framework: nextjs",
    "🔨 Running build command: npm run build",
  ]);
  const [status, setStatus] = useState("building");

  useEffect(() => {
    // Poll for logs every 3 seconds
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`/api/deployments/${id}/logs`);
            if (res.ok) {
                const data = await res.json();
                if (data.logs) {
                    // Split logs by newline and update
                    setLogs(data.logs.split('\n'));
                }
                if (data.status) {
                    setStatus(data.status);
                }
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/deployments" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tighter">ELITE PROJECT</h1>
              <div className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest">
                {status}
              </div>
            </div>
            <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedButton variant="outline" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Restart
          </AnimatedButton>
          <AnimatedButton variant="outline" size="sm" className="gap-2 text-red-500 border-red-500/20 hover:bg-red-500/5">
            <StopCircle className="w-4 h-4" /> Stop
          </AnimatedButton>
          <AnimatedButton variant="primary" size="sm" className="gap-2 font-black">
            <ExternalLink className="w-4 h-4" /> Open App
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content: Logs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-neutral-500" /> System Logs
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Polling
            </div>
          </div>
          <TerminalLogs logs={logs} />
        </div>

        {/* Sidebar: Info & Stats */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-neutral-500" /> Project Intel
          </h2>

          <GlassCard className="p-6 space-y-6" hover={false}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase">
                  <Cpu className="w-4 h-4" /> CPU
                </div>
                <div className="text-sm font-mono font-bold">12%</div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[12%]" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase">
                  <Memory className="w-4 h-4" /> RAM
                </div>
                <div className="text-sm font-mono font-bold">256MB / 1GB</div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[25%]" />
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Runtime</div>
                <div className="text-sm font-bold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-white" /> Node.js 22.x
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Region</div>
                <div className="text-sm font-bold">Mumbai (ap-south-1)</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Build Command</div>
                <div className="text-sm font-mono text-neutral-400 bg-white/5 p-2 rounded-lg mt-1">npm run build</div>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
               <Settings className="w-3.5 h-3.5" /> Project Settings
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
