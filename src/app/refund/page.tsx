"use client";

import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-4 py-20 flex-1 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 text-xs font-bold uppercase tracking-widest">
           <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tighter">Refund Policy 💸</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
          <p>Please read our refund policy carefully before making a purchase.</p>
          <h2 className="text-white text-xl font-bold mt-10">1. Credit Purchases</h2>
          <p>All credit purchases are final. Once credits are added to your account after verification, they cannot be refunded or exchanged for cash.</p>
          <h2 className="text-white text-xl font-bold mt-10">2. Service Disruptions</h2>
          <p>In case of significant service disruptions on our end, we may provide compensatory credits at our sole discretion. Cash refunds will not be issued.</p>
          <h2 className="text-white text-xl font-bold mt-10">3. Account Ban</h2>
          <p>If your account is banned for violating our Terms of Service (e.g., deploying malicious code), you forfeit all remaining credits and no refund will be provided.</p>
          <h2 className="text-white text-xl font-bold mt-10">4. Support</h2>
          <p>If you have any issues with your payment, please contact our support team immediately with your Transaction ID.</p>
          <p className="mt-20 text-[10px] uppercase tracking-widest font-bold">Last updated: June 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
