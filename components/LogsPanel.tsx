"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Filter, Download, Trash2, ChevronRight } from "lucide-react";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS";

interface LogEntry {
  id: string;
  ts: Date;
  level: LogLevel;
  source: string;
  message: string;
}

const LEVEL_COLOR: Record<LogLevel, string> = {
  INFO: "#00d4ff",
  WARN: "#ffb800",
  ERROR: "#ff2d9b",
  DEBUG: "rgba(107,143,168,0.6)",
  SUCCESS: "#00ff87",
};

const SOURCES = ["API", "AGENT", "WORKFLOW", "SYSTEM", "AUTH"];

function makeLog(override?: Partial<LogEntry>): LogEntry {
  const levels: LogLevel[] = ["INFO", "INFO", "INFO", "DEBUG", "WARN", "SUCCESS", "ERROR"];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  const messages: Record<LogLevel, string[]> = {
    INFO: [
      "Request routed to claude-sonnet-4-6",
      "Token stream initialized",
      "Context window: 4,096 tokens loaded",
      "Agent heartbeat received",
      "WebSocket connection established",
    ],
    WARN: [
      "Token usage approaching limit (85%)",
      "Response latency elevated: 1240ms",
      "Rate limit threshold warning",
      "Memory bank fragmentation detected",
    ],
    ERROR: [
      "Stream interrupted: connection reset",
      "Agent task failed: timeout after 30s",
      "Invalid API key format",
    ],
    DEBUG: [
      "Cache miss for prompt hash 0x7f3a...",
      "Attention layer depth: 96",
      "Sampling temperature: 0.7",
      "Buffer flush: 2048 bytes",
    ],
    SUCCESS: [
      "Workflow 'Daily Digest' completed",
      "Agent deployment successful",
      "Model warm-up complete",
      "Checkpoint saved: step 1200",
    ],
  };
  const msg = messages[level][Math.floor(Math.random() * messages[level].length)];
  return {
    id: Math.random().toString(36).slice(2),
    ts: new Date(),
    level,
    source,
    message: msg,
    ...override,
  };
}

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 30 }, () => {
      const l = makeLog();
      const ago = Math.random() * 300000;
      l.ts = new Date(Date.now() - ago);
      return l;
    }).sort((a, b) => a.ts.getTime() - b.ts.getTime())
  );
  const [filter, setFilter] = useState<LogLevel | "ALL">("ALL");
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-199), makeLog()]);
    }, 1200);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (!paused) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, paused]);

  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.08)", background: "rgba(4,13,26,0.6)" }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={!paused ? { opacity: [0.4, 1, 0.4] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Radio size={13} style={{ color: paused ? "rgba(107,143,168,0.4)" : "#ff2d9b" }} />
          </motion.div>
          <span className="text-xs font-bold tracking-widest" style={{ color: "#ff2d9b" }}>EVENT LOG</span>
          <span className="text-[10px]" style={{ color: "rgba(107,143,168,0.4)" }}>
            {filtered.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level filter */}
          <div className="flex gap-1">
            {(["ALL", "INFO", "WARN", "ERROR", "SUCCESS", "DEBUG"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setFilter(l)}
                className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider transition-all"
                style={{
                  background: filter === l ? (l === "ALL" ? "rgba(0,212,255,0.15)" : `${LEVEL_COLOR[l as LogLevel] ?? "rgba(0,212,255,0.15)"}20`) : "transparent",
                  color: filter === l ? (l === "ALL" ? "#00d4ff" : LEVEL_COLOR[l as LogLevel] ?? "#00d4ff") : "rgba(107,143,168,0.4)",
                  border: filter === l ? `1px solid ${l === "ALL" ? "rgba(0,212,255,0.3)" : `${LEVEL_COLOR[l as LogLevel] ?? "rgba(0,212,255,0.3)"}44`}` : "1px solid transparent",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPaused(!paused)}
            className="px-2 py-1 rounded text-[9px] tracking-wider transition-all"
            style={{
              background: paused ? "rgba(255,184,0,0.15)" : "rgba(0,212,255,0.08)",
              border: `1px solid ${paused ? "rgba(255,184,0,0.3)" : "rgba(0,212,255,0.1)"}`,
              color: paused ? "#ffb800" : "rgba(107,143,168,0.6)",
            }}
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>

          <button onClick={() => setLogs([])}>
            <Trash2 size={12} style={{ color: "rgba(107,143,168,0.3)" }} />
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence initial={false}>
          {filtered.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2 px-2 py-1 rounded text-[11px] hover:bg-white/5 group transition-colors"
            >
              <span className="text-[9px] flex-shrink-0 mt-0.5" style={{ color: "rgba(107,143,168,0.35)" }}>
                {log.ts.toLocaleTimeString("en-US", { hour12: false })}
              </span>
              <span
                className="text-[9px] flex-shrink-0 font-bold px-1 py-0.5 rounded-sm leading-none"
                style={{
                  color: LEVEL_COLOR[log.level],
                  background: `${LEVEL_COLOR[log.level]}15`,
                  minWidth: "45px",
                  textAlign: "center",
                }}
              >
                {log.level}
              </span>
              <span
                className="text-[9px] flex-shrink-0 px-1 py-0.5 rounded-sm leading-none"
                style={{ color: "rgba(107,143,168,0.5)", background: "rgba(255,255,255,0.04)", minWidth: "60px", textAlign: "center" }}
              >
                {log.source}
              </span>
              <span className="text-[11px] leading-tight" style={{ color: "rgba(232,244,255,0.7)" }}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
