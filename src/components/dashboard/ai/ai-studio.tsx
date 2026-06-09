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
  CheckCircle2
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

const models = [
  { id: "elite-v4", label: "Elite v4 (Fast)", description: "Optimized for UI/UX generation" },
  { id: "elite-ultra", label: "Elite Ultra", description: "Best for complex full-stack logic" },
  { id: "architect-v1", label: "Architect Master", description: "Senior Architect + DevOps Persona" },
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

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    addLog(`[AI] Starting generation for: ${prompt.substring(0, 30)}...`);
    try {
      const generatedFiles = await generateCode(prompt, selectedFramework);
      setFiles(generatedFiles);
      setSelectedFile(generatedFiles[0]);
      addLog("[AI] Successfully generated elite code structure.");
    } catch (error) {
      addLog("[Error] Failed to generate code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;
    setIsDiagnosing(true);
    addLog(`[AI] Analyzing ${selectedFile.name} for errors...`);
    try {
      const result = await diagnoseCode(selectedFile.content);
      setDiagnosis(result);
      addLog(`[AI] Diagnosis complete: ${result.status === 'clean' ? 'Code is perfect' : 'Issues found'}`);
    } catch (error) {
      addLog("[Error] Diagnosis failed.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDeploy = () => {
    addLog("[System] Initiating deployment to Mumbai Edge Node...");
    // Link to deployment logic
    setTimeout(() => {
      addLog("[System] Build queued (ID: build_82k2m)");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
      {/* Sidebar / Controls */}
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 h-full" hover={false}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> System Objective
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the complete project architecture and requirements..."
                className="w-full h-40 bg-void/50 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-white/10 font-mono"
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
                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
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
                        ? "bg-primary/10 border-primary/30"
                        : "bg-white/5 border-transparent hover:border-white/10"
                    )}
                  >
                    <fw.icon className="w-4 h-4 text-primary" />
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
          <div className="flex-1 min-h-[500px] flex flex-col md:flex-row">
            {/* File Tree Sidebar */}
            <div className="w-full md:w-64 border-r border-white/5 bg-black/20 flex flex-col">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <FolderTree className="w-3 h-3" /> Project Explorer
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {files.length > 0 ? (
                  files.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => { setSelectedFile(file); setShowPreview(false); setDiagnosis(null); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                        selectedFile?.name === file.name && !showPreview
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:text-white hover:bg-white/5"
                      )}
                    >
                      <FileCode className="w-4 h-4" />
                      {file.name}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-xs text-text-secondary italic">No files generated yet.</div>
                )}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Tabs / Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5 gap-3">
                <div className="flex items-center gap-2">
                   <FileText className="w-4 h-4 text-primary" />
                   <span className="text-sm font-bold">{selectedFile?.name || "No file selected"}</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  <button
                    onClick={handleDiagnose}
                    disabled={!selectedFile || isDiagnosing}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-text-secondary hover:text-white transition-all whitespace-nowrap"
                  >
                    {isDiagnosing ? <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    Detect Errors
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap",
                      showPreview
                        ? "bg-primary/20 border-primary/30 text-primary"
                        : "bg-white/5 border-transparent text-text-secondary hover:text-white"
                    )}
                  >
                    {showPreview ? "Show Code" : "Live Preview"}
                  </button>
                  <AnimatedButton size="sm" className="gap-2 whitespace-nowrap" onClick={handleDeploy} disabled={files.length === 0}>
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
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                          <Globe className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-white">Live Preview Ready</h3>
                        <p className="text-text-secondary max-w-xs mx-auto text-sm">
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
                      className="h-full relative"
                    >
                      {selectedFile ? (
                        <Editor
                          height="100%"
                          defaultLanguage={selectedFile.language}
                          theme="vs-dark"
                          value={selectedFile.content}
                          onChange={(val) => {
                             const newFiles = [...files];
                             const idx = newFiles.findIndex(f => f.name === selectedFile.name);
                             newFiles[idx].content = val || "";
                             setFiles(newFiles);
                          }}
                          options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            padding: { top: 20 },
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-text-secondary/20 font-heading text-4xl uppercase tracking-[0.2em] select-none">
                          Elite Workspace
                        </div>
                      )}

                      {/* Diagnosis Overlay */}
                      <AnimatePresence>
                        {diagnosis && (
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute bottom-6 right-6 max-w-sm"
                          >
                            <GlassCard className={cn(
                              "p-4 border-l-4",
                              diagnosis.status === 'clean' ? "border-green-500 bg-green-500/10" : "border-yellow-500 bg-yellow-500/10"
                            )}>
                              <div className="flex items-start gap-3">
                                {diagnosis.status === 'clean' ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                                <div>
                                  <div className="text-sm font-bold">{diagnosis.message}</div>
                                  {diagnosis.details && (
                                    <ul className="mt-2 space-y-1">
                                      {diagnosis.details.map((d: string, i: number) => (
                                        <li key={i} className="text-xs text-text-secondary flex items-center gap-1.5">
                                          <div className="w-1 h-1 rounded-full bg-yellow-500" /> {d}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <button onClick={() => setDiagnosis(null)} className="mt-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-white">Dismiss</button>
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
        <GlassCard className="h-40 p-4 font-mono text-xs overflow-y-auto bg-black/60" hover={false}>
          <div className="flex items-center gap-2 mb-2 text-text-secondary uppercase tracking-tighter text-[10px]">
            <Terminal className="w-3 h-3" /> Console Output
          </div>
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={cn(
                log.startsWith('[Error]') ? "text-red-400" :
                log.startsWith('[AI]') ? "text-primary" : "text-white/40"
              )}>
                {log}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
