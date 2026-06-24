"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";

const data = [
  { time: "00:00", cpu: 12, ram: 45 },
  { time: "04:00", cpu: 18, ram: 52 },
  { time: "08:00", cpu: 35, ram: 65 },
  { time: "12:00", cpu: 45, ram: 78 },
  { time: "16:00", cpu: 32, ram: 70 },
  { time: "20:00", cpu: 22, ram: 58 },
  { time: "23:59", cpu: 15, ram: 50 },
];

export function ResourceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">CPU Usage (%)</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
             <span className="text-[10px] font-bold text-white tracking-widest">LIVE</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
                itemStyle={{ color: "#FFFFFF" }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#FFFFFF"
                fillOpacity={1}
                fill="url(#colorCpu)"
                strokeWidth={2}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">RAM Usage (MB)</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.5)]" />
             <span className="text-[10px] font-bold text-zinc-500 tracking-widest">LIVE</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#71717A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}MB`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
                itemStyle={{ color: "#71717A" }}
              />
              <Area
                type="monotone"
                dataKey="ram"
                stroke="#71717A"
                fillOpacity={1}
                fill="url(#colorRam)"
                strokeWidth={2}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
