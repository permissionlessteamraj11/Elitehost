"use client";

import { Users, Server, ShieldAlert, Activity, Ban, MoreVertical } from "lucide-react";

const stats = [
  { label: "Total Users", value: "12,847", icon: Users, color: "text-[#00E5FF]" },
  { label: "Active Nodes", value: "32", icon: Server, color: "text-[#10B981]" },
  { label: "Incidents", value: "0", icon: ShieldAlert, color: "text-[#7C3AED]" },
  { label: "Sys Load", value: "12%", icon: Activity, color: "text-white" },
];

const mockUsers = [
  { id: "1", name: "Kvinit6421", email: "Kvinit6421@gmail.com", role: "admin", status: "active" },
  { id: "2", name: "alex_dev", email: "alex@example.com", role: "user", status: "active" },
  { id: "3", name: "shadow_coder", email: "shadow@evil.com", role: "user", status: "suspended" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-10 bg-[#020108] min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Command Center</h1>
          <p className="text-gray-400">System-wide monitoring and user management.</p>
        </div>
        <button className="px-6 py-2 bg-red-600/10 border border-red-600/20 text-red-500 font-bold rounded-lg hover:bg-red-600/20 transition-all">
          Emergency Lockdown
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-500">REAL-TIME</span>
            </div>
            <div className="text-3xl font-bold mb-1">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-sm ${
                      u.status === 'active' ? 'text-[#10B981]' : 'text-red-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
