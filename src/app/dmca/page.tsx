"use client";

import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-4 py-20 flex-1 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 text-xs font-bold uppercase tracking-widest">
           <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tighter">DMCA Policy ⚖️</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
          <p>We respect intellectual property rights and expect our users to do the same.</p>
          <h2 className="text-white text-xl font-bold mt-10">1. Reporting Infringement</h2>
          <p>If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible via our service, please notify our copyright agent.</p>
          <h2 className="text-white text-xl font-bold mt-10">2. Required Information</h2>
          <p>Your notification must include: a description of the copyrighted work, the location of the infringing material on our site, and your contact information.</p>
          <h2 className="text-white text-xl font-bold mt-10">3. Counter-Notification</h2>
          <p>If you believe your content was removed by mistake, you may file a counter-notification. We will follow the legal process as outlined in the DMCA.</p>
          <h2 className="text-white text-xl font-bold mt-10">4. Repeat Infringers</h2>
          <p>It is our policy in appropriate circumstances to disable and/or terminate the accounts of users who are repeat infringers.</p>
          <p className="mt-20 text-[10px] uppercase tracking-widest font-bold">Last updated: June 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
