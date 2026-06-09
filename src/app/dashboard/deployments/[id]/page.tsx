"use client";

import { useEffect, useState } from "react";
import { TerminalLogs } from "@/components/dashboard/deployments/terminal-logs";
import { use } from "react";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployment Details</h1>
          <p className="text-gray-400">Monitoring deployment ID: <span className="font-mono text-[#00E5FF]">{id}</span></p>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-sm font-bold uppercase tracking-wider">
          {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Build Logs</h2>
          <TerminalLogs logs={logs} />
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Deployment Info</h2>
          <div className="p-6 rounded-xl border border-white/5 bg-white/5 space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Framework</div>
              <div className="text-white font-medium">Next.js 15</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Region</div>
              <div className="text-white font-medium">Mumbai (ap-south-1)</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Runtime</div>
              <div className="text-white font-medium">Node.js 22</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
