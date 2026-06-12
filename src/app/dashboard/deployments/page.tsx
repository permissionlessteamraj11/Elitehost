"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Rocket, ExternalLink, Clock, Trash2, Search, Filter, RotateCcw, StopCircle, MoreVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";
import { StatusChip } from "@/components/ui/status-chip";
import { cn } from "@/lib/utils";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const res = await fetch("/api/deployments");
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments || []);
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeployments = deployments.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Deployments</h1>
          <p className="text-text-secondary text-sm">Manage and monitor all your active services.</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search deployments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-full md:w-64"
              />
           </div>
           <Link href="/dashboard/new">
             <AnimatedButton size="sm" className="gap-2">
               <Rocket className="w-4 h-4" /> New Project
             </AnimatedButton>
           </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : filteredDeployments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeployments.map((deployment) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6 space-y-4 group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{deployment.name || 'Unnamed Project'}</h3>
                    <div className="text-[10px] font-mono text-text-secondary truncate max-w-[150px] uppercase tracking-widest">
                      ID: {deployment.id}
                    </div>
                  </div>
                  <StatusChip status={deployment.status === 'ready' ? 'success' : 'pending'} label={deployment.status} />
                </div>

                <div className="space-y-3 pt-2">
                   <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      Deployed {new Date(deployment.created_at).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Layers className="w-3.5 h-3.5" />
                      {deployment.framework || 'Universal'}
                   </div>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/deployments/${deployment.id}`} className="flex-1">
                      <AnimatedButton variant="primary" size="sm" className="w-full text-[10px] uppercase tracking-widest font-black">
                        Manage
                      </AnimatedButton>
                    </Link>
                    <AnimatedButton variant="outline" size="sm" className="px-3 border-white/10 text-white hover:bg-white/5">
                      <RotateCcw className="w-4 h-4" />
                    </AnimatedButton>
                    <AnimatedButton variant="outline" size="sm" className="px-3 border-white/10 text-white hover:bg-white/5">
                      <StopCircle className="w-4 h-4" />
                    </AnimatedButton>
                  </div>
                  <AnimatedButton variant="ghost" size="sm" className="w-full text-[10px] uppercase tracking-widest font-bold text-red-500/50 hover:text-red-500 hover:bg-red-500/5">
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Deployment
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <GlassCard className="p-20 text-center space-y-6" hover={false}>
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto border border-white/10">
            <Layers className="w-10 h-10 text-text-secondary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading">No deployments found</h2>
            <p className="text-text-secondary max-w-sm mx-auto">
              You haven't deployed any projects yet. Start by creating a new project from GitHub or a ZIP file.
            </p>
          </div>
          <Link href="/dashboard/new" className="inline-block">
            <AnimatedButton className="gap-2">
              <Rocket className="w-4 h-4" /> Deploy Your First Bot
            </AnimatedButton>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
