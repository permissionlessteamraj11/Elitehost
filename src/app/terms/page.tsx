"use client";

import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-4 py-20 flex-1 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 text-xs font-bold uppercase tracking-widest">
           <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tighter">Terms of Service 📜</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
          <p>Welcome to EliteHosting (ZynoCloud). By using our services, you agree to these terms.</p>
          <h2 className="text-white text-xl font-bold mt-10">1. Acceptance of Terms</h2>
          <p>By accessing or using our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          <h2 className="text-white text-xl font-bold mt-10">2. Use of Service</h2>
          <p>You may not use our services for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</p>
          <h2 className="text-white text-xl font-bold mt-10">3. Account Responsibility</h2>
          <p>You are responsible for maintaining the security of your account and password. ZynoCloud cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
          <h2 className="text-white text-xl font-bold mt-10">4. Termination</h2>
          <p>We reserve the right to terminate your access to the service for any reason, including but not limited to violation of these terms or non-payment of fees.</p>
          <p className="mt-20 text-[10px] uppercase tracking-widest font-bold">Last updated: June 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
