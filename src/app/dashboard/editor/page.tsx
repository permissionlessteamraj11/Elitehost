import { CodeEditor } from "@/components/dashboard/editor/code-editor";
import { FileManager } from "@/components/dashboard/editor/file-manager";

export default function EditorPage() {
  const defaultCode = `// EliteHosting - Smart Deploy Engine
// Edit your code directly in the browser.

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-[#00E5FF]">
        Elite Hosting v14.0
      </h1>
    </div>
  );
}
`;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cloud Editor</h1>
          <p className="text-gray-400">Edit project files in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-[#00E5FF] text-black font-bold rounded-lg hover:bg-[#00E5FF]/90 transition-colors">
            Save & Deploy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-1 h-full overflow-hidden">
          <FileManager />
        </div>
        <div className="lg:col-span-3 h-full">
          <CodeEditor code={defaultCode} language="typescript" />
        </div>
      </div>
    </div>
  );
}
