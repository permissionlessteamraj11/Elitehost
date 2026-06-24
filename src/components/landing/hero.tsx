"use client";

import { motion } from "framer-motion";
import { Rocket, Shield, Zap, Globe, ArrowRight, Terminal as TerminalIcon } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";

export function Hero() {
  const terminalLines = [
    { text: "$ git push elite main", delay: 0.1 },
    { text: "Enumerating objects: 42, done.", delay: 0.2, color: "text-zinc-600" },
    { text: "Counting objects: 100% (42/42), done.", delay: 0.3, color: "text-zinc-600" },
    { text: "✨ INITIALIZING ELITE ENGINE...", delay: 0.5, color: "text-white font-bold animate-pulse" },
    { text: "📡 NODE: Mumbai-Edge-01 💎 [SECURE]", delay: 0.7, color: "text-zinc-400" },
    { text: "✅ FRAMEWORK: Telegram Bot (Python) Detected", delay: 0.9, color: "text-zinc-300" },
    { text: "📦 Installing production dependencies...", delay: 1.1, color: "text-zinc-500" },
    { text: "✓ BUILD SUCCESSFUL [1.2s] ⚡", delay: 1.3, color: "text-white font-bold" },
    { text: "🌍 STATUS: ONLINE 24/7", delay: 1.5, color: "text-white font-bold" }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Refined B&W background with grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
        }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-white uppercase bg-white/5 border border-white/10 rounded-full small-caps">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            EliteHost v15.0 — Premium Edition 💎
          </span>
          <h1 className="text-5xl md:text-8xl font-bold mb-6 tracking-[-0.05em] leading-[0.9]">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500"
            >
              #1 Telegram Bot Hosting
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600"
            >
              in Mumbai. 🚀
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="max-w-2xl mx-auto text-base md:text-lg text-zinc-400 mb-10 leading-relaxed aeo-answer"
          >
            EliteHost provides the fastest <strong>Telegram bot hosting in India</strong> with a dedicated <strong>Mumbai Edge</strong> network.
            Deploy your Python and Node.js bots instantly on professional-grade cloud infrastructure with sub-5ms latency and 24/7 uptime guarantee. ⚡
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/register">
              <AnimatedButton variant="primary" size="sm" className="min-w-[160px]">
                Start Free <ArrowRight className="w-3.5 h-3.5" />
              </AnimatedButton>
            </Link>
            <Link href="/docs">
              <AnimatedButton variant="outline" size="sm" className="min-w-[160px]">
                Documentation
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Terminal Mockup - Optimized for B&W */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-20 mx-auto max-w-4xl rounded-sm border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl animate-float"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/10" />
            </div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex-1 text-center font-mono">
              terminal — zynochat-cloud
            </div>
          </div>
          <div className="p-6 text-left font-mono text-xs md:text-sm leading-relaxed">
            {terminalLines.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + line.delay, duration: 0.3 }}
                className={`flex gap-4 ${idx > 0 ? "mt-1" : ""} ${line.color || "text-white"}`}
              >
                {idx === 0 && <span className="text-zinc-500">$</span>}
                <span>{line.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
