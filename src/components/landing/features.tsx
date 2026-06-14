"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    icon: "/icons/premium/deploy.svg",
    title: "Instant Deploy",
    description: "Push to GitHub and your Telegram bot is live in seconds with our optimized Mumbai build engine."
  },
  {
    icon: "/icons/premium/security.svg",
    title: "Enterprise Shield",
    description: "Military-grade encryption for your bot tokens and advanced DDoS protection on all Mumbai nodes."
  },
  {
    icon: "/icons/premium/mumbai.svg",
    title: "Mumbai Premium",
    description: "Ultra-low latency sub-5ms routing for Indian users, ensuring your bots respond instantly."
  },
  {
    icon: "/icons/premium/mobile.svg",
    title: "Mobile First",
    description: "Fully optimized dashboard for managing your deployments on the go from any device."
  },
  {
    icon: "/icons/premium/database.svg",
    title: "Persistent Storage",
    description: "High-performance NVMe storage for your bot databases with automated daily backups."
  },
  {
    icon: "/icons/premium/uptime.svg",
    title: "Zero Downtime",
    description: "Roll out updates seamlessly with blue-green deployments and instant rollbacks."
  }
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-black">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest text-zinc-500 uppercase border border-white/10 rounded-sm small-caps"
          >
            Core Capabilities 💎
          </motion.div>
          <h2 className="text-3xl md:text-6xl font-bold mb-4 tracking-tighter">Elite Performance.</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Everything you need to build, scale, and manage your applications
            with confidence on our premium infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.05)' }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="p-8 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Image src={feature.icon} alt="" width={80} height={80} className="select-none" />
              </div>

              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-sm bg-white/5 border border-white/10 group-hover:border-white/30 transition-colors">
                <Image src={feature.icon} alt={feature.title} width={24} height={24} className="" />
              </div>

              <h3 className="text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
