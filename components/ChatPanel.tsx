"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, Copy, ChevronDown, Sparkles,
  ArrowDown, Check, Paperclip, Mic, MicOff, BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { vaultSaveChat } from "@/lib/vault";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
  copied?: boolean;
}

const MODELS = [
  { id: "claude-opus-4-7",           label: "Opus 4.7",   sub: "Most capable", color: "#ec4899", dot: "#f472b6" },
  { id: "claude-sonnet-4-6",         label: "Sonnet 4.6", sub: "Balanced",      color: "#00d4ff", dot: "#38bdf8" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5",  sub: "Fastest",       color: "#10b981", dot: "#34d399" },
];

const PRESETS = [
  { icon: "🔭", label: "Explore a concept", prompt: "Explain quantum entanglement in simple terms" },
  { icon: "⚡", label: "Write code",         prompt: "Write a TypeScript async queue with retry logic" },
  { icon: "🧠", label: "Deep analysis",      prompt: "Analyze the trade-offs between microservices and monoliths" },
  { icon: "✨", label: "Creative task",      prompt: "Write a short sci-fi story about an AI gaining consciousness" },
];

const SYSTEM_PROMPTS = [
  { label: "Assistant", value: "You are Claude, a helpful AI assistant running inside CLAUDE OS — a futuristic mission control dashboard. Be helpful and precise." },
  { label: "Engineer",  value: "You are an expert software engineer. Write clean, production-grade code. Be concise, precise, and skip unnecessary explanation." },
  { label: "Analyst",   value: "You are a strategic analyst. Break down problems systematically, provide data-driven insights, and structure responses clearly." },
  { label: "Creative",  value: "You are a creative collaborator. Think expansively, generate novel ideas, and embrace unconventional approaches." },
];

function ClaudeAvatar({ model, size = 32 }: { model: string; size?: number }) {
  const m = MODELS.find(x => x.id === model) || MODELS[1];
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: `radial-gradient(circle at 35% 35%, ${m.color}30, ${m.color}10)`, border: `1.5px solid ${m.color}40` }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.58, height: size * 0.58 }}>
        <circle cx="12" cy="12" r="9" fill="none" stroke={m.color} strokeWidth="1.5" strokeDasharray="3.5 2" opacity="0.6" />
        <circle cx="12" cy="12" r="4.5" fill={`${m.color}20`} stroke={m.color} strokeWidth="1" />
        <circle cx="12" cy="12" r="2" fill={m.color} />
      </svg>
    </div>
  );
}

function UserAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
      style={{ width: size, height: size, background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(37,99,235,0.3))", border: "1.5px solid rgba(0,212,255,0.35)", color: "#00d4ff", fontSize: size * 0.38 }}>
      K
    </div>
  );
}

