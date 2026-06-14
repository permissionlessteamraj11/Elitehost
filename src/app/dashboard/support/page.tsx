"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, User, Bot, HelpCircle, ArrowLeft, Loader2, Maximize2, Minimize2, ShieldCheck, Mail, Phone } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";
import { sendMessage, getMessages } from "@/app/actions/chat";
import Link from "next/link";

export default function SupportPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const res = await getMessages();
    if (res.success) {
      setMessages(res.messages || []);
    }
    setFetching(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    const content = newMessage.trim();
    setNewMessage("");

    const res = await sendMessage(content);
    if (res.success) {
      fetchMessages();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading small-caps">Elite Support Center</h1>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Real-time assistance & Technical Help</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Support Online
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Main Chat Area */}
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden" hover={false} glow>
          <div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <div className="font-bold text-sm">Official Support Chat</div>
                   <div className="text-[10px] text-text-secondary uppercase tracking-tighter">Response time: <span className="text-white">~15 mins</span></div>
                </div>
             </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-void/20"
          >
            {fetching ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 opacity-40">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Bot className="w-8 h-8" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-bold text-sm">How can we help today?</p>
                    <p className="text-xs">Send a message about your deployment, billing, or any technical issue.</p>
                 </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3 max-w-[85%] sm:max-w-[70%]",
                  msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold uppercase",
                    msg.sender === 'user' ? "bg-primary text-void" : "bg-white/10 text-white"
                  )}>
                    {msg.sender === 'user' ? user?.username?.[0] : 'EH'}
                  </div>
                  <div className="space-y-1">
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.sender === 'user'
                        ? "bg-primary text-void font-medium rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-white rounded-tl-none shadow-xl"
                    )}>
                      {msg.content}
                    </div>
                    <div className={cn(
                      "text-[9px] text-text-secondary font-mono px-1",
                      msg.sender === 'user' ? "text-right" : "text-left"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white/2 border-t border-white/5 flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Describe your issue..."
              className="flex-1 bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-600"
            />
            <AnimatedButton type="submit" size="sm" loading={loading} disabled={!newMessage.trim()} className="px-6 gap-2">
              <Send className="w-4 h-4" /> <span className="hidden sm:inline">Send</span>
            </AnimatedButton>
          </form>
        </GlassCard>

        {/* Info Sidebar */}
        <div className="w-full lg:w-80 space-y-4 flex flex-col">
           <GlassCard className="p-6 space-y-4" hover={false}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">System Info</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Ticket ID</span>
                    <span className="font-mono text-primary">#EH-{user?.id?.substring(0,8).toUpperCase()}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Status</span>
                    <span className="text-emerald-500 font-bold uppercase tracking-tighter">Priority</span>
                 </div>
              </div>
           </GlassCard>

           <GlassCard className="p-6 space-y-4" hover={false}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Emergency Contacts</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                       <Mail className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div>
                       <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Email</div>
                       <div className="text-xs font-bold text-white">zynochat.in@zynochat.in</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                       <Phone className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div>
                       <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Mobile</div>
                       <div className="text-xs font-bold text-white">9931989952</div>
                    </div>
                 </div>
              </div>
           </GlassCard>

           <div className="flex-1 p-6 rounded-sm border border-white/5 bg-primary/5 flex flex-col items-center justify-center text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-primary opacity-20" />
              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-relaxed">
                Elite Shield Protection Enabled<br/>Safe & Encrypted Communication
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
