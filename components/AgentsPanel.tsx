"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Plus, Zap, Activity, ChevronRight, MessageSquare, Settings2, X } from "lucide-react";
import AgentAvatar, { type AgentDef } from "./AgentAvatar";

const INITIAL_AGENTS: AgentDef[] = [
  {
    id: "1",
    name: "Atlas",
    role: "Research Analyst",
    avatarType: "research",
    status: "running",
    color: "#00d4ff",
    gradient: ["#00d4ff", "#0066ff"],
    task: "Analyzing AI market trends across 24 sources",
    progress: 67,
    tokensUsed: 142580,
    uptime: "2h 34m",
    model: "claude-opus-4-7",
    symbol: "🔬",
    logs: [
      "Connected to 24 data sources",
      "Processing Q2 financial reports…",
      "Cross-referencing patent filings…",
      "Building trend correlation matrix…",
    ],
  },
  {
    id: "2",
    name: "Nexus",
    role: "Code Architect",
    avatarType: "code",
    status: "running",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#ec4899"],
    task: "Refactoring authentication system",
    progress: 43,
    tokensUsed: 89420,
    uptime: "1h 12m",
    model: "claude-opus-4-7",
    symbol: "⚙️",
    logs: [
      "Parsing 847 source files…",
      "Identified 14 tech-debt clusters",
      "Drafting refactor plan…",
    ],
  },
  {
    id: "3",
    name: "Lyra",
    role: "Content Writer",
    avatarType: "writer",
    status: "idle",
    color: "#10b981",
    gradient: ["#10b981", "#06b6d4"],
    task: "Awaiting next assignment",
    progress: 0,
    tokensUsed: 34210,
    uptime: "5h 01m",
    model: "claude-sonnet-4-6",
    symbol: "✍️",
    logs: ["All systems nominal.", "Ready for assignment."],
  },
  {
    id: "4",
    name: "Orion",
    role: "Web Intelligence",
    avatarType: "crawler",
    status: "paused",
    color: "#f59e0b",
    gradient: ["#f59e0b", "#f97316"],
    task: "Indexing competitor ecosystems",
    progress: 28,
    tokensUsed: 67890,
    uptime: "0h 45m",
    model: "claude-sonnet-4-6",
    symbol: "🌐",
    logs: ["Paused at checkpoint.", "Buffering crawl queue…"],
  },
  {
    id: "5",
    name: "Sigma",
    role: "Data Analyst",
    avatarType: "analyst",
    status: "idle",
    color: "#f43f5e",
    gradient: ["#f43f5e", "#8b5cf6"],
    task: "Monitoring dashboard metrics",
    progress: 0,
    tokensUsed: 21450,
    uptime: "3h 17m",
    model: "claude-haiku-4-5-20251001",
    symbol: "📊",
    logs: ["Monitoring active.", "No anomalies detected."],
  },
];

const STATUS_CONFIG = {
  running: { color: "#10b981", label: "Running",  dot: true  },
  idle:    { color: "#7aa3c0", label: "Idle",     dot: false },
  paused:  { color: "#f59e0b", label: "Paused",   dot: false },
  error:   { color: "#f43f5e", label: "Error",    dot: true  },
};

