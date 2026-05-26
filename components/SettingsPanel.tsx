"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Shield, Palette, Bell, Save, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4-6");
  const [theme, setTheme] = useState("cyber-dark");
  const [notifications, setNotifications] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [maxTokens, setMaxTokens] = useState(4096);

  const saveSettings = () => {
    localStorage.setItem("claude-os-settings", JSON.stringify({
      apiKey, defaultModel, theme, notifications, streamingEnabled, maxTokens,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const MODELS = ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"];
  const THEMES = ["cyber-dark", "matrix-green", "void-purple", "solar-red"];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: "rgba(4,13,26,0.6)", border: "1px solid rgba(107,143,168,0.1)" }}
      >
        <div>
          <div className="text-xs font-bold tracking-widest" style={{ color: "rgba(107,143,168,0.8)" }}>CONFIGURATION</div>
          <div className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.4)" }}>CLAUDE OS system settings</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
          style={{
            background: saved ? "rgba(0,255,135,0.15)" : "rgba(0,212,255,0.15)",
            border: `1px solid ${saved ? "rgba(0,255,135,0.4)" : "rgba(0,212,255,0.3)"}`,
            color: saved ? "#00ff87" : "#00d4ff",
            transition: "all 0.3s",
          }}
        >
          {saved ? <CheckCircle size={12} /> : <Save size={12} />}
          {saved ? "SAVED!" : "SAVE CONFIG"}
        </motion.button>
      </div>

      {/* API Key */}
      <Section icon={Key} color="#00d4ff" title="API CREDENTIALS">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] tracking-wider mb-1.5" style={{ color: "rgba(107,143,168,0.6)" }}>
              ANTHROPIC API KEY
            </label>
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center rounded-lg overflow-hidden"
                style={{ background: "rgba(6,18,34,0.8)", border: "1px solid rgba(0,212,255,0.15)" }}
              >
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="flex-1 px-3 py-2 bg-transparent text-xs outline-none"
                  style={{ color: "rgba(232,244,255,0.8)", fontFamily: "monospace" }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2"
                  style={{ color: "rgba(107,143,168,0.4)" }}
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <p className="text-[9px] mt-1" style={{ color: "rgba(107,143,168,0.4)" }}>
              Key is stored in .env.local — set ANTHROPIC_API_KEY in your environment for production
            </p>
          </div>
        </div>
      </Section>

      {/* Model defaults */}
      <Section icon={Shield} color="#7b2fff" title="MODEL DEFAULTS">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] tracking-wider mb-1.5" style={{ color: "rgba(107,143,168,0.6)" }}>
              DEFAULT MODEL
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => setDefaultModel(m)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all"
                  style={{
                    background: defaultModel === m ? "rgba(123,47,255,0.15)" : "rgba(6,18,34,0.5)",
                    border: `1px solid ${defaultModel === m ? "rgba(123,47,255,0.4)" : "rgba(0,212,255,0.06)"}`,
                    color: defaultModel === m ? "#7b2fff" : "rgba(107,143,168,0.7)",
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: defaultModel === m ? "#7b2fff" : "rgba(107,143,168,0.3)" }} />
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-wider mb-1.5" style={{ color: "rgba(107,143,168,0.6)" }}>
              MAX OUTPUT TOKENS: <span style={{ color: "#7b2fff" }}>{maxTokens.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={1024}
              max={32768}
              step={1024}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#7b2fff" }}
            />
            <div className="flex justify-between text-[9px]" style={{ color: "rgba(107,143,168,0.3)" }}>
              <span>1K</span><span>32K</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} color="#ff2d9b" title="APPEARANCE">
        <div>
          <label className="block text-[10px] tracking-wider mb-2" style={{ color: "rgba(107,143,168,0.6)" }}>
            COLOR THEME
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const themeColors: Record<string, string> = {
                "cyber-dark": "#00d4ff",
                "matrix-green": "#00ff87",
                "void-purple": "#7b2fff",
                "solar-red": "#ff2d9b",
              };
              const c = themeColors[t];
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                  style={{
                    background: theme === t ? `${c}15` : "rgba(6,18,34,0.5)",
                    border: `1px solid ${theme === t ? `${c}40` : "rgba(0,212,255,0.06)"}`,
                    color: theme === t ? c : "rgba(107,143,168,0.7)",
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ background: c, boxShadow: theme === t ? `0 0 8px ${c}` : "none" }} />
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Behavior */}
      <Section icon={Bell} color="#ffb800" title="BEHAVIOR">
        <div className="space-y-3">
          <Toggle label="Enable Streaming" description="Stream AI responses token-by-token" value={streamingEnabled} onChange={setStreamingEnabled} color="#ffb800" />
          <Toggle label="Notifications" description="Agent completion and error alerts" value={notifications} onChange={setNotifications} color="#ffb800" />
        </div>
      </Section>

      {/* .env hint */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "rgba(0,212,255,0.04)", border: "1px dashed rgba(0,212,255,0.15)" }}
      >
        <div className="text-[10px] tracking-widest mb-2" style={{ color: "rgba(0,212,255,0.5)" }}>QUICK SETUP</div>
        <code className="text-[11px] block" style={{ color: "rgba(107,143,168,0.7)", fontFamily: "monospace" }}>
          # In /home/kens_spark/claude-os/.env.local<br />
          ANTHROPIC_API_KEY=sk-ant-api03-...
        </code>
      </div>
    </div>
  );
}

function Section({ icon: Icon, color, title, children }: { icon: React.ElementType; color: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl"
      style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${color}15` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={13} style={{ color }} />
        <span className="text-[10px] tracking-widest font-bold" style={{ color }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function Toggle({ label, description, value, onChange, color }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs" style={{ color: "rgba(232,244,255,0.7)" }}>{label}</div>
        <div className="text-[9px]" style={{ color: "rgba(107,143,168,0.4)" }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-10 h-5 rounded-full transition-all relative"
        style={{
          background: value ? `${color}44` : "rgba(255,255,255,0.06)",
          border: `1px solid ${value ? `${color}66` : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full"
          style={{ background: value ? color : "rgba(107,143,168,0.4)", boxShadow: value ? `0 0 8px ${color}` : "none" }}
        />
      </button>
    </div>
  );
}
