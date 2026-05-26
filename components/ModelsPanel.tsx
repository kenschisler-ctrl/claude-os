"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Zap, Brain, Cpu, Clock, ChevronRight } from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  tier: string;
  color: string;
  icon: React.ElementType;
  contextWindow: string;
  outputTokens: string;
  strengths: string[];
  speed: number;
  intelligence: number;
  costPerMillion: string;
  description: string;
  badge?: string;
}

const MODELS: ModelInfo[] = [
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    tier: "FLAGSHIP",
    color: "#ff2d9b",
    icon: Brain,
    contextWindow: "200K tokens",
    outputTokens: "32K tokens",
    strengths: ["Complex reasoning", "Research & analysis", "Long-form writing", "Advanced coding"],
    speed: 40,
    intelligence: 100,
    costPerMillion: "$15 / $75",
    description: "Most powerful model. Excels at highly complex tasks requiring deep reasoning and nuanced understanding.",
    badge: "MOST CAPABLE",
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    tier: "BALANCED",
    color: "#00d4ff",
    icon: Cpu,
    contextWindow: "200K tokens",
    outputTokens: "8K tokens",
    strengths: ["Balanced performance", "Code generation", "Data analysis", "Customer workflows"],
    speed: 80,
    intelligence: 88,
    costPerMillion: "$3 / $15",
    description: "Best balance of intelligence and speed. Ideal for production workloads and real-time applications.",
    badge: "RECOMMENDED",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    tier: "FAST",
    color: "#00ff87",
    icon: Zap,
    contextWindow: "200K tokens",
    outputTokens: "4K tokens",
    strengths: ["Near-instant response", "High throughput", "Simple tasks", "Cost efficiency"],
    speed: 100,
    intelligence: 72,
    costPerMillion: "$0.25 / $1.25",
    description: "Fastest model with lowest latency. Perfect for real-time chat, classification, and simple automation.",
    badge: "FASTEST",
  },
];

function StatBar({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.5)" }}>{label}</span>
        <span className="text-[9px] font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})`, boxShadow: `0 0 8px ${color}44` }}
        />
      </div>
    </div>
  );
}

export default function ModelsPanel() {
  const [selected, setSelected] = useState<ModelInfo>(MODELS[1]);
  const [apiKey, setApiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"idle" | "checking" | "ok" | "err">("idle");

  const checkApiKey = async () => {
    if (!apiKey.trim()) return;
    setKeyStatus("checking");
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setKeyStatus(data.error ? "err" : "ok");
    } catch {
      setKeyStatus("err");
    }
  };

  return (
    <div className="flex h-full">
      {/* Model list */}
      <div
        className="w-64 flex-shrink-0 border-r flex flex-col"
        style={{ borderColor: "rgba(0,212,255,0.08)", background: "rgba(4,13,26,0.4)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(0,212,255,0.08)" }}
        >
          <div className="text-xs font-bold tracking-widest" style={{ color: "#7b2fff" }}>CLAUDE MODELS</div>
          <div className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.4)" }}>
            {MODELS.length} available
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {MODELS.map((model, i) => {
            const Icon = model.icon;
            const isSelected = selected.id === model.id;
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelected(model)}
                className="p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? `${model.color}12` : "rgba(6,18,34,0.5)",
                  border: `1px solid ${isSelected ? `${model.color}30` : "rgba(0,212,255,0.06)"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${model.color}18`, border: `1px solid ${model.color}33` }}
                  >
                    <Icon size={14} style={{ color: model.color }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium" style={{ color: isSelected ? model.color : "rgba(232,244,255,0.8)" }}>
                      {model.name}
                    </div>
                    <div className="text-[9px] tracking-widest" style={{ color: `${model.color}88` }}>
                      {model.tier}
                    </div>
                  </div>
                </div>
                {model.badge && (
                  <div
                    className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider"
                    style={{ background: `${model.color}20`, color: model.color, border: `1px solid ${model.color}33` }}
                  >
                    {model.badge}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Model detail */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${selected.color}18`,
              border: `1px solid ${selected.color}33`,
              boxShadow: `0 0 30px ${selected.color}20`,
            }}
          >
            <selected.icon size={28} style={{ color: selected.color }} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold" style={{ color: selected.color }}>{selected.name}</h2>
              {selected.badge && (
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest"
                  style={{ background: `${selected.color}20`, color: selected.color, border: `1px solid ${selected.color}33` }}
                >
                  {selected.badge}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(107,143,168,0.7)" }}>
              {selected.description}
            </p>
          </div>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "CONTEXT WINDOW", value: selected.contextWindow, icon: Layers, color: selected.color },
            { label: "MAX OUTPUT", value: selected.outputTokens, icon: Zap, color: selected.color },
            { label: "COST (in/out per M)", value: selected.costPerMillion, icon: Clock, color: selected.color },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-xl"
              style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${s.color}15` }}
            >
              <s.icon size={14} style={{ color: `${s.color}80` }} className="mb-2" />
              <div className="text-[9px] tracking-widest mb-1" style={{ color: "rgba(107,143,168,0.4)" }}>{s.label}</div>
              <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Performance bars */}
        <div
          className="p-4 rounded-xl space-y-4"
          style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${selected.color}10` }}
        >
          <div className="text-[10px] tracking-widest" style={{ color: "rgba(107,143,168,0.5)" }}>PERFORMANCE PROFILE</div>
          <StatBar label="INTELLIGENCE" value={selected.intelligence} color={selected.color} />
          <StatBar label="SPEED" value={selected.speed} color={selected.color} />
        </div>

        {/* Strengths */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.7)", border: "1px solid rgba(0,212,255,0.06)" }}
        >
          <div className="text-[10px] tracking-widest mb-3" style={{ color: "rgba(107,143,168,0.5)" }}>BEST FOR</div>
          <div className="grid grid-cols-2 gap-2">
            {selected.strengths.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: `${selected.color}08`, border: `1px solid ${selected.color}15` }}
              >
                <ChevronRight size={10} style={{ color: selected.color }} />
                <span className="text-xs" style={{ color: "rgba(232,244,255,0.7)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model ID */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(6,18,34,0.5)", border: "1px solid rgba(0,212,255,0.06)" }}
        >
          <div className="text-[9px] tracking-widest mb-1" style={{ color: "rgba(107,143,168,0.4)" }}>MODEL ID</div>
          <code className="text-xs" style={{ color: selected.color }}>{selected.id}</code>
        </div>
      </div>
    </div>
  );
}