export default function AgentsPanel() {
  const [agents, setAgents] = useState<AgentDef[]>(INITIAL_AGENTS);
  const [selected, setSelected] = useState<AgentDef>(agents[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTask, setNewTask] = useState("");

  const update = (id: string, patch: Partial<AgentDef>) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, ...patch };
      if (selected.id === id) setSelected(updated);
      return updated;
    }));
  };

  const toggleStatus = (id: string) => {
    const a = agents.find(x => x.id === id)!;
    const next = a.status === "running" ? "paused" : "running";
    update(id, { status: next });
  };

  const stopAgent = (id: string) => update(id, { status: "idle", progress: 0 });

  const createAgent = () => {
    if (!newName.trim()) return;
    const agent: AgentDef = {
      id: Date.now().toString(),
      name: newName,
      role: "Custom Agent",
      avatarType: "custom",
      status: "idle",
      color: "#ec4899",
      gradient: ["#ec4899", "#8b5cf6"],
      task: newTask || "No task assigned",
      progress: 0,
      tokensUsed: 0,
      uptime: "0h 00m",
      model: "claude-sonnet-4-6",
      symbol: "⚡",
      logs: ["Agent initialized.", "Awaiting task assignment."],
    };
    setAgents(prev => [...prev, agent]);
    setSelected(agent);
    setNewName(""); setNewTask("");
    setShowCreate(false);
  };

  const running = agents.filter(a => a.status === "running").length;

  return (
    <div className="flex h-full relative">
      {/* ── Left column: agent cards ── */}
      <div
        className="w-72 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.5)" }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#8b5cf6" }}>
                AI Agents
              </p>
              <p className="text-[10px]" style={{ color: "rgba(122,163,192,0.5)" }}>
                {running} active · {agents.length} deployed
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
              onClick={() => setShowCreate(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}
            >
              <Plus size={13} style={{ color: "#8b5cf6" }} />
            </motion.button>
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
          {agents.map((agent, i) => {
            const isActive = selected.id === agent.id;
            const sc = STATUS_CONFIG[agent.status];
            return (
              <motion.button
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => setSelected(agent)}
                className="w-full text-left rounded-xl p-3 transition-all group relative overflow-hidden"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${agent.color}14, ${agent.gradient[1]}08)`
                    : "rgba(7,21,38,0.5)",
                  border: `1px solid ${isActive ? `${agent.color}30` : "rgba(0,212,255,0.06)"}`,
                  boxShadow: isActive ? `0 4px 24px ${agent.color}12` : "none",
                }}
              >
                {/* shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${agent.color}06, transparent)` }} />

                <div className="flex items-center gap-3">
                  <AgentAvatar agent={agent} size="sm" showRing={isActive} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[13px] font-semibold leading-none" style={{ color: isActive ? agent.color : "#e8f4ff" }}>
                        {agent.name}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ color: "rgba(122,163,192,0.55)" }}>{agent.role}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {sc.dot ? (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }}
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ background: sc.color }} />
                    )}
                  </div>
                </div>

                {/* Progress stripe for running agents */}
                {agent.status === "running" && agent.progress > 0 && (
                  <div className="mt-2.5">
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ background: `linear-gradient(90deg, ${agent.color}88, ${agent.color})` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px]" style={{ color: "rgba(122,163,192,0.35)" }}>
                        {agent.task.slice(0, 28)}…
                      </span>
                      <span className="text-[9px] font-semibold" style={{ color: agent.color }}>
                        {agent.progress}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Right column: agent detail ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Agent hero header */}
          <div
            className="flex-shrink-0 px-6 py-5 border-b relative overflow-hidden"
            style={{
              borderColor: "rgba(0,212,255,0.06)",
              background: `linear-gradient(135deg, ${selected.color}0a, ${selected.gradient[1]}06, transparent)`,
            }}
          >
            {/* BG glow */}
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-20"
              style={{ background: `radial-gradient(circle, ${selected.color}25 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />

            <div className="flex items-start gap-5 relative z-10">
              <AgentAvatar agent={selected} size="lg" showRing />
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold" style={{ color: selected.color, textShadow: `0 0 20px ${selected.color}50` }}>
                    {selected.name}
                  </h2>
                  <span
                    className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${STATUS_CONFIG[selected.status].color}18`, color: STATUS_CONFIG[selected.status].color, border: `1px solid ${STATUS_CONFIG[selected.status].color}35` }}
                  >
                    {STATUS_CONFIG[selected.status].label.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: "rgba(122,163,192,0.7)" }}>{selected.role}</p>
                <div className="flex gap-2">
                  <ActionButton
                    onClick={() => toggleStatus(selected.id)}
                    color={selected.status === "running" ? "#f59e0b" : "#10b981"}
                    icon={selected.status === "running" ? <Pause size={12} /> : <Play size={12} />}
                    label={selected.status === "running" ? "Pause" : "Start"}
                  />
                  <ActionButton
                    onClick={() => stopAgent(selected.id)}
                    color="#f43f5e"
                    icon={<Square size={12} />}
                    label="Stop"
                  />
                  <ActionButton
                    onClick={() => {}}
                    color={selected.color}
                    icon={<MessageSquare size={12} />}
                    label="Message"
                  />
                  <ActionButton
                    onClick={() => {}}
                    color="rgba(122,163,192,0.6)"
                    icon={<Settings2 size={12} />}
                    label="Configure"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "UPTIME",    value: selected.uptime,                    color: selected.color },
                { label: "TOKENS",    value: selected.tokensUsed.toLocaleString(), color: "#f59e0b"   },
                { label: "PROGRESS",  value: `${selected.progress}%`,             color: "#10b981"   },
                { label: "MODEL",     value: selected.model.split("-")[1],         color: "#8b5cf6"   },
              ].map(s => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            {/* Current task */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(7,21,38,0.7)", border: `1px solid ${selected.color}15` }}>
              <p className="text-[10px] tracking-widest font-semibold mb-2.5" style={{ color: "rgba(122,163,192,0.45)" }}>CURRENT TASK</p>
              <div className="flex items-start gap-2.5">
                <ChevronRight size={14} className="mt-0.5 flex-shrink-0" style={{ color: selected.color }} />
                <p className="text-sm leading-relaxed" style={{ color: "rgba(240,248,255,0.85)" }}>{selected.task}</p>
              </div>

              {selected.status === "running" && selected.progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px]" style={{ color: "rgba(122,163,192,0.45)" }}>Progress</span>
                    <span className="text-[11px] font-bold" style={{ color: selected.color }}>{selected.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ background: `linear-gradient(90deg, ${selected.color}88, ${selected.color})` }}
                    >
                      <div className="absolute inset-0 shimmer-wrap" />
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            {/* Activity log */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(7,21,38,0.7)", border: "1px solid rgba(0,212,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={12} style={{ color: "rgba(122,163,192,0.4)" }} />
                <p className="text-[10px] tracking-widest font-semibold" style={{ color: "rgba(122,163,192,0.45)" }}>ACTIVITY LOG</p>
              </div>
              <div className="space-y-2">
                {selected.logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: `${selected.color}60` }} />
                    <span className="text-xs leading-relaxed" style={{ color: "rgba(122,163,192,0.65)" }}>{log}</span>
                  </motion.div>
                ))}
                {selected.status === "running" && (
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="flex gap-1 pl-0.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="typing-dot w-1 h-1 rounded-full" style={{ background: selected.color, animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: `${selected.color}80` }}>Processing…</span>
                  </div>
                )}
              </div>
            </div>

            {/* Model badge */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#8b5cf6", boxShadow: "0 0 6px #8b5cf6" }} />
              <span className="text-xs" style={{ color: "rgba(122,163,192,0.6)" }}>Powered by</span>
              <span className="text-xs font-semibold font-mono" style={{ color: "#8b5cf6" }}>{selected.model}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Create Agent modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(2,4,10,0.88)", backdropFilter: "blur(12px)" }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-[420px] rounded-2xl p-7"
              style={{
                background: "rgba(5,14,28,0.98)",
                border: "1px solid rgba(139,92,246,0.3)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-bold text-base tracking-wide" style={{ color: "#8b5cf6" }}>Deploy New Agent</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(122,163,192,0.5)" }}>Configure and launch an AI agent</p>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ color: "rgba(122,163,192,0.4)" }}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <Field label="AGENT NAME" value={newName} onChange={setNewName} placeholder="e.g. Hermes" />
                <Field label="INITIAL TASK" value={newTask} onChange={setNewTask} placeholder="What should this agent do?" multiline />
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(122,163,192,0.5)" }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={createAgent}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(236,72,153,0.4))",
                      border: "1px solid rgba(139,92,246,0.5)",
                      color: "#c4b5fd",
                      boxShadow: "0 0 24px rgba(139,92,246,0.2)",
                    }}
                  >
                    <Zap size={14} />
                    Deploy Agent
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ onClick, color, icon, label }: { onClick: () => void; color: string; icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
      style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
    >
      {icon}{label}
    </motion.button>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-3.5 rounded-xl relative overflow-hidden"
      style={{ background: "rgba(7,21,38,0.7)", border: `1px solid ${color}15` }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${color}20, transparent 70%)` }} />
      <p className="text-[9px] tracking-widest font-semibold mb-1.5" style={{ color: "rgba(122,163,192,0.4)" }}>{label}</p>
      <p className="text-base font-bold" style={{ color }}>{value}</p>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean
}) {
  const cls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const style = {
    background: "rgba(7,21,38,0.8)",
    border: "1px solid rgba(0,212,255,0.12)",
    color: "rgba(240,248,255,0.85)",
  };
  return (
    <div>
      <p className="text-[9px] tracking-widest font-semibold mb-1.5" style={{ color: "rgba(122,163,192,0.4)" }}>{label}</p>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} style={{ ...style, resize: "none" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} style={style} />
      }
    </div>
  );
}
