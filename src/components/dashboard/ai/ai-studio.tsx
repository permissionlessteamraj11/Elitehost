"use client";

import { useState } from "react";
import {
  Sparkles,
  Terminal,
  Rocket,
  Code2,
  FileCode,
  Play,
  ChevronRight,
  Cpu,
  Boxes,
  Zap,
  Globe,
  FolderTree,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";

const frameworks = [
  { id: "nextjs", label: "Next.js", icon: Zap },
  { id: "react", label: "React", icon: Boxes },
  { id: "node", label: "Node.js", icon: Terminal },
  { id: "python", label: "Python", icon: Code2 },
];

const models = [
  { id: "elite-v4", label: "Elite v4 (Fast)", description: "Optimized for UI/UX generation" },
  { id: "elite-ultra", label: "Elite Ultra", description: "Best for complex full-stack logic" },
];

const mockFiles = [
  { name: "package.json", language: "json", content: '{\n  "name": "ai-generated-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "next": "15.1.7",\n    "react": "19.0.0"\n  }\n}' },
  { name: "page.tsx", language: "typescript", content: 'export default function Page() {\n  return (\n    <main className="flex min-h-screen items-center justify-center bg-black text-white">\n      <h1 className="text-4xl font-bold">Hello from AI Studio</h1>\n    </main>\n  );\n}' },
  { name: "globals.css", language: "css", content: 'body {\n  background: #000;\n  color: #fff;\n}' },
];

export function AIStudio() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("nextjs");
  const [selectedModel, setSelectedModel] = useState("elite-v4");
  const [selectedFile, setSelectedFile] = useState(mockFiles[1]);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
      {/* Sidebar / Controls */}
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 h-full" hover={false}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-electric" /> Describe your app
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build a luxury portfolio for a software engineer with glassmorphism and framer motion..."
                className="w-full h-32 bg-void/50 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-electric/30 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> Intelligence Model
              </label>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selectedModel === model.id
                        ? "bg-electric/10 border-electric/30 ring-1 ring-electric/20"
                        : "bg-white/5 border-transparent hover:border-white/10"
                    )}
                  >
                    <div className="font-bold text-sm">{model.label}</div>
                    <div className="text-[10px] text-text-secondary">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5" /> Framework
              </label>
              <div className="grid grid-cols-2 gap-2">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                      selectedFramework === fw.id
                        ? "bg-electric/10 border-electric/30"
                        : "bg-white/5 border-transparent hover:border-white/10"
                    )}
                  >
                    <fw.icon className="w-4 h-4 text-electric" />
                    {fw.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatedButton
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full h-14 text-base font-bold gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-void border-t-transparent rounded-full animate-spin" />
                  Generating Elite Code...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Project
                </>
              )}
            </AnimatedButton>
          </div>
        </GlassCard>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <GlassCard className="flex-1 flex flex-col overflow-hidden" hover={false}>
          {/* Workspace Content */}
          <div className="flex-1 min-h-[600px] flex">
            {/* File Tree Sidebar */}
            <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <FolderTree className="w-3 h-3" /> Project Explorer
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {mockFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => { setSelectedFile(file); setShowPreview(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      selectedFile.name === file.name && !showPreview
                        ? "bg-electric/10 text-electric"
                        : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    <FileCode className="w-4 h-4" />
                    {file.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Tabs / Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                   <FileText className="w-4 h-4 text-electric" />
                   <span className="text-sm font-bold">{selectedFile.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      showPreview
                        ? "bg-electric/20 border-electric/30 text-electric"
                        : "bg-white/5 border-transparent text-text-secondary hover:text-white"
                    )}
                  >
                    {showPreview ? "Show Code" : "Live Preview"}
                  </button>
                  <AnimatedButton size="sm" className="gap-2">
                    <Rocket className="w-4 h-4" /> Deploy
                  </AnimatedButton>
                </div>
              </div>

              <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                  {showPreview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#000] flex items-center justify-center p-8 text-center"
                    >
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-electric/10 flex items-center justify-center mx-auto border border-electric/20">
                          <Globe className="w-8 h-8 text-electric" />
                        </div>
                        <h3 className="text-xl font-bold font-space-grotesk text-white">Live Preview Ready</h3>
                        <p className="text-text-secondary max-w-xs mx-auto">
                          Your {selectedFramework} app has been generated and is ready for the world.
                        </p>
                        <AnimatedButton variant="outline" className="gap-2">
                          <Play className="w-4 h-4" /> Run Environment
                        </AnimatedButton>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <Editor
                        height="100%"
                        defaultLanguage={selectedFile.language}
                        theme="vs-dark"
                        value={selectedFile.content}
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          padding: { top: 20 },
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Console / Output logs */}
        <GlassCard className="h-40 p-4 font-mono text-xs overflow-y-auto bg-black/60" hover={false}>
          <div className="flex items-center gap-2 mb-2 text-text-secondary uppercase tracking-tighter text-[10px]">
            <Terminal className="w-3 h-3" /> Console Output
          </div>
          <div className="space-y-1 text-white/40">
            <div>[AI] Analyzing architecture...</div>
            <div>[AI] Drafting components...</div>
            <div className="text-electric">[AI] Successfully generated elite-v4 code structure.</div>
            <div>[System] Waiting for user deployment...</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
