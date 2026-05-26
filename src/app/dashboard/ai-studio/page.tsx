import { AIStudio } from "@/components/dashboard/ai/ai-studio";

export default function AIStudioPage() {
  return (
    <div className="flex flex-col h-full -mt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-space-grotesk tracking-tight">AI Studio</h1>
        <p className="text-text-secondary text-sm">Generate and refine full projects using natural language.</p>
      </div>
      <AIStudio />
    </div>
  );
}
