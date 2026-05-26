"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, FolderOpen, Rocket, Check, ExternalLink, Loader2,
  Eye, EyeOff, ChevronRight, ChevronLeft, Bot, Zap, Cpu,
  AlertTriangle, CheckCircle2, HelpCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  available: boolean;
  status: string;
}

interface SetupData {
  config: {
    setupComplete: boolean;
    vaultPath: string;
    vaultFolder: string;
    hasApiKey: boolean;
    enabledAgents: string[];
  };
  detected: {
    vaultPaths: string[];
    agents: AgentInfo[];
  };
}

interface Props {
  onComplete: () => void;
}

type StepId = "welcome" | "apikey" | "vault" | "review";
const STEPS: StepId[] = ["welcome", "apikey", "vault", "review"];

// ── Main component ────────────────────────────────────────────────────────────

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep]         = useState<StepId>("welcome");
  const [apiKey, setApiKey]     = useState("");
  const [showKey, setShowKey]   = useState(false);
  const [vault, setVault]       = useState("");
  const [customVault, setCustomVault] = useState("");
  const [data, setData]         = useState<SetupData | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    fetch("/api/setup")
      .then(r => r.json())
      .then((d: SetupData) => {
        setData(d);
        if (d.detected.vaultPaths.length) setVault(d.detected.vaultPaths[0]);
      });
  }, []);

  const stepIdx = STEPS.indexOf(step);
  function next() { if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]); }
  function back() { if (stepIdx > 0) setStep(STEPS[stepIdx - 1]); }

  async function launch() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anthropicApiKey: apiKey.trim() || undefined,
          vaultPath:       customVault.trim() || vault || undefined,
          enabledAgents:   data?.detected.agents.filter(a => a.available).map(a => a.id) ?? ["claude"],
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      setDone(true);
      setTimeout(onComplete, 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const resolvedVault = customVault.trim() || vault;
  const hasKey = !!apiKey.trim() || (data?.config.hasApiKey ?? false);

  if (done) return <SuccessOverlay />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(2,4,10,0.96)", backdropFilter: "blur(24px)" }}>

      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: [
          "radial-gradient(ellipse 60% 50% at 25% 50%, rgba(0,212,255,0.025) 0%, transparent 100%)",
          "radial-gradient(ellipse 50% 50% at 75% 50%, rgba(139,92,246,0.025) 0%, transparent 100%)",
        ].join(", "),
      }} />

      {/* Progress dots */}
      <AnimatePresence>
        {step !== "welcome" && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-10 flex items-center gap-2.5">
            {(["apikey", "vault", "review"] as StepId[]).map((s, i) => {
              const past    = stepIdx > i + 1;
              const current = step === s;
              return (
                <div key={s} className="flex items-center gap-2.5">
                  <motion.div animate={{ scale: current ? 1.3 : 1 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: past ? "#10b981" : current ? "#00d4ff" : "rgba(255,255,255,0.1)" }} />
                  {i < 2 && (
                    <div className="w-12 h-px rounded-full"
                      style={{ background: past ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.07)" }} />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 28, scale: 0.975 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -28, scale: 0.975 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[540px] rounded-3xl"
          style={{
            background: "linear-gradient(160deg, rgba(7,18,34,0.99), rgba(4,10,22,0.99))",
            border: "1px solid rgba(0,212,255,0.09)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.015) inset",
          }}>

          {step === "welcome" && <WelcomeStep onNext={next} />}

          {step === "apikey" && (
            <ApiKeyStep
              value={apiKey} visible={showKey}
              onToggle={() => setShowKey(v => !v)}
              onChange={setApiKey}
              hasEnvKey={data?.config.hasApiKey ?? false}
              onNext={next} onBack={back}
            />
          )}

          {step === "vault" && (
            <VaultStep
              detected={data?.detected.vaultPaths ?? []}
              selected={vault} custom={customVault}
              onSelect={setVault} onCustom={setCustomVault}
              onNext={next} onBack={back}
            />
          )}

          {step === "review" && (
            <ReviewStep
              hasKey={hasKey}
              vault={resolvedVault}
              agents={data?.detected.agents ?? []}
              saving={saving} error={error}
              onLaunch={launch} onBack={back}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Step: Welcome ─────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="p-12 flex flex-col items-center text-center gap-6">
      {/* Logo */}
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.1))",
            border: "1px solid rgba(0,212,255,0.25)",
            boxShadow: "0 0 40px rgba(0,212,255,0.12)",
          }}>
          <Cpu size={36} style={{ color: "#00d4ff" }} />
        </div>
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl"
          style={{ border: "1px solid rgba(0,212,255,0.4)" }} />
      </motion.div>

      <div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-2xl font-bold tracking-[0.2em]" style={{ color: "#00d4ff" }}>
          CLAUDE OS
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="text-sm mt-2 font-medium" style={{ color: "rgba(122,163,192,0.7)" }}>
          Your personal AI command center
        </motion.p>
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
        className="text-[13px] leading-relaxed max-w-[340px]"
        style={{ color: "rgba(122,163,192,0.5)" }}>
        Let's get you set up in 3 quick steps. Works on any computer — macOS, Linux, Windows.
      </motion.p>

      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
        onClick={onNext}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        className="mt-2 flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm"
        style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(139,92,246,0.15))",
          border: "1px solid rgba(0,212,255,0.35)",
          color: "#00d4ff",
          boxShadow: "0 0 30px rgba(0,212,255,0.1)",
        }}>
        Get Started <ChevronRight size={16} />
      </motion.button>
    </div>
  );
}

// ── Step: API Key ─────────────────────────────────────────────────────────────

function ApiKeyStep({
  value, visible, onToggle, onChange, hasEnvKey, onNext, onBack,
}: {
  value: string; visible: boolean; onToggle: () => void;
  onChange: (v: string) => void; hasEnvKey: boolean;
  onNext: () => void; onBack: () => void;
}) {
  const canProceed = !!value.trim() || hasEnvKey;

  return (
    <div className="p-10">
      <StepHeader icon={<Key size={20} style={{ color: "#8b5cf6" }} />}
        iconBg="rgba(139,92,246,0.12)" iconBorder="rgba(139,92,246,0.25)"
        title="Anthropic API Key" subtitle="Powers the chat and all AI features" />

      <div className="mt-8 space-y-4">
        {hasEnvKey && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <CheckCircle2 size={14} style={{ color: "#34d399" }} />
            <span className="text-[12px]" style={{ color: "#34d399" }}>
              API key detected from environment — you're all set
            </span>
          </div>
        )}

        <div>
          <label className="text-[9px] tracking-widest font-semibold block mb-2"
            style={{ color: "rgba(122,163,192,0.4)" }}>
            {hasEnvKey ? "OR ENTER A DIFFERENT KEY" : "PASTE YOUR KEY"}
          </label>
          <div className="relative">
            <input
              type={visible ? "text" : "password"}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="sk-ant-api03-…"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11 font-mono"
              style={{
                background: "rgba(7,21,38,0.8)",
                border: `1px solid ${value.trim() ? "rgba(139,92,246,0.35)" : "rgba(0,212,255,0.1)"}`,
                color: "rgba(240,248,255,0.9)",
              }}
            />
            <button onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
              {visible ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80"
          style={{ color: "rgba(139,92,246,0.7)" }}>
          <ExternalLink size={11} /> Get your key at console.anthropic.com
        </a>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} canNext={canProceed}
        nextLabel={canProceed ? "Continue" : "Enter a key to continue"} />
    </div>
  );
}

