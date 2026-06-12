"use client";

import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-4 py-20 flex-1 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 text-xs font-bold uppercase tracking-widest">
           <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tighter">Privacy Policy 🛡️</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
          <p>Your privacy is important to us. This policy explains how we collect and use your information.</p>
          <h2 className="text-white text-xl font-bold mt-10">1. Information Collection</h2>
          <p>We collect information you provide directly to us when you create an account, such as your email address, mobile number, and payment information.</p>
          <h2 className="text-white text-xl font-bold mt-10">2. Usage of Information</h2>
          <p>We use your information to provide, maintain, and improve our services, and to communicate with you about your account and updates to our platform.</p>
          <h2 className="text-white text-xl font-bold mt-10">3. Data Protection</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and is encrypted at rest.</p>
          <h2 className="text-white text-xl font-bold mt-10">4. Third-Party Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to provide the service (e.g., payment processing).</p>
          <p className="mt-20 text-[10px] uppercase tracking-widest font-bold">Last updated: June 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
