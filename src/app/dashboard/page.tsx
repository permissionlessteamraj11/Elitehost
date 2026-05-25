import { ResourceCharts } from "@/components/dashboard/stats/resource-charts";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-gray-400">Welcome back to your deployment command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Engines", value: "0", color: "text-[#00E5FF]" },
          { label: "Total Projects", value: "0", color: "text-white" },
          { label: "Memory Usage", value: "0 MB", color: "text-[#7C3AED]" },
          { label: "Total Bandwidth", value: "0 GB", color: "text-[#10B981]" },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-xl border border-white/5 bg-white/5">
            <div className="text-sm font-medium text-gray-400">{stat.label}</div>
            <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <ResourceCharts />

      <div className="rounded-xl border border-white/5 bg-white/5 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 text-gray-500">
          🚀
        </div>
        <h2 className="text-xl font-bold mb-2">Recent Projects</h2>
        <p className="text-gray-400 mb-6 max-w-sm mx-auto">Get started by creating your first deployment from GitHub, a ZIP file, or raw code.</p>
        <button className="px-6 py-2 bg-[#00E5FF] text-black font-bold rounded-lg hover:bg-[#00E5FF]/90 transition-colors">
          Create New Project
        </button>
      </div>
    </div>
  );
}
