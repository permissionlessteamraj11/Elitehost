"use client";

import { motion } from "framer-motion";
import { Rocket, Shield, Zap, Globe } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-[#00E5FF] uppercase bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full">
            EliteHost v14.0 — Ultra Advanced
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Deploy your code <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#7C3AED]">
              in seconds.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10">
            Enterprise-grade cloud platform for elite developers. Ultra-fast deployments,
            Mumbai-based edge servers, and smart resource management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-[#00E5FF] text-black font-bold rounded-sm hover:bg-[#00E5FF]/90 transition-colors"
            >
              Start Deploying Free
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-sm hover:bg-white/10 transition-colors"
            >
              Read Documentation
            </Link>
          </div>
        </motion.div>

        {/* Floating Terminal Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-20 mx-auto max-w-4xl rounded-sm border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-[#00E5FF]/10"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-bottom border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="text-xs text-gray-500 font-mono flex-1 text-center">bash — elitehosting.json</div>
          </div>
          <div className="p-6 text-left font-mono text-sm md:text-base leading-relaxed">
            <div className="flex gap-4">
              <span className="text-[#00E5FF]">$</span>
              <span className="text-white">git push elite-hosting main</span>
            </div>
            <div className="mt-2 text-gray-500">Enumerating objects: 24, done.</div>
            <div className="text-gray-500">Counting objects: 100% (24/24), done.</div>
            <div className="text-[#7C3AED] mt-2">🚀 INITIALIZING ELITE ENGINE v14.0...</div>
            <div className="text-[#00E5FF]">📡 CONNECTION: ap-south-1 (Mumbai) [SECURE]</div>
            <div className="text-[#10B981]">✅ DETECTED: Next.js Enterprise Environment</div>
            <div className="text-gray-400 mt-2">📦 INSTALLING 482 DEPENDENCIES...</div>
            <div className="text-[#10B981]">✓ BUILD SUCCESSFUL [2.4s]</div>
            <div className="text-[#00E5FF]">✅ DEPLOYMENT LIVE: https://elite-hosting.app</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