// Animated waveform bars shown while listening
function VoiceWave({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[0.6, 1, 0.8, 1.2, 0.7, 1, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: color, originY: 1 }}
          animate={{ scaleY: [h * 0.4, h, h * 0.4] }}
          transition={{ duration: 0.6 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [interimText, setInterimText]   = useState("");      // live partial transcript shown in textarea
  const [isStreaming, setIsStreaming]   = useState(false);
  const [model, setModel]               = useState("claude-sonnet-4-6");
  const [sysPrompt, setSysPrompt]       = useState(SYSTEM_PROMPTS[0].value);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showSysMenu, setShowSysMenu]   = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [totalTokens, setTotalTokens]   = useState(0);
  const [micError, setMicError]         = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const inputRef    = useRef(input);
  useEffect(() => { inputRef.current = input; }, [input]);

  const currentModel = MODELS.find(m => m.id === model) || MODELS[1];

  // ── Speech recognition ──
  const { state: micState, error: speechError, isSupported: micSupported, toggle: toggleMic, stop: stopMic } =
    useSpeechRecognition({
      continuous: false,
      interimResults: true,
      onTranscript: useCallback((text: string, isFinal: boolean) => {
        if (isFinal) {
          // Append final transcript to whatever the user already typed
          setInput(prev => {
            const spacer = prev && !prev.endsWith(" ") ? " " : "";
            return prev + spacer + text;
          });
          setInterimText("");
          setTimeout(() => autoGrow(), 0);
        } else {
          setInterimText(text);
        }
      }, []),
      onEnd: useCallback(() => { setInterimText(""); }, []),
    });

  // Show speech errors in the UI
  useEffect(() => {
    if (speechError) {
      setMicError(speechError);
      const t = setTimeout(() => setMicError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [speechError]);

  // ── Scroll helpers ──
  const scrollToBottom = (smooth = true) =>
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  // ── Send ──
  const sendMessage = useCallback(async () => {
    stopMic();
    const text = inputRef.current.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    const assistId = (Date.now() + 1).toString();
    const assistMsg: Message = { id: assistId, role: "assistant", content: "", timestamp: new Date(), model };

    setMessages(prev => [...prev, userMsg, assistMsg]);
    setInput("");
    setInterimText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsStreaming(true);
    abortRef.current = new AbortController();

    let finalResponse = "";
    let finalTokens   = 0;
    let finalModel    = model;

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model, system: sysPrompt }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            finalResponse += data.text;
            setMessages(prev => prev.map(m => m.id === assistId ? { ...m, content: m.content + data.text } : m));
          }
          if (data.done && data.usage) {
            finalTokens = data.usage.input_tokens + data.usage.output_tokens;
            finalModel  = data.model ?? model;
            setTotalTokens(p => p + finalTokens);
            setMessages(prev => prev.map(m => m.id === assistId ? { ...m, tokens: finalTokens, model: finalModel } : m));
          }
          if (data.error) throw new Error(data.error);
        }
      }

      // ── Auto-save to Obsidian vault ──
      if (finalResponse) {
        vaultSaveChat({
          userMessage:       text,
          assistantMessage:  finalResponse,
          model:             finalModel,
          tokens:            finalTokens || undefined,
        });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setMessages(prev => prev.map(m => m.id === assistId ? { ...m, content: `Error: ${(e as Error).message}` } : m));
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, model, sysPrompt, stopMic]);

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, copied: true } : m));
    setTimeout(() => setMessages(prev => prev.map(m => m.id === id ? { ...m, copied: false } : m)), 1800);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const isListening = micState === "listening";

  // The textarea shows real input + a greyed interim transcript
  const displayValue = isListening && interimText
    ? input + (input && !input.endsWith(" ") ? " " : "") + interimText
    : input;

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.7)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <ClaudeAvatar model={model} size={30} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-none" style={{ color: currentModel.color }}>
              Claude · {currentModel.label}
            </p>
            <p className="text-[10px] mt-0.5 flex items-center gap-1.5" style={{ color: "rgba(122,163,192,0.5)" }}>
              {messages.length} messages · {totalTokens.toLocaleString()} tokens
              {messages.length > 1 && (
                <span className="flex items-center gap-1" style={{ color: "rgba(16,185,129,0.65)" }}>
                  · <BookOpen size={9} /> vault
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Persona */}
          <div className="relative">
            <button onClick={() => { setShowSysMenu(v => !v); setShowModelMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
              <Sparkles size={11} />
              {SYSTEM_PROMPTS.find(s => s.value === sysPrompt)?.label}
              <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showSysMenu && (
                <DropMenu onClose={() => setShowSysMenu(false)}>
                  {SYSTEM_PROMPTS.map(s => (
                    <DropItem key={s.label} active={sysPrompt === s.value} color="#a78bfa"
                      onClick={() => { setSysPrompt(s.value); setShowSysMenu(false); }}>
                      {s.label}
                    </DropItem>
                  ))}
                </DropMenu>
              )}
            </AnimatePresence>
          </div>

          {/* Model */}
          <div className="relative">
            <button onClick={() => { setShowModelMenu(v => !v); setShowSysMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
              style={{ background: `${currentModel.color}12`, border: `1px solid ${currentModel.color}30`, color: currentModel.color }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: currentModel.dot, boxShadow: `0 0 4px ${currentModel.dot}` }} />
              {currentModel.label}
              <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showModelMenu && (
                <DropMenu onClose={() => setShowModelMenu(false)}>
                  {MODELS.map(m => (
                    <DropItem key={m.id} active={model === m.id} color={m.color}
                      onClick={() => { setModel(m.id); setShowModelMenu(false); }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
                      <span>{m.label}</span>
                      <span className="ml-auto text-[9px] opacity-60">{m.sub}</span>
                    </DropItem>
                  ))}
                </DropMenu>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => { setMessages([]); setTotalTokens(0); }}
            className="p-1.5 rounded-lg hover:bg-red-900/20 transition-all">
            <Trash2 size={13} style={{ color: "rgba(244,63,94,0.5)" }} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} onScroll={onScroll}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ scrollbarGutter: "stable" }}>

        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full gap-8 -mt-4">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-24 h-24">
                <svg viewBox="0 0 96 96" className="w-full h-full">
                  <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" strokeDasharray="6 4" />
                  <circle cx="48" cy="48" r="32" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="1" strokeDasharray="4 3" />
                  <circle cx="48" cy="48" r="20" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1.5" />
                  <circle cx="48" cy="48" r="8"  fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5" />
                  <circle cx="48" cy="48" r="3"  fill="rgba(0,212,255,0.9)" />
                </svg>
              </motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="absolute top-2 left-2 right-2 bottom-2">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle cx="40" cy="4"  r="3.5" fill="#00d4ff" />
                  <circle cx="76" cy="40" r="2.5" fill="#8b5cf6" opacity="0.7" />
                  <circle cx="40" cy="76" r="2"   fill="#ec4899" opacity="0.6" />
                </svg>
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold" style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.4)" }}>
                Claude is ready
              </h3>
              <p className="text-sm" style={{ color: "rgba(122,163,192,0.55)" }}>
                Connected via {currentModel.label} · Type or{" "}
                <button onClick={toggleMic} className="underline underline-offset-2 transition-opacity hover:opacity-80"
                  style={{ color: "#00d4ff" }}>
                  speak
                </button>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
              {PRESETS.map(p => (
                <motion.button key={p.label} whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.975 }}
                  onClick={() => { setInput(p.prompt); textareaRef.current?.focus(); }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl text-left"
                  style={{ background: "rgba(7,21,38,0.7)", border: "1px solid rgba(0,212,255,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                  <span className="text-lg leading-none mt-0.5">{p.icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: "rgba(240,248,255,0.75)" }}>{p.label}</p>
                    <p className="text-[10px] leading-snug" style={{ color: "rgba(122,163,192,0.45)" }}>{p.prompt.slice(0, 42)}…</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-5">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const grouped = i > 0 && messages[i - 1].role === msg.role;
            return (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${grouped ? "-mt-3" : ""}`}>
                {!grouped
                  ? (isUser ? <UserAvatar size={32} /> : <ClaudeAvatar model={msg.model || model} size={32} />)
                  : <div style={{ width: 32, flexShrink: 0 }} />}
                <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? "items-end" : "items-start"}`}>
                  {!grouped && (
                    <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
                      <span className="text-[11px] font-semibold"
                        style={{ color: isUser ? "rgba(0,212,255,0.7)" : currentModel.color }}>
                        {isUser ? "You" : `Claude · ${MODELS.find(m => m.id === (msg.model || model))?.label || "Sonnet"}`}
                      </span>
                      <span className="text-[10px]" style={{ color: "rgba(122,163,192,0.35)" }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className="group relative">
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={isUser ? {
                        background: "linear-gradient(135deg, rgba(0,102,235,0.28), rgba(0,212,255,0.18))",
                        border: "1px solid rgba(0,212,255,0.22)",
                        borderRadius: "18px 4px 18px 18px",
                        color: "rgba(240,248,255,0.92)",
                        boxShadow: "0 4px 20px rgba(0,212,255,0.08)",
                      } : {
                        background: "rgba(7,21,38,0.85)",
                        border: "1px solid rgba(0,212,255,0.08)",
                        borderRadius: "4px 18px 18px 18px",
                        color: "rgba(240,248,255,0.88)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      }}>
                      {!msg.content && !isUser && (
                        <div className="flex gap-1.5 items-center py-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="typing-dot w-2 h-2 rounded-full"
                              style={{ background: currentModel.color, animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      )}
                      {isUser ? (
                        <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                      ) : msg.content ? (
                        <div className="chat-prose">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : null}
                    </div>
                    {!isUser && msg.content && (
                      <motion.button initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                        onClick={() => copyMsg(msg.id, msg.content)}
                        className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(7,21,38,0.95)", border: "1px solid rgba(0,212,255,0.2)" }}>
                        {msg.copied
                          ? <Check size={10} style={{ color: "#10b981" }} />
                          : <Copy size={10} style={{ color: "rgba(122,163,192,0.6)" }} />}
                      </motion.button>
                    )}
                  </div>
                  {msg.tokens && (
                    <p className="text-[9px] px-1" style={{ color: "rgba(122,163,192,0.3)" }}>
                      {msg.tokens.toLocaleString()} tokens
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom pill */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.9 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium z-20"
            style={{ background: "rgba(7,21,38,0.95)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
            <ArrowDown size={12} /> Latest
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mic error toast ── */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs z-30"
            style={{
              background: "rgba(7,21,38,0.97)",
              border: "1px solid rgba(244,63,94,0.35)",
              color: "#f87171",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,63,94,0.1)",
            }}
          >
            <MicOff size={13} style={{ color: "#f43f5e", flexShrink: 0 }} />
            {micError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input area ── */}
      <div className="flex-shrink-0 px-4 py-3 border-t"
        style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.8)", backdropFilter: "blur(20px)" }}>

        {/* Listening banner */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(236,72,153,0.08))",
                  border: "1px solid rgba(244,63,94,0.25)",
                }}>
                {/* Pulsing dot */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#f43f5e", boxShadow: "0 0 8px #f43f5e" }}
                />
                <span className="text-xs font-semibold" style={{ color: "#f87171" }}>Listening…</span>
                {/* Waveform */}
                <div className="flex-1" />
                <div style={{ height: 18, display: "flex", alignItems: "center" }}>
                  <VoiceWave color="#f43f5e" />
                </div>
                {interimText && (
                  <span className="text-xs max-w-[260px] truncate" style={{ color: "rgba(248,113,113,0.7)" }}>
                    "{interimText}"
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2.5 rounded-2xl px-3 py-2.5 transition-all duration-300"
          style={{
            background: "rgba(7,21,38,0.85)",
            border: `1px solid ${isListening ? "rgba(244,63,94,0.35)" : isStreaming ? "rgba(0,212,255,0.3)" : "rgba(0,212,255,0.1)"}`,
            boxShadow: isListening
              ? "0 0 24px rgba(244,63,94,0.1)"
              : isStreaming ? "0 0 24px rgba(0,212,255,0.08)" : "none",
          }}>

          {/* Attachment */}
          <button className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-all mb-0.5">
            <Paperclip size={15} style={{ color: "rgba(122,163,192,0.3)" }} />
          </button>

          {/* Textarea — shows interim transcript in a lighter colour via placeholder trick */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoGrow(); }}
              onKeyDown={handleKey}
              placeholder={isListening ? "" : "Message Claude…"}
              rows={1}
              className="w-full bg-transparent resize-none text-sm outline-none"
              style={{
                color: "rgba(240,248,255,0.9)",
                lineHeight: "1.6",
                maxHeight: "140px",
                overflow: "auto",
                display: "block",
              }}
            />
            {/* Overlay the interim text when no real input yet */}
            {isListening && interimText && !input && (
              <div className="absolute inset-0 pointer-events-none text-sm leading-[1.6] py-0"
                style={{ color: "rgba(244,63,94,0.5)", fontStyle: "italic" }}>
                {interimText}
              </div>
            )}
          </div>

          {/* ── Mic button ── */}
          {micSupported ? (
            <MicButton
              state={micState}
              onToggle={toggleMic}
            />
          ) : (
            <button className="flex-shrink-0 p-1.5 rounded-lg mb-0.5 cursor-not-allowed" title="Voice not supported in this browser">
              <MicOff size={15} style={{ color: "rgba(122,163,192,0.2)" }} />
            </button>
          )}

          {/* Send / Stop */}
          <motion.button
            onClick={isStreaming ? () => abortRef.current?.abort() : sendMessage}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
            disabled={!input.trim() && !isStreaming}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-25"
            style={{
              background: isStreaming
                ? "linear-gradient(135deg, rgba(244,63,94,0.5), rgba(236,72,153,0.4))"
                : "linear-gradient(135deg, rgba(0,212,255,0.5), rgba(37,99,235,0.4))",
              boxShadow: isStreaming ? "0 0 14px rgba(244,63,94,0.3)" : "0 0 14px rgba(0,212,255,0.2)",
            }}>
            {isStreaming ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-3.5 h-3.5 rounded-full border-2 border-pink-300 border-t-transparent" />
            ) : (
              <Send size={14} style={{ color: "#e8f4ff" }} />
            )}
          </motion.button>
        </div>

        <div className="flex justify-between mt-1.5 px-1">
          <span className="text-[10px]" style={{ color: "rgba(122,163,192,0.28)" }}>
            ↵ send · Shift+↵ newline
            {micSupported && (
              <span> · <span style={{ color: isListening ? "rgba(244,63,94,0.6)" : "rgba(122,163,192,0.28)" }}>
                {isListening ? "🎙 recording" : "🎙 click mic to speak"}
              </span></span>
            )}
          </span>
          <span className="text-[10px]" style={{ color: "rgba(122,163,192,0.28)" }}>
            {input.length > 0 ? `${input.length} chars` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Mic button component ── */
function MicButton({ state, onToggle }: { state: "idle" | "listening" | "processing" | "unsupported"; onToggle: () => void }) {
  const isListening = state === "listening";

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      className="flex-shrink-0 relative flex items-center justify-center rounded-xl mb-0.5 transition-all"
      style={{
        width: 32, height: 32,
        background: isListening
          ? "linear-gradient(135deg, rgba(244,63,94,0.45), rgba(236,72,153,0.35))"
          : "rgba(255,255,255,0.04)",
        border: isListening
          ? "1px solid rgba(244,63,94,0.55)"
          : "1px solid rgba(122,163,192,0.15)",
        boxShadow: isListening ? "0 0 16px rgba(244,63,94,0.35)" : "none",
      }}
      title={isListening ? "Stop listening (click to stop)" : "Click to speak"}
    >
      {/* Ripple rings while listening */}
      {isListening && (
        <>
          <motion.span
            className="absolute inset-0 rounded-xl"
            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            style={{ border: "1px solid rgba(244,63,94,0.6)" }}
          />
          <motion.span
            className="absolute inset-0 rounded-xl"
            animate={{ scale: [1, 1.45], opacity: [0.3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
            style={{ border: "1px solid rgba(244,63,94,0.4)" }}
          />
        </>
      )}

      {isListening ? (
        /* Animated waveform icon */
        <div className="flex items-end gap-0.5" style={{ height: 14 }}>
          {[0.55, 1, 0.75, 1].map((h, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              style={{ background: "#f87171", originY: 1 }}
              animate={{ scaleY: [h * 0.4, h, h * 0.4] }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
          ))}
        </div>
      ) : (
        <Mic size={14} style={{ color: "rgba(122,163,192,0.55)" }} />
      )}
    </motion.button>
  );
}

/* ── Shared dropdown primitives ── */
function DropMenu({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.14 }}
        className="absolute right-0 top-full mt-1.5 w-48 rounded-xl overflow-hidden z-50 py-1"
        style={{
          background: "rgba(5,14,28,0.98)",
          border: "1px solid rgba(0,212,255,0.12)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
        }}>
        {children}
      </motion.div>
    </>
  );
}

function DropItem({ children, active, color, onClick }: {
  children: React.ReactNode; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white/5 transition-all"
      style={{ color: active ? color : "rgba(122,163,192,0.7)" }}>
      <div className="w-1 h-1 flex-shrink-0" style={{ borderRadius: "50%", background: active ? color : "transparent" }} />
      {children}
    </button>
  );
}
