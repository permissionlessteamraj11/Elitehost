"use client";

import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Share2, Tag, MessageSquare, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import { blogPosts } from "@/lib/blog-data";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const post = blogPosts.find(p => p.slug === slug) || blogPosts[1];

  return (
    <div className="min-h-screen bg-[#020108] text-white pb-32">
      {/* Header Image */}
      <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020108] via-transparent to-transparent" />
        <div className="absolute top-8 left-8">
           <Link href="/blog">
              <button className="p-3 bg-void/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
           </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <GlassCard className="p-8 md:p-12 space-y-8" hover={false}>
            <div className="space-y-6">
               <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-electric">
                 <span className="px-3 py-1 bg-electric/10 border border-electric/20 rounded-full">{post.category}</span>
                 <div className="flex items-center gap-1 text-white/40"><Calendar className="w-3 h-3" /> {post.date}</div>
                 <div className="flex items-center gap-1 text-white/40"><Clock className="w-3 h-3" /> 8 min read</div>
               </div>
               <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                 {post.title}
               </h1>
               <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric to-purple-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-void flex items-center justify-center font-bold text-sm">
                      {post.author[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{post.author}</div>
                    <div className="text-xs text-white/40">Expert Contributor, EliteHosting</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>

            <div
              className="prose prose-invert prose-electric max-w-none
              prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-white/60 prose-p:leading-relaxed prose-p:mb-6
              prose-blockquote:border-l-4 prose-blockquote:border-electric prose-blockquote:bg-electric/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
              prose-code:bg-white/5 prose-code:p-1 prose-code:rounded prose-code:text-electric
              prose-pre:bg-void prose-pre:border prose-pre:border-white/10 prose-pre:p-6 prose-pre:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="pt-12 border-t border-white/5 flex flex-wrap gap-3">
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                 <Tag className="w-3 h-3" /> Tags:
               </span>
               {["Performance", "Cloud", "India"].map(tag => (
                 <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/60 hover:text-white transition-colors cursor-pointer">#{tag}</span>
               ))}
            </div>
          </GlassCard>

          {/* Engagement Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-8 space-y-4" hover={false}>
               <h3 className="text-xl font-bold">Enjoyed this article?</h3>
               <p className="text-sm text-white/40">Join 5,000+ elite developers receiving our weekly technical newsletter.</p>
               <div className="flex gap-2">
                 <input type="email" placeholder="email@example.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric/50" />
                 <AnimatedButton size="sm">Subscribe</AnimatedButton>
               </div>
            </GlassCard>
            <GlassCard className="p-8 space-y-4" hover={false}>
               <h3 className="text-xl font-bold">Have questions?</h3>
               <p className="text-sm text-white/40">Join the discussion on our community discord or start a live chat.</p>
               <div className="flex gap-3">
                  <AnimatedButton variant="outline" className="flex-1 gap-2"><MessageSquare className="w-4 h-4" /> Discord</AnimatedButton>
                  <AnimatedButton variant="secondary" className="flex-1">Live Chat</AnimatedButton>
               </div>
            </GlassCard>
          </div>
        </div>
      </article>
    </div>
  );
}
