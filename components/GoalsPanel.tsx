"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Archive, Trash2, ChevronDown, BookOpen, Target, X, Flag, Mic, MicOff } from "lucide-react";
import { vaultSaveGoals, type Goal } from "@/lib/vault";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

const PRIORITIES = [
  { value: "high",   label: "High",   color: "#f43f5e", icon: "🔴" },
  { value: "medium", label: "Medium", color: "#f59e0b", icon: "🟡" },
  { value: "low",    label: "Low",    color: "#10b981", icon: "🟢" },
] as const;

const STATUS_TABS = ["active", "completed", "archived"] as const;

function newGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    priority: "medium",
    status: "active",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function SavedPill({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
        >
          <BookOpen size={9} /> Saved to vault
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function GoalsPanel() {
  const [goals, setGoals]         = useState<Goal[]>([]);
  const [tab, setTab]             = useState<typeof STATUS_TABS[number]>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft]         = useState<Goal>(newGoal());
  const [savedPill, setSavedPill] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const draftTitleRef = useRef(draft.title);
  useEffect(() => { draftTitleRef.current = draft.title; }, [draft.title]);

  const { state: micState, error: micError, isSupported: micSupported, toggle: toggleMic, stop: stopMic } =
    useSpeechRecognition({
      continuous: false,
      interimResults: false,
      onTranscript: (transcript, isFinal) => {
        if (isFinal) {
          const base = draftTitleRef.current;
          setDraft(d => ({ ...d, title: base ? base.trimEnd() + " " + transcript : transcript }));
        }
      },
    });

  const isListening = micState === "listening";

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("claude-os-goals");
      if (saved) setGoals(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = useCallback((updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem("claude-os-goals", JSON.stringify(updated));
    // Fire-and-forget vault save
    vaultSaveGoals(updated).then(() => {
      setSavedPill(true);
      setTimeout(() => setSavedPill(false), 2500);
    });
  }, []);

  const addGoal = () => {
    if (!draft.title.trim()) return;
    stopMic();
    persist([{ ...draft, createdAt: new Date().toISOString() }, ...goals]);
    setDraft(newGoal());
    setShowCreate(false);
  };

  const closeCreate = () => { stopMic(); setShowCreate(false); };

  const complete = (id: string) =>
    persist(goals.map(g => g.id === id ? { ...g, status: "completed", completedAt: new Date().toISOString() } : g));

  const reactivate = (id: string) =>
    persist(goals.map(g => g.id === id ? { ...g, status: "active", completedAt: undefined } : g));

  const archive = (id: string) =>
    persist(goals.map(g => g.id === id ? { ...g, status: "archived" } : g));

  const remove = (id: string) => persist(goals.filter(g => g.id !== id));

  const visible = goals.filter(g => g.status === tab);
  const counts  = {
    active:    goals.filter(g => g.status === "active").length,
    completed: goals.filter(g => g.status === "completed").length,
    archived:  goals.filter(g => g.status === "archived").length,
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.6)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <Target size={15} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <p className="text-[12px] font-bold tracking-widest" style={{ color: "#f59e0b" }}>GOALS</p>
            <p className="text-[10px]" style={{ color: "rgba(122,163,192,0.45)" }}>
              {counts.active} active · {counts.completed} done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SavedPill visible={savedPill} />
          <span className="text-[9px] flex items-center gap-1" style={{ color: "rgba(16,185,129,0.5)" }}>
            <BookOpen size={9} /> auto-saving to vault
          </span>
          <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b" }}>
            <Plus size={12} /> New Goal
          </motion.button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0 px-5 pt-3 flex-shrink-0">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="relative px-4 py-2 text-[11px] font-semibold tracking-wide capitalize transition-all"
            style={{ color: tab === t ? "#f59e0b" : "rgba(122,163,192,0.45)" }}>
            {t}
            <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded-full"
              style={{ background: tab === t ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.04)", color: tab === t ? "#f59e0b" : "rgba(122,163,192,0.4)" }}>
              {counts[t]}
            </span>
            {tab === t && (
              <motion.div layoutId="goal-tab-line"
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Goal list ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visible.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-4xl opacity-30">🎯</div>
              <p className="text-sm" style={{ color: "rgba(122,163,192,0.35)" }}>
                {tab === "active" ? "No active goals — add one above" : `No ${tab} goals yet`}
              </p>
            </motion.div>
          )}

          {visible.map((goal, i) => {
            const pri = PRIORITIES.find(p => p.value === goal.priority)!;
            const isExpanded = expandedId === goal.id;

            return (
              <motion.div key={goal.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  background: "rgba(7,21,38,0.75)",
                  border: `1px solid ${isExpanded ? `${pri.color}30` : "rgba(0,212,255,0.07)"}`,
                  boxShadow: isExpanded ? `0 4px 24px ${pri.color}10` : "none",
                }}>

                {/* Row */}
                <div className="flex items-start gap-3 px-4 py-3.5"
                  onClick={() => setExpandedId(isExpanded ? null : goal.id)}>

                  {/* Complete toggle */}
                  <button onClick={e => { e.stopPropagation(); goal.status === "active" ? complete(goal.id) : reactivate(goal.id); }}
                    className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
                    {goal.status === "completed"
                      ? <CheckCircle2 size={18} style={{ color: "#10b981" }} />
                      : <Circle size={18} style={{ color: "rgba(122,163,192,0.3)" }} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${goal.status === "completed" ? "line-through opacity-50" : ""}`}
                        style={{ color: "#f0f8ff" }}>
                        {goal.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: `${pri.color}15`, color: pri.color }}>
                        {pri.icon} {pri.label}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(122,163,192,0.55)" }}>
                        {goal.description}
                      </p>
                    )}
                    <p className="text-[9px] mt-1" style={{ color: "rgba(122,163,192,0.3)" }}>
                      Added {new Date(goal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {goal.completedAt && ` · Completed ${new Date(goal.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </p>
                  </div>

                  {/* Expand chevron */}
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="flex-shrink-0">
                    <ChevronDown size={14} style={{ color: "rgba(122,163,192,0.3)" }} />
                  </motion.div>
                </div>

                {/* Expanded actions */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden border-t"
                      style={{ borderColor: "rgba(0,212,255,0.07)" }}>
                      <div className="flex items-center gap-2 px-4 py-2.5">
                        {goal.status === "active" && (
                          <ActionChip onClick={() => { complete(goal.id); setExpandedId(null); }} color="#10b981" icon={<CheckCircle2 size={11} />}>
                            Complete
                          </ActionChip>
                        )}
                        {goal.status === "completed" && (
                          <ActionChip onClick={() => reactivate(goal.id)} color="#f59e0b" icon={<Circle size={11} />}>
                            Reactivate
                          </ActionChip>
                        )}
                        {goal.status !== "archived" && (
                          <ActionChip onClick={() => { archive(goal.id); setExpandedId(null); }} color="#64748b" icon={<Archive size={11} />}>
                            Archive
                          </ActionChip>
                        )}
                        <ActionChip onClick={() => remove(goal.id)} color="#f43f5e" icon={<Trash2 size={11} />}>
                          Delete
                        </ActionChip>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Create goal modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(2,4,10,0.88)", backdropFilter: "blur(12px)" }}
            onClick={closeCreate}>
            <motion.div
              initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-[440px] rounded-2xl p-7"
              style={{ background: "rgba(5,14,28,0.98)", border: "1px solid rgba(245,158,11,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(245,158,11,0.06)" }}>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-bold text-base" style={{ color: "#f59e0b" }}>New Goal</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(122,163,192,0.45)" }}>Saves automatically to your Obsidian vault</p>
                </div>
                <button onClick={closeCreate} style={{ color: "rgba(122,163,192,0.4)" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[9px] tracking-widest font-semibold" style={{ color: "rgba(122,163,192,0.4)" }}>GOAL</label>
                    {micSupported && (
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={toggleMic}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-medium transition-all"
                        style={{
                          background: isListening ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.1)",
                          border: `1px solid ${isListening ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.25)"}`,
                          color: isListening ? "#f87171" : "#f59e0b",
                          boxShadow: isListening ? "0 0 10px rgba(239,68,68,0.2)" : "none",
                        }}>
                        {isListening ? <><MicOff size={9} /> Stop</> : <><Mic size={9} /> Dictate</>}
                      </motion.button>
                    )}
                  </div>
                  <input
                    autoFocus
                    value={draft.title}
                    onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addGoal()}
                    placeholder={isListening ? "Listening… speak your goal" : "What do you want to achieve?"}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: "rgba(7,21,38,0.8)",
                      border: `1px solid ${isListening ? "rgba(239,68,68,0.35)" : "rgba(0,212,255,0.12)"}`,
                      color: "rgba(240,248,255,0.9)",
                    }}
                  />
                  {micError && (
                    <p className="text-[10px] mt-1" style={{ color: "#f87171" }}>⚠ {micError}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] tracking-widest font-semibold block mb-1.5" style={{ color: "rgba(122,163,192,0.4)" }}>DETAILS (optional)</label>
                  <textarea
                    value={draft.description ?? ""}
                    onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                    placeholder="Add context, milestones, or notes…"
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "rgba(7,21,38,0.8)", border: "1px solid rgba(0,212,255,0.12)", color: "rgba(240,248,255,0.85)" }}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[9px] tracking-widest font-semibold block mb-1.5" style={{ color: "rgba(122,163,192,0.4)" }}>PRIORITY</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button key={p.value} onClick={() => setDraft(d => ({ ...d, priority: p.value }))}
                        className="flex-1 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                        style={{
                          background: draft.priority === p.value ? `${p.color}20` : "rgba(7,21,38,0.6)",
                          border: `1px solid ${draft.priority === p.value ? `${p.color}50` : "rgba(0,212,255,0.08)"}`,
                          color: draft.priority === p.value ? p.color : "rgba(122,163,192,0.5)",
                        }}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button onClick={closeCreate}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(122,163,192,0.5)" }}>
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={addGoal}
                    disabled={!draft.title.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30"
                    style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.45), rgba(251,191,36,0.3))", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24", boxShadow: "0 0 20px rgba(245,158,11,0.15)" }}>
                    <Flag size={14} /> Add Goal
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

function ActionChip({ children, onClick, color, icon }: { children: React.ReactNode; onClick: () => void; color: string; icon: React.ReactNode }) {
  return (
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
      style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
      {icon}{children}
    </motion.button>
  );
}
