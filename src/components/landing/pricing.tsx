"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "99",
    credits: "5 credits",
    features: ["5 weeks of 1 app", "All frameworks", "Real-time logs", "Free SSL"],
    button: "Get Started",
    popular: false
  },
  {
    name: "Developer",
    price: "179",
    credits: "10 credits",
    features: ["10 weeks of 1 app", "Custom domain", "AI assistance", "Priority support"],
    button: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "399",
    credits: "25 credits",
    features: ["25 weeks of 1 app", "Multiple apps", "Full AI credits", "Telegram bot"],
    button: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Power",
    price: "699",
    credits: "50 credits",
    features: ["50 weeks of 1 app", "Team features", "Admin dashboard", "SLA support"],
    button: "Go Power",
    popular: false
  }
];

export function Pricing() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Credit Pricing.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            1 credit = 1 week of enterprise hosting. No hidden charges.
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
              className={`p-8 rounded-sm border ${
                tier.popular ? "border-[#00E5FF] bg-[#00E5FF]/5 relative" : "border-white/10 bg-white/5"
              }`}
            >
              {tier.popular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00E5FF] text-black text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">₹{tier.price}</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">{tier.credits}</p>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-[#00E5FF]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className={`block w-full py-3 rounded-sm text-center font-bold transition-all ${
                  tier.popular
                    ? "bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {tier.button}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
