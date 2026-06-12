"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Cpu, Cloud, Terminal, RefreshCw } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-[#00E5FF]" />,
    title: "Instant Deployments",
    description: "Push to GitHub and your application is live in seconds with our optimized build engine."
  },
  {
    icon: <Shield className="w-6 h-6 text-[#7C3AED]" />,
    title: "Enterprise Security",
    description: "Advanced DDoS protection, SSL certificates, and secure environment variable management."
  },
  {
    icon: <Cpu className="w-6 h-6 text-[#10B981]" />,
    title: "Mumbai Servers",
    description: "Ultra-low latency for users in India and Southeast Asia with our edge datacenter."
  },
  {
    icon: <Cloud className="w-6 h-6 text-[#00E5FF]" />,
    title: "Auto-Scaling",
    description: "Handle traffic spikes effortlessly with our intelligent resource allocation system."
  },
  {
    icon: <Terminal className="w-6 h-6 text-[#7C3AED]" />,
    title: "Advanced CLI",
    description: "Control your entire infrastructure from the terminal with our powerful CLI tool."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-[#10B981]" />,
    title: "Zero Downtime",
    description: "Roll out updates seamlessly with blue-green deployments and instant rollbacks."
  }
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Elite Performance.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to build, scale, and manage your applications with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-sm border border-white/10 bg-white/5 hover:border-[#00E5FF]/50 transition-colors group"
            >
              <div className="mb-4 p-3 rounded-sm bg-white/5 w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
