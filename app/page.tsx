"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "@/components/ParticleField";
import TopBar from "@/components/TopBar";
import Sidebar, { type PanelId } from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import AgentsPanel from "@/components/AgentsPanel";
import MetricsPanel from "@/components/MetricsPanel";
import TerminalPanel from "@/components/TerminalPanel";
import WorkflowsPanel from "@/components/WorkflowsPanel";
import ModelsPanel from "@/components/ModelsPanel";
import SettingsPanel from "@/components/SettingsPanel";
import LogsPanel from "@/components/LogsPanel";
import MemoryPanel from "@/components/MemoryPanel";
import DeployPanel from "@/components/DeployPanel";
import JournalPanel from "@/components/JournalPanel";
import GoalsPanel from "@/components/GoalsPanel";
import SetupWizard from "@/components/SetupWizard";

const PANEL_META: Record<PanelId, { label: string; color: string; desc: string }> = {
  chat:      { label: "Neural Chat",    color: "#00d4ff", desc: "Direct conversation with Claude" },
  agents:    { label: "AI Agents",      color: "#8b5cf6", desc: "Manage and monitor your AI workforce" },
  journal:   { label: "Journal",        color: "#8b5cf6", desc: "Daily notes saved to Obsidian vault" },
  goals:     { label: "Goals",          color: "#f59e0b", desc: "Track objectives synced to vault" },
  workflows: { label: "Workflows",      color: "#10b981", desc: "Automate complex multi-step pipelines" },
  metrics:   { label: "Analytics",      color: "#f59e0b", desc: "Real-time system performance" },
  memory:    { label: "Memory Bank",    color: "#f43f5e", desc: "Persistent knowledge store" },
  terminal:  { label: "Terminal",       color: "#00d4ff", desc: "System command interface" },
  logs:      { label: "Event Log",      color: "#ec4899", desc: "Live system event stream" },
  models:    { label: "Model Registry", color: "#8b5cf6", desc: "Claude model specifications" },
  deploy:    { label: "Deploy Center",  color: "#f59e0b", desc: "CI/CD pipeline control" },
  settings:  { label: "Configuration",  color: "#64748b", desc: "System settings & API keys" },
};

function PanelContent({ id }: { id: PanelId }) {
  switch (id) {
    case "chat":      return <ChatPanel />;
    case "agents":    return <AgentsPanel />;
    case "journal":   return <JournalPanel />;
    case "goals":     return <GoalsPanel />;
    case "metrics":   return <MetricsPanel />;
    case "terminal":  return <TerminalPanel />;
    case "workflows": return <WorkflowsPanel />;
    case "models":    return <ModelsPanel />;
    case "settings":  return <SettingsPanel />;
    case "logs":      return <LogsPanel />;
    case "memory":    return <MemoryPanel />;
    case "deploy":    return <DeployPanel />;
  }
}

export default function Home() {
  const [active, setActive]           = useState<PanelId>("chat");
  const [needsSetup, setNeedsSetup]   = useState<boolean | null>(null);
  const meta = PANEL_META[active];

  useEffect(() => {
    fetch("/api/setup")
      .then(r => r.json())
      .then(d => setNeedsSetup(!d.config.setupComplete))
      .catch(() => setNeedsSetup(false));
  }, []);

  if (needsSetup === null) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--bg-void)" }}>
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: "var(--bg-void)" }}>
      {needsSetup && <SetupWizard onComplete={() => { setNeedsSetup(false); window.location.reload(); }} />}

      {/* Layered backgrounds */}
      <ParticleField />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 10% 60%, rgba(0,102,255,0.055) 0%, transparent 100%)",
            "radial-gradient(ellipse 70% 50% at 90% 15%, rgba(139,92,246,0.055) 0%, transparent 100%)",
            "radial-gradient(ellipse 60% 40% at 50% 95%, rgba(236,72,153,0.04) 0%, transparent 100%)",
          ].join(", "),
        }}
      />
      {/* Fine grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 grid-bg opacity-100"
      />

      <TopBar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar active={active} onNavigate={setActive} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Panel breadcrumb header */}
          <div
            className="flex items-center gap-3 px-5 flex-shrink-0"
            style={{
              height: 38,
              background: "rgba(3,8,16,0.6)",
              borderBottom: "1px solid rgba(0,212,255,0.06)",
              backdropFilter: "blur(16px)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2.5"
              >
                {/* Color accent */}
                <motion.div
                  layoutId="panel-accent"
                  className="w-1 h-3.5 rounded-full"
                  style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                />
                <span className="text-[11px] font-semibold tracking-[0.18em]" style={{ color: meta.color }}>
                  {meta.label.toUpperCase()}
                </span>
                <span className="hidden sm:inline text-[10px]" style={{ color: "rgba(122,163,192,0.3)" }}>
                  · {meta.desc}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="flex-1" />

            {/* Quick switcher pills */}
            <div className="flex gap-1 items-center">
              {(["chat", "agents", "workflows", "metrics", "logs"] as PanelId[]).map((id) => {
                const m = PANEL_META[id];
                return (
                  <motion.button
                    key={id}
                    onClick={() => setActive(id)}
                    whileHover={{ scale: 1.3 }}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{
                      background: active === id ? m.color : "rgba(100,116,139,0.25)",
                      boxShadow: active === id ? `0 0 6px ${m.color}` : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Content with framer transitions */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10, scale: 0.993 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.997 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 overflow-hidden"
              >
                <PanelContent id={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Corner SVG accents */}
      <svg className="fixed bottom-0 right-0 pointer-events-none z-0 opacity-[0.07]" width="160" height="160" viewBox="0 0 160 160">
        <path d="M 160 160 L 60 160 L 160 60 Z" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
        <path d="M 160 160 L 30 160 L 160 30 Z" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
        <circle cx="160" cy="160" r="50" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeDasharray="3 3" />
      </svg>
      <svg className="fixed top-0 right-0 pointer-events-none z-0 opacity-[0.06]" width="120" height="120" viewBox="0 0 120 120">
        <path d="M 120 0 L 120 80 L 40 0 Z" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
        <circle cx="120" cy="0" r="40" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="2 3" />
      </svg>
    </div>
  );
}
