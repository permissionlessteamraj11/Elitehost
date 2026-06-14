"use client";

import { motion } from "framer-motion";
import { Rocket, Shield, Zap, Globe, ArrowRight, Terminal as TerminalIcon } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Refined B&W background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
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
          <h1 className="text-5xl md:text-8xl font-bold mb-6 tracking-tighter leading-tight">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Deploy your code
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            >
              instantly. 🚀
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="max-w-2xl mx-auto text-base md:text-lg text-zinc-400 mb-10 leading-relaxed aeo-answer"
          >
            EliteHost provides the fastest <strong>Telegram bot hosting</strong> in India with a dedicated Mumbai edge network.
            Experience professional-grade cloud infrastructure, enterprise security 🛡️, and
            seamless scaling for your Python and Node.js bots. ⚡
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
          className="mt-20 mx-auto max-w-4xl rounded-sm border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl"
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
            <div className="flex gap-4">
              <span className="text-zinc-500">$</span>
              <span className="text-white">git push zyno main</span>
            </div>
            <div className="mt-2 text-zinc-600">Enumerating objects: 42, done.</div>
            <div className="text-zinc-600">Counting objects: 100% (42/42), done.</div>
            <div className="text-white font-bold mt-2 animate-pulse">✨ INITIALIZING ELITE ENGINE...</div>
            <div className="text-zinc-400">📡 NODE: Mumbai-Edge-01 💎 [SECURE]</div>
            <div className="text-zinc-300">✅ FRAMEWORK: Telegram Bot (Python) Detected</div>
            <div className="text-zinc-500 mt-2">📦 Installing production dependencies...</div>
            <div className="text-white font-bold">✓ BUILD SUCCESSFUL [1.2s] ⚡</div>
            <div className="text-zinc-400">🌍 STATUS: <span className="text-white font-bold">ONLINE 24/7</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
