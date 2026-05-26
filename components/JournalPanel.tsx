"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send, ChevronLeft, ChevronRight, Clock, FileText, Loader2, Mic, MicOff } from "lucide-react";
import { vaultSaveJournal } from "@/lib/vault";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatDisplayDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  const today = todayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (iso === today)     return "Today";
  if (iso === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function prevDay(iso: string) {
  return new Date(new Date(iso + "T12:00:00").getTime() - 86400000).toISOString().slice(0, 10);
}
function nextDay(iso: string) {
  return new Date(new Date(iso + "T12:00:00").getTime() + 86400000).toISOString().slice(0, 10);
}

interface Entry { id: string; time: string; text: string; }

export default function JournalPanel() {
  const [date, setDate]             = useState(todayISO());
  const [text, setText]             = useState("");
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [saving, setSaving]         = useState(false);
  const [savedAt, setSavedAt]       = useState<string | null>(null);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);
  const textRef                     = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const { state: micState, error: micError, isSupported: micSupported, toggle: toggleMic, stop: stopMic } =
    useSpeechRecognition({
      continuous: true,
      interimResults: true,
      onTranscript: (transcript, isFinal) => {
        if (isFinal) {
          const base = textRef.current;
          const joined = base ? base.trimEnd() + " " + transcript : transcript;
          setText(joined);
          setInterimText("");
          setTimeout(() => autoGrow(), 0);
        } else {
          setInterimText(transcript);
        }
      },
      onEnd: () => setInterimText(""),
    });

  const isListening = micState === "listening";

  // Persist entries per-date in localStorage
  const storageKey = `journal-${date}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setEntries(saved ? JSON.parse(saved) : []);
    } catch {
      setEntries([]);
    }
    setText("");
  }, [date, storageKey]);

  const saveEntry = useCallback(async () => {
    stopMic();
    setInterimText("");
    const trimmed = text.trim();
    if (!trimmed || saving) return;

    const entry: Entry = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      text: trimmed,
    };

    const updated = [...entries, entry];
    setEntries(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Save to vault
    setSaving(true);
    setSaveError(null);
    try {
      const res = await vaultSaveJournal(trimmed);
      if (res.ok) {
        setSavedAt(entry.time);
      } else {
        setSaveError(res.error ?? "Vault write failed");
      }
    } finally {
      setSaving(false);
    }
  }, [text, entries, saving, storageKey]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      saveEntry();
    }
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 260) + "px";
  };

  const isToday = date === todayISO();

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.6)" }}>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <BookOpen size={15} style={{ color: "#8b5cf6" }} />
          </div>
          <div>
            <p className="text-[12px] font-bold tracking-widest" style={{ color: "#8b5cf6" }}>JOURNAL</p>
            <p className="text-[10px]" style={{ color: "rgba(122,163,192,0.45)" }}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} today · auto-saving to vault
            </p>
          </div>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-1">
          <NavButton onClick={() => setDate(prevDay(date))} icon={<ChevronLeft size={14} />} />
          <div className="px-4 py-1.5 rounded-lg text-[12px] font-semibold min-w-[120px] text-center"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
            {formatDisplayDate(date)}
          </div>
          <NavButton onClick={() => setDate(nextDay(date))} icon={<ChevronRight size={14} />} disabled={isToday} />
        </div>
      </div>

      {/* ── Entries ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {entries.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl opacity-20">📓</div>
            <p className="text-sm" style={{ color: "rgba(122,163,192,0.35)" }}>
              {isToday ? "Nothing written yet — start below" : "No entries for this day"}
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <motion.div key={entry.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl p-5 relative group"
              style={{ background: "rgba(7,21,38,0.75)", border: "1px solid rgba(139,92,246,0.1)" }}>

              {/* Vault saved badge */}
              <div className="flex items-center gap-1.5 mb-3">
                <Clock size={10} style={{ color: "rgba(139,92,246,0.5)" }} />
                <span className="text-[10px] font-medium" style={{ color: "rgba(139,92,246,0.6)" }}>
                  {entry.time}
                </span>
                <span className="ml-auto flex items-center gap-1 text-[9px]" style={{ color: "rgba(16,185,129,0.5)" }}>
                  <FileText size={9} /> vault
                </span>
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(240,248,255,0.82)" }}>
                {entry.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {savedAt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-[10px]" style={{ color: "rgba(16,185,129,0.5)" }}>
            ✓ Saved to Obsidian at {savedAt}
          </motion.div>
        )}
      </div>

      {/* ── Write area (only for today) ── */}
      {isToday && (
        <div className="flex-shrink-0 px-5 py-4 border-t"
          style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.7)" }}>

          {/* Listening banner */}
          <AnimatePresence>
            {isListening && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-medium" style={{ color: "#f87171" }}>Listening… speak your entry</span>
                {interimText && (
                  <span className="text-[11px] italic ml-auto truncate max-w-[60%]" style={{ color: "rgba(248,113,113,0.6)" }}>
                    {interimText}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save error / mic error */}
          <AnimatePresence>
            {(saveError || micError) && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[11px] mb-2 px-1" style={{ color: "#f87171" }}>
                ⚠ {saveError ?? micError}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="rounded-2xl p-3 transition-all"
            style={{
              background: "rgba(7,21,38,0.85)",
              border: `1px solid ${isListening ? "rgba(239,68,68,0.4)" : text.trim() ? "rgba(139,92,246,0.3)" : "rgba(0,212,255,0.1)"}`,
              boxShadow: isListening ? "0 0 20px rgba(239,68,68,0.08)" : text.trim() ? "0 0 20px rgba(139,92,246,0.07)" : "none",
            }}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); autoGrow(); }}
                onKeyDown={handleKey}
                placeholder={isListening ? "Speak now — text will appear here…" : "Write your thoughts… (⌘↵ to save)"}
                rows={3}
                className="w-full bg-transparent resize-none text-sm outline-none leading-relaxed"
                style={{ color: "rgba(240,248,255,0.88)", minHeight: 72, maxHeight: 260 }}
              />
              {isListening && interimText && (
                <p className="absolute bottom-0 left-0 right-0 text-sm leading-relaxed pointer-events-none italic"
                  style={{ color: "rgba(248,113,113,0.45)", whiteSpace: "pre-wrap" }}>
                  {text ? text.trimEnd() + " " + interimText : interimText}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px]" style={{ color: "rgba(122,163,192,0.28)" }}>
                  ⌘↵ save · will append to <code className="text-[9px]">Journal/{date}.md</code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {saving && <Loader2 size={12} className="animate-spin" style={{ color: "#8b5cf6" }} />}

                {/* Mic button */}
                {micSupported && (
                  <motion.button
                    onClick={toggleMic}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: isListening ? "rgba(239,68,68,0.2)" : "rgba(139,92,246,0.1)",
                      border: `1px solid ${isListening ? "rgba(239,68,68,0.5)" : "rgba(139,92,246,0.2)"}`,
                      boxShadow: isListening ? "0 0 12px rgba(239,68,68,0.3)" : "none",
                    }}>
                    {isListening
                      ? <MicOff size={13} style={{ color: "#f87171" }} />
                      : <Mic size={13} style={{ color: "#a78bfa" }} />}
                  </motion.button>
                )}

                <motion.button
                  onClick={saveEntry}
                  disabled={!text.trim() || saving}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-25 transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.45), rgba(168,85,247,0.3))",
                    border: "1px solid rgba(139,92,246,0.45)",
                    color: "#c4b5fd",
                    boxShadow: "0 0 16px rgba(139,92,246,0.15)",
                  }}>
                  <Send size={11} /> Save Entry
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ onClick, icon, disabled }: { onClick: () => void; icon: React.ReactNode; disabled?: boolean }) {
  return (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.1 }} whileTap={disabled ? {} : { scale: 0.9 }}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
      style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)", color: "#8b5cf6" }}>
      {icon}
    </motion.button>
  );
}
