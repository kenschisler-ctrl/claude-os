"use client";
import { motion } from "framer-motion";

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  status: "running" | "idle" | "paused" | "error";
  color: string;
  gradient: [string, string];
  symbol: string; // SVG path or emoji
  avatarType: "research" | "code" | "writer" | "crawler" | "brain" | "analyst" | "custom";
  task: string;
  progress: number;
  tokensUsed: number;
  uptime: string;
  model: string;
  logs: string[];
}

function ResearchAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Magnifying glass */}
      <circle cx="17" cy="17" r="9" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="17" cy="17" r="5" fill={`${color}20`} />
      <line x1="23" y1="23" x2="31" y2="31" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Data dots */}
      <circle cx="14" cy="17" r="1.5" fill={color} />
      <circle cx="17" cy="14" r="1.5" fill={color} opacity="0.7" />
      <circle cx="20" cy="17" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function CodeAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Code brackets */}
      <path d="M 14 12 L 7 20 L 14 28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 26 12 L 33 20 L 26 28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Slash */}
      <line x1="22" y1="11" x2="18" y2="29" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function WriterAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Document */}
      <rect x="10" y="8" width="18" height="22" rx="2.5" fill={`${color}18`} stroke={color} strokeWidth="1.5" />
      {/* Lines */}
      <line x1="14" y1="15" x2="24" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="19" x2="24" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="23" x2="20" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Pen tip */}
      <path d="M 26 26 L 30 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="30" r="2" fill={color} />
    </svg>
  );
}

function CrawlerAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Globe */}
      <circle cx="20" cy="20" r="12" fill="none" stroke={color} strokeWidth="1.8" />
      {/* Meridians */}
      <ellipse cx="20" cy="20" rx="6" ry="12" fill="none" stroke={color} strokeWidth="1.2" opacity="0.6" />
      {/* Parallels */}
      <line x1="8" y1="20" x2="32" y2="20" stroke={color} strokeWidth="1.2" opacity="0.6" />
      <line x1="10" y1="14" x2="30" y2="14" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="26" x2="30" y2="26" stroke={color} strokeWidth="1" opacity="0.4" />
      {/* Cursor dot */}
      <circle cx="20" cy="20" r="2.5" fill={color} />
    </svg>
  );
}

function BrainAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Neural network nodes */}
      {[
        [20, 10], [12, 18], [28, 18], [16, 28], [24, 28]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={color} opacity={1 - i * 0.1} />
      ))}
      {/* Connections */}
      {[
        [20,10,12,18], [20,10,28,18],
        [12,18,16,28], [28,18,24,28],
        [12,18,28,18], [16,28,24,28],
        [20,10,16,28]
      ].map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.2" opacity="0.35" />
      ))}
    </svg>
  );
}

function AnalystAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Chart bars */}
      <rect x="9"  y="22" width="6" height="10" rx="1.5" fill={color} opacity="0.6" />
      <rect x="17" y="15" width="6" height="17" rx="1.5" fill={color} opacity="0.8" />
      <rect x="25" y="10" width="6" height="22" rx="1.5" fill={color} />
      {/* Trend line */}
      <path d="M 10 23 L 18 16 L 26 12" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2 2" />
      {/* Arrow */}
      <path d="M 23 10 L 26 12 L 24 15" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CustomAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Hexagon */}
      <path
        d="M 20 8 L 31 14 L 31 26 L 20 32 L 9 26 L 9 14 Z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Inner spark */}
      <path d="M 20 14 L 22 19 L 27 20 L 22 21 L 20 26 L 18 21 L 13 20 L 18 19 Z" fill={color} />
    </svg>
  );
}

function AvatarGraphic({ type, color }: { type: AgentDef["avatarType"]; color: string }) {
  switch (type) {
    case "research": return <ResearchAvatar color={color} />;
    case "code":     return <CodeAvatar color={color} />;
    case "writer":   return <WriterAvatar color={color} />;
    case "crawler":  return <CrawlerAvatar color={color} />;
    case "brain":    return <BrainAvatar color={color} />;
    case "analyst":  return <AnalystAvatar color={color} />;
    default:         return <CustomAvatar color={color} />;
  }
}

interface AgentAvatarProps {
  agent: AgentDef;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  showStatus?: boolean;
}

const SIZE = { sm: 32, md: 44, lg: 60, xl: 80 };

export default function AgentAvatar({ agent, size = "md", showRing = true, showStatus = true }: AgentAvatarProps) {
  const px = SIZE[size];
  const isRunning = agent.status === "running";

  const statusColor = {
    running: "#10b981",
    idle:    "#7aa3c0",
    paused:  "#f59e0b",
    error:   "#f43f5e",
  }[agent.status];

  return (
    <div className="relative flex-shrink-0" style={{ width: px, height: px }}>
      {/* Outer animated ring (running only) */}
      {showRing && isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            border: `1.5px solid ${agent.color}`,
            borderRadius: "50%",
          }}
        />
      )}

      {/* Avatar circle */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${agent.gradient[0]}30, ${agent.gradient[1]}18)`,
          border: `1.5px solid ${agent.color}40`,
          boxShadow: isRunning ? `0 0 16px ${agent.color}35, inset 0 0 12px ${agent.color}10` : "none",
        }}
      >
        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{ background: `radial-gradient(circle at 50% 30%, ${agent.color}25, transparent 70%)` }}
        />
        <div style={{ width: "65%", height: "65%", position: "relative", zIndex: 1 }}>
          <AvatarGraphic type={agent.avatarType} color={agent.color} />
        </div>
      </div>

      {/* Status badge */}
      {showStatus && (
        <div
          className="absolute rounded-full border-2"
          style={{
            width: Math.max(8, px * 0.22),
            height: Math.max(8, px * 0.22),
            background: statusColor,
            borderColor: "#02040a",
            bottom: 0,
            right: 0,
            boxShadow: isRunning ? `0 0 6px ${statusColor}` : "none",
          }}
        >
          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ background: statusColor }}
            />
          )}
        </div>
      )}
    </div>
  );
}
