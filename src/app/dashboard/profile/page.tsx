"use client";

import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Layers,
  Globe,
  ExternalLink,
  ShieldCheck,
  Award
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { StatusChip } from "@/components/ui/status-chip";

const publicProjects = [
  { name: "Elite Commerce", framework: "Next.js", url: "elite-commerce.host", status: "success" as const },
  { name: "Nexus Dashboard", framework: "React", url: "nexus-db.host", status: "success" as const },
];

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header / Hero */}
      <GlassCard className="p-8 lg:p-12 relative overflow-hidden" hover={false} glow>
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <User className="w-64 h-64" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-electric to-neon-purple p-1 shadow-[0_0_30px_rgba(6,217,255,0.3)]">
            <div className="w-full h-full rounded-[28px] bg-void flex items-center justify-center overflow-hidden">
               <User className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold font-space-grotesk tracking-tight">Alex Elite</h1>
              <p className="text-text-secondary">@alex_developer • Full Stack Architect</p>
            </div>

            <p className="max-w-2xl text-text-secondary leading-relaxed">
              Building the future of cloud infrastructure. Passionate about AI-driven deployments,
              distributed systems, and high-performance web applications.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
              <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /> elite.dev</span>
              <span className="flex items-center gap-1.5"><Twitter className="w-4 h-4" /> @alex_elite</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatedButton className="gap-2">Edit Profile</AnimatedButton>
            <AnimatedButton variant="outline" className="gap-2">Share Profile</AnimatedButton>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
           <GlassCard className="p-6 space-y-6" hover={false}>
             <h3 className="text-lg font-bold font-space-grotesk flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-white" /> Credentials
             </h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-sm bg-white/5 border border-white/5">
                   <div className="text-sm">Verified Developer</div>
                   <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-sm bg-white/5 border border-white/5">
                   <div className="text-sm">Early Adopter</div>
                   <Award className="w-4 h-4 text-warning" />
                </div>
             </div>
           </GlassCard>

           <GlassCard className="p-6 space-y-4" hover={false}>
             <h3 className="text-lg font-bold font-space-grotesk">Global Stats</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-sm bg-white/5 text-center">
                   <div className="text-2xl font-bold">128</div>
                   <div className="text-[10px] text-text-secondary uppercase">Deployments</div>
                </div>
                <div className="p-4 rounded-sm bg-white/5 text-center">
                   <div className="text-2xl font-bold">14</div>
                   <div className="text-[10px] text-text-secondary uppercase">Active Projects</div>
                </div>
             </div>
           </GlassCard>
        </div>

        {/* Projects Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-space-grotesk">Public Projects</h2>
            <AnimatedButton variant="outline" size="sm">Explore More</AnimatedButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicProjects.map((project, idx) => (
              <GlassCard key={idx} className="p-6 space-y-4 group">
                <div className="flex items-center justify-between">
                   <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center border border-electric/20">
                      <Layers className="w-5 h-5 text-white" />
                   </div>
                   <StatusChip status={project.status} label="online" />
                </div>
                <div>
                   <h4 className="font-bold">{project.name}</h4>
                   <p className="text-xs text-text-secondary">{project.framework}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-text-secondary">
                   <span>{project.url}</span>
                   <ExternalLink className="w-3 h-3 group-hover:text-white transition-colors" />
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-12 text-center border-dashed" hover={false}>
             <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                   <Globe className="w-8 h-8 text-text-secondary" />
                </div>
                <h3 className="font-bold">Showcase your work</h3>
                <p className="text-sm text-text-secondary">Make your projects public to share them with the developer community.</p>
                <AnimatedButton variant="secondary" size="sm">Manage Project Visibility</AnimatedButton>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
