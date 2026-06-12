"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalLogsProps {
  logs: string[];
}

export function TerminalLogs({ logs }: TerminalLogsProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: "transparent",
        foreground: "#00E5FF",
        cursor: "#00E5FF",
        selectionBackground: "rgba(0, 229, 255, 0.3)",
      },
      fontFamily: "var(--font-geist-mono)",
      fontSize: 14,
      cursorBlink: true,
      allowTransparency: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (xtermRef.current && logs.length > 0) {
      xtermRef.current.clear();
      logs.forEach((log) => xtermRef.current?.writeln(log));
    }
  }, [logs]);

  return (
    <div className="rounded-sm border border-white/5 bg-black/40 p-4">
      <div ref={terminalRef} className="h-96 w-full" />
    </div>
  );
}
