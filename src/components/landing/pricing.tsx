"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";

const tiers = [
  {
    name: "Starter",
    price: "99",
    credits: "5 credits ⚡",
    features: ["5 weeks of 1 app", "All frameworks", "Real-time logs", "Free SSL"],
    button: "Get Started",
    popular: false
  },
  {
    name: "Developer",
    price: "179",
    credits: "10 credits 🚀",
    features: ["10 weeks of 1 app", "Custom domain", "AI assistance", "Priority support"],
    button: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "399",
    credits: "25 credits 💎",
    features: ["25 weeks of 1 app", "Multiple apps", "Full AI credits", "Telegram bot"],
    button: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Power",
    price: "699",
    credits: "50 credits 🔥",
    features: ["50 weeks of 1 app", "Team features", "Admin dashboard", "SLA support"],
    button: "Go Power",
    popular: false
  }
];

export function Pricing() {
  return (
    <section className="py-24 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.03),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase border border-white/10 rounded-sm small-caps"
          >
            <Sparkles className="w-3 h-3" /> Professional Plans
          </motion.div>
          <h2 className="text-3xl md:text-6xl font-bold mb-4 tracking-tighter">Simple Credit Pricing.</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-sm md:text-base">
            1 credit = 1 week of enterprise hosting. No hidden charges. 💎
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 rounded-sm border flex flex-col transition-all duration-500 ${
                tier.popular
                  ? "border-white bg-white/[0.05] relative shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/30"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl">
                  Most Popular 👑
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 small-caps">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tighter">₹{tier.price}</span>
                  <span className="text-zinc-500 text-xs font-medium ml-1">/ {tier.credits}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                    <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/auth/register" className="w-full">
                <AnimatedButton
                  variant={tier.popular ? "primary" : "outline"}
                  size="sm"
                  className="w-full text-[10px]"
                >
                  {tier.button}
                </AnimatedButton>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