// ── Step: Vault ───────────────────────────────────────────────────────────────

function VaultStep({
  detected, selected, custom, onSelect, onCustom, onNext, onBack,
}: {
  detected: string[]; selected: string; custom: string;
  onSelect: (v: string) => void; onCustom: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="p-10">
      <StepHeader icon={<FolderOpen size={20} style={{ color: "#10b981" }} />}
        iconBg="rgba(16,185,129,0.12)" iconBorder="rgba(16,185,129,0.25)"
        title="Obsidian Vault" subtitle="Save chats, journal entries, and goals as Markdown — optional" />

      <div className="mt-8 space-y-3">
        {detected.length > 0 ? (
          <>
            <label className="text-[9px] tracking-widest font-semibold block mb-3"
              style={{ color: "rgba(122,163,192,0.4)" }}>
              DETECTED VAULTS
            </label>
            {detected.map(p => (
              <button key={p} onClick={() => { onSelect(p); onCustom(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: selected === p && !custom ? "rgba(16,185,129,0.08)" : "rgba(7,21,38,0.6)",
                  border: `1px solid ${selected === p && !custom ? "rgba(16,185,129,0.35)" : "rgba(0,212,255,0.08)"}`,
                }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.1)" }}>
                  <FolderOpen size={13} style={{ color: "#10b981" }} />
                </div>
                <span className="text-[12px] font-mono truncate" style={{ color: "rgba(240,248,255,0.75)" }}>{p}</span>
                {selected === p && !custom && (
                  <CheckCircle2 size={14} className="ml-auto flex-shrink-0" style={{ color: "#10b981" }} />
                )}
              </button>
            ))}
          </>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <HelpCircle size={13} style={{ color: "rgba(245,158,11,0.7)" }} />
            <span className="text-[11px]" style={{ color: "rgba(245,158,11,0.7)" }}>No vault found automatically</span>
          </div>
        )}

        <div className="pt-1">
          <label className="text-[9px] tracking-widest font-semibold block mb-2"
            style={{ color: "rgba(122,163,192,0.4)" }}>
            CUSTOM PATH
          </label>
          <input
            value={custom}
            onChange={e => { onCustom(e.target.value); if (e.target.value) onSelect(""); }}
            placeholder="/path/to/your/ObsidianVault"
            className="w-full px-4 py-3 rounded-xl text-[12px] outline-none font-mono"
            style={{
              background: "rgba(7,21,38,0.8)",
              border: `1px solid ${custom ? "rgba(16,185,129,0.3)" : "rgba(0,212,255,0.1)"}`,
              color: "rgba(240,248,255,0.8)",
            }}
          />
        </div>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} canNext
        nextLabel="Continue" skipLabel="Skip — no vault" onSkip={() => { onSelect(""); onCustom(""); onNext(); }} />
    </div>
  );
}

