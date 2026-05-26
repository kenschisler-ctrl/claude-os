"use client";
import { motion } from "framer-motion";
import React from "react";
import {
  MessageSquare, Bot, BarChart3, Terminal, Layers, Settings, Zap, Database, GitBranch, Radio,
  BookOpen, Target, BookMarked,
} from "lucide-react";

export type PanelId = "chat" | "agents" | "metrics" | "terminal" | "models" | "settings" | "workflows" | "memory" | "logs" | "deploy" | "journal" | "goals" | "guide";

const NAV: { id: PanelId; icon: React.ElementType; label: string; color: string; badge?: string }[] = [
  { id: "chat",      icon: MessageSquare, label: "Chat",      color: "#00d4ff" },
  { id: "agents",    icon: Bot,           label: "Agents",    color: "#8b5cf6", badge: "2" },
  { id: "journal",   icon: BookOpen,      label: "Journal",   color: "#8b5cf6" },
  { id: "goals",     icon: Target,        label: "Goals",     color: "#f59e0b" },
  { id: "guide",     icon: BookMarked,    label: "Guide",     color: "#ec4899" },
  { id: "workflows", icon: GitBranch,     label: "Flows",     color: "#10b981" },
  { id: "metrics",   icon: BarChart3,     label: "Analytics", color: "#f59e0b" },
  { id: "memory",    icon: Database,      label: "Memory",    color: "#f43f5e" },
  { id: "terminal",  icon: Terminal,      label: "Terminal",  color: "#00d4ff" },
  { id: "logs",      icon: Radio,         label: "Logs",      color: "#ec4899" },
  { id: "models",    icon: Layers,        label: "Models",    color: "#8b5cf6" },
  { id: "deploy",    icon: Zap,           label: "Deploy",    color: "#f59e0b" },
  { id: "settings",  icon: Settings,      label: "Config",    color: "#64748b" },
];

interface Props { active: PanelId; onNavigate: (id: PanelId) => void; }

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <nav
      className="relative z-20 flex flex-col w-[58px] border-r h-full py-2"
      style={{ background: "rgba(3,8,16,0.85)", borderColor: "rgba(0,212,255,0.07)", backdropFilter: "blur(20px)" }}
    >
      {/* Active indicator bar */}
      <div className="flex flex-col gap-0.5 flex-1 px-1.5">
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.94 }}
              className="relative flex flex-col items-center justify-center w-full py-2.5 rounded-xl group transition-all"
              style={{
                background: isActive ? `${item.color}14` : "transparent",
              }}
            >
              {/* Active left accent */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <Icon
                size={17}
                style={{ color: isActive ? item.color : "rgba(100,116,139,0.7)", strokeWidth: isActive ? 2 : 1.5 }}
              />
              <span
                className="text-[8px] mt-1 tracking-wider font-medium"
                style={{ color: isActive ? item.color : "rgba(100,116,139,0.5)" }}
              >
                {item.label.slice(0, 5).toUpperCase()}
              </span>

              {/* Badge */}
              {item.badge && (
                <span
                  className="absolute top-1 right-1 text-[7px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full"
                  style={{ background: item.color, color: "#000" }}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip */}
              <div
                className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap
                           pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl"
                style={{
                  background: "rgba(5,14,28,0.97)",
                  border: `1px solid ${item.color}30`,
                  color: item.color,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`,
                }}
              >
                {item.label}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45"
                  style={{ background: "rgba(5,14,28,0.97)", border: `1px solid ${item.color}30` }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom divider pulse */}
      <div className="px-3 py-2">
        <motion.div
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="h-px rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }}
        />
      </div>
    </nav>
  );
}
