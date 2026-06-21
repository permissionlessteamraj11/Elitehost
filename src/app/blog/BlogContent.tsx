"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, User, ArrowRight, Search, Tag } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import Image from "next/image";

export default function BlogContent({ blogPosts }: { blogPosts: any[] }) {
  return (
    <div className="min-h-screen bg-[#020108] text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/20 text-electric text-[10px] font-bold uppercase tracking-widest"
          >
            <BookOpen className="w-3 h-3" />
            Elite Insights
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">The Elite Blog</h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            Technical guides, product updates, and industry insights from the team behind the fastest cloud platform in India.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 pb-32">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-electric/50 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Announcements", "Tutorials", "Features", "Engineering"].map((cat) => (
              <button key={cat} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium hover:bg-white/10 transition-all whitespace-nowrap">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, idx) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <GlassCard className="h-full flex flex-col group overflow-hidden" glow>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-void/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-electric">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div className="flex items-center gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                       <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</div>
                       <div className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</div>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-electric transition-colors">{post.title}</h3>
                    <p className="text-sm text-white/40 line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="pt-4 flex items-center text-electric text-xs font-bold uppercase tracking-widest gap-2">
                      Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
