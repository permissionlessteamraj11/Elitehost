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
      <div className="p-6 rounded-xl border border-white/5 bg-white/5">
        <h3 className="text-lg font-bold mb-6">CPU Usage (%)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#020108", border: "1px solid #ffffff10", borderRadius: "8px" }}
                itemStyle={{ color: "#00E5FF" }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#00E5FF"
                fillOpacity={1}
                fill="url(#colorCpu)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/5 bg-white/5">
        <h3 className="text-lg font-bold mb-6">RAM Usage (MB)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}MB`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#020108", border: "1px solid #ffffff10", borderRadius: "8px" }}
                itemStyle={{ color: "#7C3AED" }}
              />
              <Area
                type="monotone"
                dataKey="ram"
                stroke="#7C3AED"
                fillOpacity={1}
                fill="url(#colorRam)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