// ── Step: Review & Launch ─────────────────────────────────────────────────────

function ReviewStep({
  hasKey, vault, agents, saving, error, onLaunch, onBack,
}: {
  hasKey: boolean; vault: string; agents: AgentInfo[];
  saving: boolean; error: string | null;
  onLaunch: () => void; onBack: () => void;
}) {
  const agentIcons: Record<string, React.ReactNode> = {
    claude:     <Bot size={14} style={{ color: "#8b5cf6" }} />,
    "claude-cli": <Zap size={14} style={{ color: "#00d4ff" }} />,
    ollama:     <Cpu size={14} style={{ color: "#10b981" }} />,
  };

  return (
    <div className="p-10">
      <StepHeader icon={<Rocket size={20} style={{ color: "#f59e0b" }} />}
        iconBg="rgba(245,158,11,0.12)" iconBorder="rgba(245,158,11,0.25)"
        title="Ready to Launch" subtitle="Here's your configuration" />

      <div className="mt-8 space-y-3">
        {/* API Key status */}
        <SummaryRow
          icon={<Key size={13} />}
          label="Anthropic API Key"
          value={hasKey ? "Configured" : "Not set — chat won't work"}
          ok={hasKey}
        />

        {/* Vault */}
        <SummaryRow
          icon={<FolderOpen size={13} />}
          label="Obsidian Vault"
          value={vault || "Skipped — no vault sync"}
          ok={!!vault}
          neutral={!vault}
        />

        {/* Detected agents */}
        <div className="rounded-xl p-4 space-y-2.5"
          style={{ background: "rgba(7,21,38,0.6)", border: "1px solid rgba(0,212,255,0.07)" }}>
          <p className="text-[9px] tracking-widest font-semibold" style={{ color: "rgba(122,163,192,0.4)" }}>
            DETECTED AGENTS
          </p>
          {agents.map(a => (
            <div key={a.id} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: a.available ? "rgba(16,185,129,0.08)" : "rgba(100,116,139,0.08)" }}>
                {agentIcons[a.id] ?? <Bot size={12} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium" style={{ color: a.available ? "rgba(240,248,255,0.8)" : "rgba(122,163,192,0.35)" }}>
                  {a.name}
                </p>
                <p className="text-[9px]" style={{ color: "rgba(122,163,192,0.35)" }}>{a.description}</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                style={{
                  background: a.available ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.08)",
                  color:      a.available ? "#34d399"              : "rgba(100,116,139,0.5)",
                  border:     `1px solid ${a.available ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.12)"}`,
                }}>
                {a.available ? "ready" : a.status.replace("-", " ")}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={13} style={{ color: "#f87171" }} />
            <span className="text-[11px]" style={{ color: "#f87171" }}>{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-8">
        <button onClick={onBack} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-30"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(122,163,192,0.5)" }}>
          <ChevronLeft size={15} /> Back
        </button>
        <motion.button onClick={onLaunch} disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.4), rgba(251,191,36,0.25))",
            border: "1px solid rgba(245,158,11,0.45)",
            color: "#fbbf24",
            boxShadow: "0 0 30px rgba(245,158,11,0.12)",
          }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Rocket size={15} />}
          {saving ? "Saving…" : "Launch CLAUDE OS"}
        </motion.button>
      </div>
    </div>
  );
}

