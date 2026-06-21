"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github, MessageCircle } from "lucide-react";

const footerLinks = {
  features: [
    { label: "Elite CLI", href: "#" },
    { label: "AI Studio", href: "/dashboard/ai-studio" },
    { label: "Autoscaling", href: "#" },
    { label: "Private Network", href: "#" },
    { label: "Persistent Disks", href: "#" },
    { label: "Docker support", href: "#" },
  ],
  services: [
    { label: "Static Sites", href: "#" },
    { label: "Web Services", href: "#" },
    { label: "Background Workers", href: "#" },
    { label: "Cron Jobs", href: "#" },
    { label: "Managed DB", href: "#" },
  ],
  resources: [
    { label: "Pricing", href: "/#pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "#" },
    { label: "Blog", href: "/blog" },
    { label: "Support", href: "/dashboard/support" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Brand Kit", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
    { label: "DMCA Policy", href: "/dmca" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-20">
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 small-caps">Features</h4>
            <ul className="space-y-4">
              {footerLinks.features.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 small-caps">Services</h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 small-caps">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 small-caps">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 small-caps">Socials</h4>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Github className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 grayscale">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">© 2025 EliteHosting India.</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
            Elite Performance. Mumbai Edge Nodes. 🇮🇳
          </div>
        </div>
      </div>
    </footer>
  );
}
