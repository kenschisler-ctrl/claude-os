"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Plus, Clock, CheckCircle, XCircle, AlertCircle, GitBranch, Zap, ArrowRight } from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "done" | "failed";
  duration?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "idle" | "failed";
  color: string;
  steps: WorkflowStep[];
  lastRun?: string;
  runsTotal: number;
  successRate: number;
}

const WORKFLOWS: Workflow[] = [
  {
    id: "1",
    name: "Daily Research Digest",
    description: "Fetch news → Summarize → Generate report → Send email",
    status: "active",
    color: "#00d4ff",
    runsTotal: 42,
    successRate: 97,
    lastRun: "2h ago",
    steps: [
      { id: "s1", name: "Fetch Sources", status: "done", duration: "1.2s" },
      { id: "s2", name: "AI Summarize", status: "running", duration: "..." },
      { id: "s3", name: "Generate Report", status: "pending" },
      { id: "s4", name: "Send Email", status: "pending" },
    ],
  },
  {
    id: "2",
    name: "Code Review Pipeline",
    description: "Diff analysis → Security scan → Suggestions → PR comment",
    status: "idle",
    color: "#7b2fff",
    runsTotal: 128,
    successRate: 94,
    lastRun: "5h ago",
    steps: [
      { id: "s1", name: "Diff Analysis", status: "done", duration: "0.8s" },
      { id: "s2", name: "Security Scan", status: "done", duration: "2.1s" },
      { id: "s3", name: "AI Review", status: "done", duration: "4.3s" },
      { id: "s4", name: "Post Comment", status: "done", duration: "0.3s" },
    ],
  },
  {
    id: "3",
    name: "Content Automation",
    description: "Topic → Research → Draft → SEO optimize → Publish",
    status: "failed",
    color: "#ff2d9b",
    runsTotal: 67,
    successRate: 82,
    lastRun: "1d ago",
    steps: [
      { id: "s1", name: "Topic Research", status: "done", duration: "1.5s" },
      { id: "s2", name: "Draft Content", status: "done", duration: "8.2s" },
      { id: "s3", name: "SEO Optimize", status: "failed" },
      { id: "s4", name: "Publish", status: "pending" },
    ],
  },
];

const stepStatusIcon = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "done": return <CheckCircle size={12} style={{ color: "#00ff87" }} />;
    case "running": return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-3 h-3 rounded-full border border-cyan-400 border-t-transparent"
      />
    );
    case "failed": return <XCircle size={12} style={{ color: "#ff2d9b" }} />;
    default: return <div className="w-3 h-3 rounded-full" style={{ border: "1px solid rgba(107,143,168,0.3)" }} />;
  }
};

