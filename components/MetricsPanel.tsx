"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar
} from "recharts";

function useTimeSeries(initialVal: number, variance: number, points = 30) {
  const [data, setData] = useState(() =>
    Array.from({ length: points }, (_, i) => ({
      t: i,
      v: initialVal + (Math.random() - 0.5) * variance,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), {
          t: prev[prev.length - 1].t + 1,
          v: Math.max(0, Math.min(100, prev[prev.length - 1].v + (Math.random() - 0.5) * variance)),
        }];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [variance]);

  return data;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-2 py-1 rounded text-[10px]"
      style={{ background: "rgba(4,13,26,0.9)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
    >
      {payload[0].value.toFixed(1)}%
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  delta?: string;
}

function StatCard({ label, value, sub, color, delta }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl relative overflow-hidden"
      style={{
        background: "rgba(6,18,34,0.7)",
        border: `1px solid ${color}20`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${color}10, transparent 70%)`,
        }}
      />
      <div className="text-[9px] tracking-widest mb-2" style={{ color: "rgba(107,143,168,0.5)" }}>{label}</div>
      <div className="text-2xl font-bold mb-1" style={{ color, textShadow: `0 0 20px ${color}66` }}>{value}</div>
      <div className="text-[10px]" style={{ color: "rgba(107,143,168,0.6)" }}>{sub}</div>
      {delta && (
        <div
          className="text-[10px] font-bold mt-1"
          style={{ color: delta.startsWith("+") ? "#00ff87" : "#ff2d9b" }}
        >
          {delta}
        </div>
      )}
    </motion.div>
  );
}

export default function MetricsPanel() {
  const cpuData = useTimeSeries(45, 20);
  const memData = useTimeSeries(65, 15);
  const tokensData = useTimeSeries(30, 25);
  const latencyData = useTimeSeries(120, 40);

  const [tokenCount] = useState(2847392);
  const [reqCount] = useState(1842);

  const modelUsage = [
    { name: "Sonnet", tokens: 1420000, color: "#00d4ff" },
    { name: "Opus", tokens: 980000, color: "#7b2fff" },
    { name: "Haiku", tokens: 447392, color: "#00ff87" },
  ];

  const recentRequests = Array.from({ length: 24 }, (_, i) => ({
    h: i,
    v: Math.floor(20 + Math.random() * 80),
  }));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl"
        style={{ background: "rgba(4,13,26,0.6)", border: "1px solid rgba(255,184,0,0.12)" }}
      >
        <div>
          <div className="text-xs font-bold tracking-widest" style={{ color: "#ffb800" }}>SYSTEM ANALYTICS</div>
          <div className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.4)" }}>Real-time performance dashboard</div>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] tracking-widest"
          style={{ color: "#00ff87" }}
        >
          ● LIVE
        </motion.div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="TOTAL TOKENS" value={tokenCount.toLocaleString()} sub="All-time usage" color="#00d4ff" delta="+12.4% today" />
        <StatCard label="API REQUESTS" value={reqCount.toLocaleString()} sub="Last 24 hours" color="#7b2fff" delta="+8.1% vs yesterday" />
        <StatCard label="AVG LATENCY" value="847ms" sub="p50 response time" color="#ffb800" delta="-23ms" />
        <StatCard label="ACTIVE AGENTS" value="2" sub="4 total deployed" color="#00ff87" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* CPU Usage */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(0,212,255,0.1)" }}
        >
          <div className="flex justify-between mb-3">
            <span className="text-[10px] tracking-widest" style={{ color: "rgba(107,143,168,0.6)" }}>CPU USAGE</span>
            <span className="text-[11px] font-bold" style={{ color: "#00d4ff" }}>
              {cpuData[cpuData.length - 1]?.v.toFixed(1)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={cpuData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={1.5} fill="url(#gradCpu)" dot={false} />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Memory */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(123,47,255,0.1)" }}
        >
          <div className="flex justify-between mb-3">
            <span className="text-[10px] tracking-widest" style={{ color: "rgba(107,143,168,0.6)" }}>MEMORY</span>
            <span className="text-[11px] font-bold" style={{ color: "#7b2fff" }}>
              {memData[memData.length - 1]?.v.toFixed(1)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={memData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7b2fff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7b2fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#7b2fff" strokeWidth={1.5} fill="url(#gradMem)" dot={false} />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Token throughput */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(255,184,0,0.1)" }}
        >
          <div className="flex justify-between mb-3">
            <span className="text-[10px] tracking-widest" style={{ color: "rgba(107,143,168,0.6)" }}>TOKEN THROUGHPUT</span>
            <span className="text-[11px] font-bold" style={{ color: "#ffb800" }}>
              {(tokensData[tokensData.length - 1]?.v * 100).toFixed(0)}/s
            </span>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <LineChart data={tokensData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Line type="monotone" dataKey="v" stroke="#ffb800" strokeWidth={1.5} dot={false} />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latency */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(0,255,135,0.1)" }}
        >
          <div className="flex justify-between mb-3">
            <span className="text-[10px] tracking-widest" style={{ color: "rgba(107,143,168,0.6)" }}>LATENCY (ms)</span>
            <span className="text-[11px] font-bold" style={{ color: "#00ff87" }}>
              {latencyData[latencyData.length - 1]?.v.toFixed(0)}ms
            </span>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={latencyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradLat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff87" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00ff87" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#00ff87" strokeWidth={1.5} fill="url(#gradLat)" dot={false} />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model usage breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(0,212,255,0.08)" }}
        >
          <div className="text-[10px] tracking-widest mb-4" style={{ color: "rgba(107,143,168,0.5)" }}>MODEL USAGE SPLIT</div>
          <div className="space-y-3">
            {modelUsage.map((m) => {
              const pct = (m.tokens / tokenCount) * 100;
              return (
                <div key={m.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px]" style={{ color: m.color }}>{m.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: m.color }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${m.color}66, ${m.color})`, boxShadow: `0 0 6px ${m.color}44` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly requests */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(0,212,255,0.08)" }}
        >
          <div className="text-[10px] tracking-widest mb-3" style={{ color: "rgba(107,143,168,0.5)" }}>REQUESTS / HOUR (24H)</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={recentRequests} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="v" fill="rgba(0,212,255,0.3)" radius={[2, 2, 0, 0]} />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="px-2 py-1 rounded text-[10px]" style={{ background: "rgba(4,13,26,0.9)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}>
                      {payload[0].value} req
                    </div>
                  ) : null
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
