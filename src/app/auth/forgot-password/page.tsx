"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, Zap } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020108] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.05),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-sm bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center group-hover:bg-[#00E5FF]/20 transition-colors">
              <Zap className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Elite<span className="text-[#00E5FF]">Hosting</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-gray-400">Please contact our support team to reset your password.</p>
        </div>

        <div className="p-8 rounded-sm border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20">
            <Mail className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg">Contact Support</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              For security reasons, password resets are handled manually by our elite support team.
            </p>
          </div>

          <a
            href="mailto:zynochat.in@zynochat.in"
            className="block w-full py-4 bg-white text-void font-bold rounded-sm hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            Email: zynochat.in@zynochat.in
          </a>

          <div className="pt-4">
            <Link href="/auth/login" className="text-sm text-text-secondary hover:text-white flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
