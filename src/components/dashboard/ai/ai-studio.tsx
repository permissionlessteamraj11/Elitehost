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
  FileText,
  AlertCircle,
  CheckCircle2,
  Database,
  Server,
  Layout,
  Maximize2,
  Minimize2,
  Search,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
import { generateCode, diagnoseCode } from "@/app/actions/ai-generate";

const frameworks = [
  { id: "nextjs", label: "Next.js", icon: Zap },
  { id: "react", label: "React", icon: Boxes },
  { id: "node", label: "Node.js", icon: Terminal },
  { id: "python", label: "Python", icon: Code2 },
];

const quickTemplates = [
  { label: "SaaS Dashboard", prompt: "Modern SaaS dashboard with Next.js 15, Tailwind CSS, and Lucide icons. Include stats cards and a responsive sidebar." },
  { label: "AI Chatbot", prompt: "AI Chatbot interface with real-time messaging, streaming text effects, and a dark monochromatic theme." },
  { label: "Portfolio", prompt: "Minimalist developer portfolio with smooth Framer Motion transitions, project grid, and contact form." },
];

const models = [
  { id: "elite-v4", label: "Elite v4 (Fast)", description: "Optimized for UI/UX generation", icon: Zap },
  { id: "elite-ultra", label: "Elite Ultra", description: "Best for complex full-stack logic", icon: Cpu },
  { id: "architect-v1", label: "Architect Master", description: "Senior Architect + DevOps Persona", icon: Server },
];

