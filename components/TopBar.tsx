"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TopBar() {
  const [time, setTime]     = useState("");
  const [date, setDate]     = useState("");
  const [cpu, setCpu]       = useState(44);
  const [mem, setMem]       = useState(67);
  const [latency, setLatency] = useState(84);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString("en-US", { hour12: false }));
      setDate(n.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(30 + Math.random() * 55);
      setMem(52 + Math.random() * 28);
      setLatency(60 + Math.random() * 80);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="relative z-30 flex items-center px-5 py-0 border-b flex-shrink-0"
      style={{
        height: 44,
        background: "rgba(2,4,10,0.92)",
        borderColor: "rgba(0,212,255,0.09)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mr-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ width: 22, height: 22, flexShrink: 0 }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="12" cy="12" r="6"  fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1"   strokeDasharray="3 2" />
            <circle cx="12" cy="12" r="2.5" fill="rgba(0,212,255,0.9)" />
          </svg>
        </motion.div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.25em]" style={{ color: "#00d4ff" }}>CLAUDE OS</div>
          <div className="text-[8px] tracking-[0.15em]" style={{ color: "rgba(0,212,255,0.35)" }}>MISSION CONTROL</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-4 w-px mr-6" style={{ background: "rgba(0,212,255,0.1)" }} />

      {/* Live indicator */}
      <div className="flex items-center gap-2 mr-6">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
        />
        <span className="text-[10px] font-semibold tracking-widest" style={{ color: "rgba(52,211,153,0.8)" }}>LIVE</span>
      </div>

      {/* System metrics */}
      <div className="flex items-center gap-5">
        <MiniMetric label="CPU"     value={cpu}     color="#00d4ff" />
        <MiniMetric label="MEM"     value={mem}     color="#8b5cf6" />
        <MiniMetric label="LAT"     value={Math.round(latency)} color="#10b981" unit="ms" isLatency />
      </div>

      <div className="flex-1" />

      {/* Time */}
      <div className="text-right">
        <div className="text-sm font-semibold font-mono tracking-wider" style={{ color: "#00d4ff", textShadow: "0 0 10px rgba(0,212,255,0.4)" }}>
          {time}
        </div>
        <div className="text-[9px] tracking-wider" style={{ color: "rgba(0,212,255,0.35)" }}>
          {date}
        </div>
      </div>
    </header>
  );
}

function MiniMetric({ label, value, color, unit = "%", isLatency = false }: {
  label: string; value: number; color: string; unit?: string; isLatency?: boolean;
}) {
  const pct = isLatency ? Math.min(100, (value / 200) * 100) : value;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-semibold tracking-widest w-6" style={{ color: `${color}80` }}>{label}</span>
      <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ background: `linear-gradient(90deg, ${color}70, ${color})`, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
      <span className="text-[9px] font-bold w-8 text-right" style={{ color }}>
        {Math.round(value)}{unit}
      </span>
    </div>
  );
}
