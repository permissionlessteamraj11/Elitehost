"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Zap, Shield, CreditCard, ArrowRight, Check, Star, Sparkles, QrCode, Copy, Loader2, X, User, Phone, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useState, useEffect } from "react";
import { getPlatformSetting } from "@/app/actions/platform";
import { useAuthStore } from "@/hooks/use-auth";

const creditPlans = [
  {
    id: "basic",
    name: "Starter Spark",
    credits: 5,
    price: 99,
    description: "Perfect for testing small projects.",
    features: ["5 Deployment Credits", "Community Support", "Standard Nodes"],
    color: "from-zinc-500 to-zinc-400",
  },
  {
    id: "pro",
    name: "Elite Power",
    credits: 10,
    price: 199,
    description: "Most popular for growing apps.",
    features: ["10 Deployment Credits", "Priority Support", "High-Performance Nodes", "Advanced Analytics"],
    popular: true,
    color: "from-zinc-300 to-zinc-100",
  },
  {
    id: "enterprise",
    name: "Ultimate Surge",
    credits: 25,
    price: 399,
    description: "For elite developers shipping fast.",
    features: ["25 Deployment Credits", "24/7 Dedicated Support", "Custom Node Regions", "Early Access Features"],
    color: "from-zinc-400 to-zinc-200",
  },
];

export default function CreditsPage() {
  const [freePlanEnabled, setFreePlanEnabled] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [purchaseStep, setPurchaseStep] = useState(1);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
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
    setPurchaseStep(1);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setSelectedPlan(null);
    setPurchaseStep(1);
    setCustomerName("");
    setCustomerContact("");
    setTransactionId("");
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
                credits: selectedPlan.credits,
                customerName,
                customerContact
            }),
        });
        if (res.ok) {
            setShowSuccess(true);
            setTimeout(() => {
                closeModal();
                setShowSuccess(false);
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
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest"
        >
          <Zap className="w-3 h-3 fill-current" />
          Power up your deployments ⚡
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Deployment Credits</h1>
        <p className="text-zinc-500 text-sm">
          Scale your infrastructure with ease. 1 credit = 1 month of hosting. Premium performance guaranteed. 💎
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
              className={`p-8 h-full flex flex-col relative overflow-hidden group ${plan.popular ? 'border-white/40 ring-1 ring-white/10' : ''}`}
              glow={plan.popular}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-sm flex items-center gap-1 shadow-lg small-caps">
                    <Star className="w-3 h-3 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-xl font-bold mb-1 tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tighter">₹{plan.price}</span>
                  <span className="text-zinc-500 text-xs ml-1">/ {plan.credits} credits</span>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-sm bg-white/5 flex items-center justify-center border border-white/10">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="space-y-2">
                  {(user as any)?.referred_by && (
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">
                       10% Referral Discount: ₹{Math.floor(plan.price * 0.9)}
                    </div>
                  )}
                  <AnimatedButton
                    className={`w-full gap-2 py-4 text-xs ${plan.popular ? 'bg-white text-black' : 'variant-secondary'}`}
                    onClick={() => handlePurchase(plan)}
                  >
                    Purchase Now <ArrowRight className="w-3.5 h-3.5" />
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
              onClick={closeModal}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-black border border-white/10 rounded-sm p-8 shadow-2xl overflow-hidden"
            >
               <button onClick={closeModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>

               <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 mb-2">
                       {[1, 2, 3].map((step) => (
                         <div key={step} className={`h-1 w-8 rounded-full transition-colors ${purchaseStep >= step ? 'bg-white' : 'bg-white/10'}`} />
                       ))}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                      {purchaseStep === 1 && "Confirm Details"}
                      {purchaseStep === 2 && "Scan & Pay"}
                      {purchaseStep === 3 && "Verification"}
                    </h2>
                    <p className="text-zinc-500 text-xs">Step {purchaseStep} of 3</p>
                  </div>

                  {purchaseStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter your name"
                              className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">WhatsApp / Phone</label>
                         <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={customerContact}
                              onChange={(e) => setCustomerContact(e.target.value)}
                              placeholder="Enter contact details"
                              className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                         </div>
                      </div>
                      <AnimatedButton
                        className="w-full py-4 text-xs gap-2 mt-4"
                        onClick={() => setPurchaseStep(2)}
                        disabled={!customerName || !customerContact}
                      >
                         Next Step <ArrowRight className="w-3.5 h-3.5" />
                      </AnimatedButton>
                    </motion.div>
                  )}

                  {purchaseStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="relative w-56 h-56 mx-auto rounded-sm border border-white/10 p-2 bg-white overflow-hidden group">
                         <Image src="/payment.jpg" alt="Payment QR" fill className="object-contain" />
                      </div>
                      <div className="space-y-2">
                         <p className="text-xs text-zinc-400">Total Amount to Pay</p>
                         <div className="text-3xl font-bold tracking-tighter">₹{(user as any)?.referred_by ? Math.floor(selectedPlan.price * 0.9) : selectedPlan.price}</div>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={() => setPurchaseStep(1)} className="flex-1 py-3 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                            <ArrowLeft className="w-3 h-3" /> Back
                         </button>
                         <AnimatedButton
                           className="flex-[2] py-3 text-xs gap-2"
                           onClick={() => setPurchaseStep(3)}
                         >
                            I have paid <ArrowRight className="w-3.5 h-3.5" />
                         </AnimatedButton>
                      </div>
                    </motion.div>
                  )}

                  {purchaseStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6 text-left"
                    >
                      <div className="p-4 rounded-sm bg-white/5 border border-white/10 text-[10px] text-zinc-400 leading-relaxed uppercase tracking-wider font-bold">
                         Please enter your 12-digit UTR or Transaction ID below for verification. 🛡️
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Transaction ID</label>
                         <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="UTR / Transaction Number"
                          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/30 font-mono"
                         />
                      </div>

                      <div className="flex gap-3">
                         <button onClick={() => setPurchaseStep(2)} className="flex-1 py-3 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                            <ArrowLeft className="w-3 h-3" /> Back
                         </button>
                         <AnimatedButton
                           className="flex-[2] py-4 text-xs gap-2"
                           onClick={submitPayment}
                           loading={isSubmitting}
                           disabled={!transactionId || isSubmitting}
                         >
                            {showSuccess ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {showSuccess ? "Submitted!" : "Verify Payment"}
                         </AnimatedButton>
                      </div>
                    </motion.div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