export function AIStudio() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("nextjs");
  const [selectedModel, setSelectedModel] = useState("elite-v4");
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>(["[System] AI Studio Initialized. Waiting for prompt..."]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-49), msg]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    addLog(`[AI] Initializing production pipeline for: ${selectedFramework.toUpperCase()}`);
    addLog(`[AI] Loading intelligence model: ${selectedModel.toUpperCase()}`);
    try {
      const generatedFiles = await generateCode(prompt, selectedFramework, selectedModel);
      setFiles(generatedFiles);
      setSelectedFile(generatedFiles[0]);
      addLog(`[AI] Generation successful. ${generatedFiles.length} files created.`);
      addLog("[AI] Code structure verified for production standards.");
    } catch (error) {
      addLog("[Error] Generation failed. Check system status.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;
    setIsDiagnosing(true);
    addLog(`[AI] Analyzing ${selectedFile.name} for architectural integrity...`);
    try {
      const result = await diagnoseCode(selectedFile.content, selectedFile.name);
      setDiagnosis(result);
      addLog(`[AI] Audit complete. Status: ${result.status.toUpperCase()}`);
    } catch (error) {
      addLog("[Error] Diagnosis pipeline interrupted.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleFileChange = (val: string | undefined) => {
    if (!selectedFile) return;
    const newFiles = [...files];
    const idx = newFiles.findIndex(f => f.name === selectedFile.name);
    if (idx !== -1) {
      newFiles[idx].content = val || "";
      setFiles(newFiles);
    }
  };

  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-all duration-500",
      isFullscreen ? "fixed inset-0 z-[100] bg-black p-6 h-screen" : "h-full"
    )}>
      {/* Sidebar / Controls */}
      <div className={cn("lg:col-span-4 space-y-6", isFullscreen && "hidden lg:block")}>
        <GlassCard className="p-6 h-full border-white/5" hover={false} glow={true}>
          <div className="space-y-6 flex flex-col h-full">
            <div className="space-y-3 flex-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" /> Project Objective
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe project requirements (e.g. 'Highly advanced Ecommerce with framer-motion and zustand')..."
                className="w-full h-48 bg-white/[0.07] border border-white/10 rounded-sm p-4 text-xs focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all placeholder:text-zinc-700 font-mono resize-none"
              />

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Quick Start Templates</label>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setPrompt(t.prompt)}
                      className="px-2 py-1 rounded-sm bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-[9px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-tighter"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Engine Select
              </label>
              <div className="grid grid-cols-1 gap-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-sm border transition-all text-left",
                      selectedModel === model.id
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/5 hover:border-white/10 text-zinc-400"
                    )}
                  >
                    <model.icon className={cn("w-4 h-4", selectedModel === model.id ? "text-black" : "text-white")} />
                    <div>
                        <div className="font-bold text-[10px] uppercase tracking-widest">{model.label}</div>
                        <div className={cn("text-[8px] opacity-70", selectedModel === model.id ? "text-black" : "text-zinc-500")}>{model.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layout className="w-3 h-3" /> Framework
              </label>
              <div className="grid grid-cols-2 gap-2">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-sm border text-[10px] font-bold uppercase tracking-widest transition-all",
                      selectedFramework === fw.id
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/5 hover:border-white/10 text-zinc-400"
                    )}
                  >
                    <fw.icon className={cn("w-3.5 h-3.5", selectedFramework === fw.id ? "text-black" : "text-white")} />
                    {fw.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatedButton
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full h-12 text-xs font-bold gap-3 border-white animate-glow-pulse"
            >
              {isGenerating ? "Synthesizing..." : "Initialize Generation"}
            </AnimatedButton>
          </div>
        </GlassCard>
      </div>

      {/* Main Workspace */}
      <div className={cn("lg:col-span-8 flex flex-col gap-6", isFullscreen && "lg:col-span-12")}>
        <GlassCard className="flex-1 flex flex-col overflow-hidden border-white/5" hover={false} glow={true}>
          {/* Workspace Content */}
          <div className="flex-1 flex flex-col md:flex-row">
            {/* File Tree Sidebar */}
            <div className="w-full md:w-56 border-r border-white/10 bg-black/40 flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FolderTree className="w-3 h-3" /> Explorer
                </span>
                <Search className="w-3 h-3 text-zinc-700" />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {files.length > 0 ? (
                  files.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => { setSelectedFile(file); setShowPreview(false); setDiagnosis(null); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-sm text-[11px] transition-all",
                        selectedFile?.name === file.name && !showPreview
                          ? "bg-white text-black font-bold"
                          : "text-zinc-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <FileCode className={cn("w-3.5 h-3.5", selectedFile?.name === file.name && !showPreview ? "text-black" : "text-zinc-600")} />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-[10px] text-zinc-700 italic text-center uppercase tracking-widest mt-10">Idle...</div>
                )}
              </div>
              <div className="p-3 border-t border-white/10 flex justify-between items-center bg-black/60">
                 <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-zinc-600" />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">PostgreSQL</span>
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-[#050505]">
              {/* Tabs / Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                      <FileText className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {selectedFile?.name || "System_Root"}
                      </span>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDiagnose}
                    disabled={!selectedFile || isDiagnosing}
                    className="p-2 rounded-sm bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                    title="Audit Code"
                  >
                    <AlertCircle className={cn("w-3.5 h-3.5", isDiagnosing && "animate-spin text-white")} />
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                      "px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all border",
                      showPreview
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
                    )}
                  >
                    {showPreview ? "Code" : "Run"}
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-sm bg-white/5 text-zinc-500 hover:text-white"
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <AnimatedButton size="sm" className="h-7 px-3 text-[9px] gap-2" disabled={files.length === 0}>
                    <Rocket className="w-3 h-3" /> Deploy
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
                      className="absolute inset-0 bg-[#000] flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center p-8 text-center border border-white/5 m-4 rounded-sm">
                        <div className="space-y-6">
                          <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold font-heading text-white uppercase tracking-tighter">Instance Ready</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto text-[10px] uppercase tracking-widest leading-relaxed">
                              Environment synthesized. Live endpoint active on Mumbai node cluster.
                            </p>
                          </div>
                          <AnimatedButton variant="outline" size="sm" className="gap-2 mx-auto">
                            <Play className="w-3 h-3" /> Launch Instance
                          </AnimatedButton>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full relative"
                    >
                      {selectedFile ? (
                        <Editor
                          height="100%"
                          defaultLanguage={selectedFile.language}
                          theme="vs-dark"
                          value={selectedFile.content}
                          onChange={handleFileChange}
                          options={{
                            fontSize: 12,
                            minimap: { enabled: false },
                            padding: { top: 16 },
                            fontFamily: 'JetBrains Mono, monospace',
                            scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                            lineNumbersMinChars: 3,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-900 font-heading text-6xl font-black uppercase tracking-[0.3em] select-none text-center leading-none">
                          ELITE<br/>STUDIO
                        </div>
                      )}

                      {/* Diagnosis Overlay */}
                      <AnimatePresence>
                        {diagnosis && (
                          <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="absolute top-4 right-4 max-w-xs z-50"
                          >
                            <GlassCard className={cn(
                              "p-4 border-l-2",
                              diagnosis.status === 'clean' ? "border-white bg-black" : "border-zinc-500 bg-black"
                            )} hover={false}>
                              <div className="flex items-start gap-3">
                                {diagnosis.status === 'clean' ? <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-white">{diagnosis.message}</div>
                                  {diagnosis.details && (
                                    <ul className="mt-2 space-y-1">
                                      {diagnosis.details.map((d: string, i: number) => (
                                        <li key={i} className="text-[9px] text-zinc-500 flex items-center gap-1.5 font-bold uppercase">
                                          <div className="w-1 h-1 rounded-sm bg-zinc-500" /> {d}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <button onClick={() => setDiagnosis(null)} className="mt-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Dismiss</button>
                                </div>
                              </div>
                            </GlassCard>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Console / Output logs */}
        <GlassCard className="h-44 p-0 font-mono text-[10px] overflow-hidden bg-black/80 border-white/5" hover={false}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest font-bold">
              <Terminal className="w-3 h-3" /> System Logs
            </div>
            <button className="text-zinc-700 hover:text-white transition-colors"><Download className="w-3 h-3" /></button>
          </div>
          <div className="p-4 space-y-1 overflow-y-auto h-[calc(11rem-2.5rem)] no-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className={cn(
                "flex gap-3",
                log.startsWith('[Error]') ? "text-red-900" :
                log.startsWith('[AI]') ? "text-zinc-400" : "text-zinc-600"
              )}>
                <span className="opacity-30">[{new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                <span className="font-bold">{log}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
