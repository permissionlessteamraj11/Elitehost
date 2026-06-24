"use client";

import { useState } from "react";
import { File, Folder, Plus, Upload, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const mockFiles = [
  { name: "src", type: "folder", children: [
    { name: "app", type: "folder", children: [
      { name: "page.tsx", type: "file" },
      { name: "layout.tsx", type: "file" },
    ]},
    { name: "components", type: "folder", children: [] },
  ]},
  { name: "package.json", type: "file" },
  { name: "next.config.js", type: "file" },
  { name: "elitehosting.json", type: "file" },
];

export function FileManager() {
  const [expanded, setExpanded] = useState<string[]>(["src", "src/app"]);

  const toggleExpand = (name: string) => {
    setExpanded(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const renderItem = (item: any, path: string = "") => {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    const isExpanded = expanded.includes(fullPath);

    return (
      <div key={fullPath} className="space-y-1">
        <div
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer group"
          onClick={() => item.type === "folder" && toggleExpand(fullPath)}
        >
          {item.type === "folder" ? (
            <>
              {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              <Folder className="w-4 h-4 text-white" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-gray-400" />
            </>
          )}
          <span className="text-sm font-medium flex-1">{item.name}</span>
          <Trash2 className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all" />
        </div>

        {item.type === "folder" && isExpanded && item.children && (
          <div className="ml-4 pl-2 border-l border-white/5">
            {item.children.map((child: any) => renderItem(child, fullPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-sm border border-white/5 bg-white/5 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Files</h4>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-white/10 rounded"><Plus className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-white/10 rounded"><Upload className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {mockFiles.map(file => renderItem(file))}
      </div>
    </div>
  );
}
