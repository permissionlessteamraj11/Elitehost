"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, CreditCard, ArrowRight, Check, Star, Sparkles, QrCode, Copy, Loader2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useState, useEffect } from "react";
import { getPlatformSetting } from "@/app/actions/platform";
import Image from "next/image";
import { useAuthStore } from "@/hooks/use-auth";

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
  const [freePlanEnabled, setFreePlanEnabled] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    getPlatformSetting('free_plan_enabled').then(val => {
        if (val !== null) setFreePlanEnabled(val === true);
    });
  }, []);

  const handlePurchase = (plan: any) => {
    setSelectedPlan(plan);
  };

  const submitPayment = async () => {
    if (!transactionId) return;
    setIsSubmitting(true);
    try {
        const res = await fetch("/api/payments/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                planId: selectedPlan.id,
                amount: (user as any)?.referred_by ? selectedPlan.price * 0.9 : selectedPlan.price,
                transactionId,
                credits: selectedPlan.credits
            }),
        });
        if (res.ok) {
            setShowSuccess(true);
            setTimeout(() => {
                setSelectedPlan(null);
                setShowSuccess(false);
                setTransactionId("");
            }, 3000);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
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
        {creditPlans.filter(p => freePlanEnabled || p.id !== 'basic').map((plan, idx) => (
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
                <div className="space-y-2">
                  {(user as any)?.referred_by && (
                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-center">
                       10% Referral Discount Applied: ₹{Math.floor(plan.price * 0.9)}
                    </div>
                  )}
                  <AnimatedButton
                    className={`w-full gap-2 py-6 text-base ${plan.popular ? 'bg-electric text-void shadow-[0_0_30px_rgba(0,229,255,0.3)]' : 'variant-secondary'}`}
                    loading={loading === plan.id}
                    onClick={() => handlePurchase(plan)}
                  >
                    Purchase Now <ArrowRight className="w-4 h-4" />
                  </AnimatedButton>
                </div>
              </div>

              <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${plan.color} opacity-5 blur-[60px] group-hover:opacity-10 transition-opacity`} />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B0F19] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
               <button onClick={() => setSelectedPlan(null)} className="absolute top-6 right-6 text-text-secondary hover:text-white">
                  <X className="w-6 h-6" />
               </button>

               <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading">Secure Payment</h2>
                    <p className="text-text-secondary text-sm">Scan the QR code to pay <strong>₹{(user as any)?.referred_by ? Math.floor(selectedPlan.price * 0.9) : selectedPlan.price}</strong></p>
                  </div>

                  <div className="relative w-64 h-64 mx-auto rounded-2xl border border-white/10 p-2 bg-white/5 overflow-hidden group">
                     <Image src="/payment.jpg" alt="Payment QR" fill className="object-cover" />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary leading-relaxed">
                       After payment, please enter your <strong>Transaction ID</strong> below. Our team will verify and add credits to your account.
                    </div>

                    <div className="space-y-2 text-left">
                       <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Transaction ID</label>
                       <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="UTR / Transaction Number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 font-mono"
                       />
                    </div>

                    <AnimatedButton
                      className="w-full py-4 text-base gap-2"
                      onClick={submitPayment}
                      loading={isSubmitting}
                      disabled={!transactionId || isSubmitting}
                    >
                       {showSuccess ? <Check className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                       {showSuccess ? "Request Submitted!" : "Submit for Approval"}
                    </AnimatedButton>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
