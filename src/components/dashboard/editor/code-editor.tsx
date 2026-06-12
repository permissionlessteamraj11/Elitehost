"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
}

export function CodeEditor({ code, language = "javascript", onChange }: CodeEditorProps) {
  return (
    <div className="rounded-sm border border-white/5 overflow-hidden">
      <Editor
        height="60vh"
        defaultLanguage={language}
        defaultValue={code}
        theme="vs-dark"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-geist-mono)",
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>
  );
}