// ── Success overlay ───────────────────────────────────────────────────────────

function SuccessOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(2,4,10,0.97)" }}>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.4)", boxShadow: "0 0 50px rgba(16,185,129,0.2)" }}>
          <Check size={36} style={{ color: "#10b981" }} />
        </div>
        <p className="text-xl font-bold tracking-widest" style={{ color: "#10b981" }}>ALL SET</p>
        <p className="text-sm" style={{ color: "rgba(122,163,192,0.5)" }}>Launching CLAUDE OS…</p>
      </motion.div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function StepHeader({
  icon, iconBg, iconBorder, title, subtitle,
}: {
  icon: React.ReactNode; iconBg: string; iconBorder: string; title: string; subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-base" style={{ color: "rgba(240,248,255,0.9)" }}>{title}</p>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(122,163,192,0.5)" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function StepFooter({
  onBack, onNext, canNext, nextLabel, skipLabel, onSkip,
}: {
  onBack: () => void; onNext: () => void; canNext: boolean;
  nextLabel: string; skipLabel?: string; onSkip?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mt-8">
      <button onClick={onBack}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-all"
        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(122,163,192,0.5)" }}>
        <ChevronLeft size={15} /> Back
      </button>

      {skipLabel && onSkip && (
        <button onClick={onSkip}
          className="px-4 py-2.5 rounded-xl text-[12px] transition-all"
          style={{ color: "rgba(122,163,192,0.4)", background: "transparent" }}>
          {skipLabel}
        </button>
      )}

      <motion.button onClick={onNext} disabled={!canNext}
        whileHover={canNext ? { scale: 1.02 } : {}} whileTap={canNext ? { scale: 0.97 } : {}}
        className="ml-auto flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30 transition-all"
        style={{
          background: canNext ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${canNext ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.06)"}`,
          color: canNext ? "#00d4ff" : "rgba(122,163,192,0.3)",
        }}>
        {nextLabel} <ChevronRight size={15} />
      </motion.button>
    </div>
  );
}

function SummaryRow({
  icon, label, value, ok, neutral,
}: {
  icon: React.ReactNode; label: string; value: string; ok: boolean; neutral?: boolean;
}) {
  const color = neutral ? "rgba(122,163,192,0.4)" : ok ? "#34d399" : "#f87171";
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "rgba(7,21,38,0.6)", border: "1px solid rgba(0,212,255,0.07)" }}>
      <span style={{ color: "rgba(122,163,192,0.4)" }}>{icon}</span>
      <span className="text-[12px] flex-shrink-0" style={{ color: "rgba(122,163,192,0.6)" }}>{label}</span>
      <span className="ml-auto text-[11px] font-medium truncate max-w-[220px] text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
