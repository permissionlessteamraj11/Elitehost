"use client";

import { motion } from "framer-motion";
import { Zap, Shield, CreditCard, ArrowRight, Check, Star, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useState } from "react";

const creditPlans = [
  {
    id: "basic",
    name: "Starter Spark",
    credits: 5,
    price: 99,
    description: "Perfect for testing small projects.",
    features: ["5 Deployment Credits", "Community Support", "Standard Nodes"],
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "pro",
    name: "Elite Power",
    credits: 10,
    price: 199,
    description: "Most popular for growing apps.",
    features: ["10 Deployment Credits", "Priority Support", "High-Performance Nodes", "Advanced Analytics"],
    popular: true,
    color: "from-indigo-600 to-purple-500",
  },
  {
    id: "enterprise",
    name: "Ultimate Surge",
    credits: 25,
    price: 399,
    description: "For elite developers shipping fast.",
    features: ["25 Deployment Credits", "24/7 Dedicated Support", "Custom Node Regions", "Early Access Features"],
    color: "from-amber-500 to-orange-400",
  },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = (planId: string) => {
    setLoading(planId);
    setTimeout(() => setLoading(null), 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/20 text-electric text-[10px] font-bold uppercase tracking-widest"
        >
          <Zap className="w-3 h-3 fill-current" />
          Power up your deployments
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Deployment Credits</h1>
        <p className="text-white/40">
          Scale your infrastructure with ease. Credits are spent based on deployment type: 1 for ZIP/File, 2 for GitHub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {creditPlans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard
              className={`p-8 h-full flex flex-col relative overflow-hidden group ${plan.popular ? 'border-electric/30 ring-1 ring-electric/20' : ''}`}
              glow={plan.popular}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="bg-electric text-void text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-white/40">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-white/40 text-sm">/ {plan.credits} credits</span>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-electric/10 flex items-center justify-center border border-electric/20">
                        <Check className="w-3 h-3 text-electric" />
                      </div>
                      <span className="text-sm text-white/60">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <AnimatedButton
                  className={`w-full gap-2 py-6 text-base ${plan.popular ? 'bg-electric text-void shadow-[0_0_30px_rgba(0,229,255,0.3)]' : 'variant-secondary'}`}
                  loading={loading === plan.id}
                  onClick={() => handlePurchase(plan.id)}
                >
                  Purchase Now <ArrowRight className="w-4 h-4" />
                </AnimatedButton>
              </div>

              <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${plan.color} opacity-5 blur-[60px] group-hover:opacity-10 transition-opacity`} />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