export default function WorkflowsPanel() {
  const [selected, setSelected] = useState<Workflow>(WORKFLOWS[0]);
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  const triggerRun = (id: string) => {
    setWorkflows((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      return {
        ...w,
        status: "active",
        steps: w.steps.map((s, i) => i === 0 ? { ...s, status: "running" } : { ...s, status: "pending" }),
      };
    }));
  };

  return (
    <div className="flex h-full">
      {/* Workflow list */}
      <div
        className="w-72 flex-shrink-0 border-r flex flex-col"
        style={{ borderColor: "rgba(0,212,255,0.08)", background: "rgba(4,13,26,0.4)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "rgba(0,212,255,0.08)" }}
        >
          <div>
            <div className="text-xs font-bold tracking-widest" style={{ color: "#00ff87" }}>WORKFLOWS</div>
            <div className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.4)" }}>
              {workflows.filter(w => w.status === "active").length} running
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "rgba(0,255,135,0.15)", border: "1px solid rgba(0,255,135,0.3)" }}
          >
            <Plus size={12} style={{ color: "#00ff87" }} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {workflows.map((wf, i) => {
            const isSelected = selected.id === wf.id;
            const statusColor = wf.status === "active" ? "#00ff87" : wf.status === "failed" ? "#ff2d9b" : "rgba(107,143,168,0.5)";
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(wf)}
                className="p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? `${wf.color}10` : "rgba(6,18,34,0.5)",
                  border: `1px solid ${isSelected ? `${wf.color}25` : "rgba(0,212,255,0.06)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: isSelected ? wf.color : "rgba(232,244,255,0.7)" }}>
                    {wf.name}
                  </span>
                  {wf.status === "active" ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}` }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                  )}
                </div>
                <div className="text-[9px] mb-2" style={{ color: "rgba(107,143,168,0.5)" }}>{wf.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: "rgba(107,143,168,0.4)" }}>
                    {wf.lastRun ? `Last: ${wf.lastRun}` : "Never run"}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: wf.color }}>{wf.successRate}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Workflow detail */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitBranch size={16} style={{ color: selected.color }} />
              <h2 className="font-bold tracking-wider" style={{ color: selected.color }}>{selected.name}</h2>
            </div>
            <p className="text-xs" style={{ color: "rgba(107,143,168,0.6)" }}>{selected.description}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => triggerRun(selected.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
            style={{
              background: `${selected.color}20`,
              border: `1px solid ${selected.color}44`,
              color: selected.color,
              boxShadow: `0 0 20px ${selected.color}15`,
            }}
          >
            <Zap size={12} />
            TRIGGER RUN
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "TOTAL RUNS", value: selected.runsTotal.toString(), color: selected.color },
            { label: "SUCCESS RATE", value: `${selected.successRate}%`, color: "#00ff87" },
            { label: "LAST RUN", value: selected.lastRun || "—", color: "#ffb800" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl"
              style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${s.color}15` }}
            >
              <div className="text-[9px] tracking-widest mb-1" style={{ color: "rgba(107,143,168,0.4)" }}>{s.label}</div>
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Pipeline visualization */}
        <div
          className="p-5 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${selected.color}15` }}
        >
          <div className="text-[10px] tracking-widest mb-5" style={{ color: "rgba(107,143,168,0.5)" }}>PIPELINE STAGES</div>
          <div className="flex items-center gap-3 flex-wrap">
            {selected.steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 relative"
                    style={{
                      background: step.status === "done"
                        ? "rgba(0,255,135,0.1)"
                        : step.status === "running"
                        ? `${selected.color}15`
                        : step.status === "failed"
                        ? "rgba(255,45,155,0.1)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        step.status === "done" ? "rgba(0,255,135,0.25)"
                        : step.status === "running" ? `${selected.color}44`
                        : step.status === "failed" ? "rgba(255,45,155,0.25)"
                        : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    {stepStatusIcon(step.status)}
                    {step.duration && step.status !== "pending" && (
                      <span className="text-[8px]" style={{ color: "rgba(107,143,168,0.5)" }}>{step.duration}</span>
                    )}
                    {step.status === "running" && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ background: selected.color, borderRadius: "inherit" }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-center max-w-[60px] leading-tight" style={{ color: "rgba(107,143,168,0.7)" }}>
                    {step.name}
                  </span>
                </motion.div>
                {i < selected.steps.length - 1 && (
                  <motion.div
                    animate={step.status === "done" ? { opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight
                      size={16}
                      style={{ color: step.status === "done" ? selected.color : "rgba(107,143,168,0.2)" }}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule info */}
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(6,18,34,0.5)", border: "1px solid rgba(0,212,255,0.06)" }}
        >
          <Clock size={14} style={{ color: "rgba(107,143,168,0.4)" }} />
          <div>
            <span className="text-xs" style={{ color: "rgba(107,143,168,0.6)" }}>Schedule: </span>
            <span className="text-xs font-mono" style={{ color: selected.color }}>0 9 * * * (Daily at 09:00)</span>
          </div>
          <AlertCircle size={13} style={{ color: "rgba(107,143,168,0.3)" }} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}
