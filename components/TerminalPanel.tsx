"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, X, Minus, Square } from "lucide-react";

interface TermLine {
  id: string;
  type: "cmd" | "out" | "err" | "sys";
  text: string;
}

const HELP_TEXT = [
  "Available commands:",
  "  help          — show this help",
  "  clear         — clear terminal",
  "  models        — list available Claude models",
  "  status        — system status report",
  "  ping          — test API connectivity",
  "  about         — about CLAUDE OS",
  "  matrix        — enter the matrix",
  "  agents        — list active agents",
  "",
];

const ABOUT_TEXT = [
  "╔═══════════════════════════════════════╗",
  "║        CLAUDE OS v2.0.0              ║",
  "║        Mission Control Dashboard     ║",
  "║        Powered by Anthropic          ║",
  "╚═══════════════════════════════════════╝",
  "",
  "Runtime: Next.js 15 · Tailwind · Framer Motion",
  "AI Core: Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5",
  "",
];

export default function TerminalPanel() {
  const [lines, setLines] = useState<TermLine[]>([
    { id: "0", type: "sys", text: "CLAUDE OS Terminal v2.0.0" },
    { id: "1", type: "sys", text: 'Type "help" for available commands.' },
    { id: "2", type: "sys", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [matrixMode, setMatrixMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixRef = useRef<number>(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const addLines = (newLines: Omit<TermLine, "id">[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((l, i) => ({ ...l, id: `${Date.now()}-${i}` })),
    ]);
  };

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    addLines([{ type: "cmd", text: `claude-os ~$ ${cmd}` }]);

    if (!trimmed) return;
    setHistory((prev) => [cmd, ...prev.slice(0, 49)]);
    setHistIdx(-1);

    switch (trimmed) {
      case "help":
        addLines(HELP_TEXT.map((t) => ({ type: "out" as const, text: t })));
        break;
      case "clear":
        setLines([]);
        break;
      case "models":
        addLines([
          { type: "out", text: "Available Claude Models:" },
          { type: "out", text: "  claude-opus-4-7           [FLAGSHIP]" },
          { type: "out", text: "  claude-sonnet-4-6         [BALANCED]" },
          { type: "out", text: "  claude-haiku-4-5-20251001 [FAST]" },
          { type: "out", text: "" },
        ]);
        break;
      case "status":
        addLines([
          { type: "out", text: "System Status Report" },
          { type: "out", text: "─────────────────────────────────" },
          { type: "out", text: "  API Connection:  ● ONLINE" },
          { type: "out", text: "  Active Agents:   2 running" },
          { type: "out", text: "  Total Tokens:    2,847,392" },
          { type: "out", text: "  Uptime:          14h 23m 07s" },
          { type: "out", text: "  Memory Usage:    67%" },
          { type: "out", text: "  CPU Load:        42%" },
          { type: "out", text: "" },
        ]);
        break;
      case "ping":
        addLines([{ type: "sys", text: "Pinging Anthropic API..." }]);
        setTimeout(() => {
          addLines([
            { type: "out", text: "Reply from api.anthropic.com: time=84ms" },
            { type: "out", text: "Reply from api.anthropic.com: time=79ms" },
            { type: "out", text: "Reply from api.anthropic.com: time=91ms" },
            { type: "out", text: "Average latency: 84.7ms ✓" },
            { type: "out", text: "" },
          ]);
        }, 600);
        break;
      case "about":
        addLines(ABOUT_TEXT.map((t) => ({ type: "out" as const, text: t })));
        break;
      case "matrix":
        addLines([{ type: "sys", text: "Entering the matrix..." }]);
        setMatrixMode(true);
        setTimeout(() => setMatrixMode(false), 5000);
        break;
      case "agents":
        addLines([
          { type: "out", text: "Active Agent Registry:" },
          { type: "out", text: "  [RUNNING] Research Bot    — 2h 34m uptime" },
          { type: "out", text: "  [RUNNING] Code Architect  — 1h 12m uptime" },
          { type: "out", text: "  [IDLE]    Content Writer  — 5h 01m uptime" },
          { type: "out", text: "  [PAUSED]  Web Crawler     — 0h 45m uptime" },
          { type: "out", text: "" },
        ]);
        break;
      default:
        addLines([
          { type: "err", text: `command not found: ${trimmed}` },
          { type: "err", text: 'Type "help" for available commands.' },
          { type: "out", text: "" },
        ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx]);
    }
  };

  const typeColor = (type: TermLine["type"]) => {
    switch (type) {
      case "cmd": return "#00d4ff";
      case "err": return "#ff2d9b";
      case "sys": return "#7b2fff";
      default: return "rgba(107,143,168,0.8)";
    }
  };

  return (
    <div
      className="flex flex-col h-full font-mono relative overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Matrix rain overlay */}
      {matrixMode && (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: "100vh", opacity: [0, 1, 0] }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: 2 }}
              className="absolute text-[10px] font-mono"
              style={{
                left: `${i * 5}%`,
                color: "#00ff87",
                textShadow: "0 0 10px rgba(0,255,135,0.8)",
                writingMode: "vertical-lr",
              }}
            >
              {Array.from({ length: 20 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join("")}
            </motion.div>
          ))}
        </div>
      )}

      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.08)", background: "rgba(4,13,26,0.8)" }}
      >
        <Terminal size={13} style={{ color: "#00d4ff" }} />
        <span className="text-xs font-bold tracking-widest" style={{ color: "#00d4ff" }}>SYSTEM TERMINAL</span>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          {[
            { color: "#ff2d9b", icon: X },
            { color: "#ffb800", icon: Minus },
            { color: "#00ff87", icon: Square },
          ].map(({ color, icon: Icon }, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
            />
          ))}
        </div>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {lines.map((line) => (
          <div
            key={line.id}
            className="text-xs leading-relaxed"
            style={{ color: typeColor(line.type), fontFamily: "inherit" }}
          >
            {line.text || " "}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center text-xs" style={{ color: "#00d4ff" }}>
          <span>claude-os ~$ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none ml-1"
            style={{ color: "#00d4ff", fontFamily: "inherit", caretColor: "#00d4ff" }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <span className="cursor-blink ml-0.5 w-2 h-4 inline-block" style={{ background: "#00d4ff", opacity: 0.8 }} />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
