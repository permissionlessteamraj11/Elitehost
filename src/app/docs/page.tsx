"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Book, Rocket, Shield, Terminal, ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "Quick Start",
    icon: <Rocket className="w-5 h-5 text-[#FFFFFF]" />,
    description: "Get your first application live in under 5 minutes.",
  },
  {
    title: "Frameworks",
    icon: <Zap className="w-5 h-5 text-[#A3A3A3]" />,
    description: "Deploy Next.js, Python, Static sites, and more.",
  },
  {
    title: "CLI Tools",
    icon: <Terminal className="w-5 h-5 text-[#10B981]" />,
    description: "Master our command-line interface for elite control.",
  },
  {
    title: "Security",
    icon: <Shield className="w-5 h-5 text-[#F59E0B]" />,
    description: "Environment variables, SSL, and DDoS protection.",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#020108] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.05),transparent_50%)]" />

      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap className="w-6 h-6 text-[#FFFFFF]" />
            <span className="font-bold">EliteHosting Docs</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Book className="w-6 h-6 text-[#FFFFFF]" />
            </div>
            <span className="text-sm font-medium tracking-wider text-[#FFFFFF] uppercase">
              Documentation
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How can we help <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#A3A3A3]">
              you build today?
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Welcome to the EliteHosting documentation. Whether you're a seasoned pro
            or just starting, we've got the guides to help you deploy like an expert.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-[#FFFFFF]/50 transition-all group cursor-pointer"
              >
                <div className="mb-4 p-2 rounded-lg bg-white/5 w-fit group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {section.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-8 rounded-3xl border border-[#FFFFFF]/20 bg-[#FFFFFF]/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to ship?</h2>
              <p className="text-gray-400">Join thousands of developers on Mumbai's fastest cloud.</p>
            </div>
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-[#FFFFFF] text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              Start Deploying Free
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} EliteHosting. Built for elite developers.
        </div>
      </footer>
    </div>
  );
}
