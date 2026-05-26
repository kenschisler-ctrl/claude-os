"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Plus, Search, Trash2, Tag, Clock } from "lucide-react";

interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  type: "fact" | "instruction" | "context" | "persona";
  color: string;
}

const TYPE_CONFIG = {
  fact: { color: "#00d4ff", label: "FACT" },
  instruction: { color: "#7b2fff", label: "INST" },
  context: { color: "#ffb800", label: "CTX" },
  persona: { color: "#ff2d9b", label: "PRNA" },
};

const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: "1", title: "User Identity", type: "fact", color: "#00d4ff",
    content: "User is Ken Schisler. Email: ken.schisler@gmail.com. Works on AI projects.",
    tags: ["identity", "user"],
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "2", title: "Communication Style", type: "instruction", color: "#7b2fff",
    content: "Be concise and precise. Avoid unnecessary padding. Use technical language when appropriate.",
    tags: ["style", "behavior"],
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "3", title: "Project Context", type: "context", color: "#ffb800",
    content: "Working on CLAUDE OS — a mission control dashboard for AI agent management. Stack: Next.js 15, Tailwind, Framer Motion.",
    tags: ["project", "tech-stack"],
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: "4", title: "Preferred Models", type: "fact", color: "#00d4ff",
    content: "Default to claude-sonnet-4-6 for balanced tasks. Use claude-opus-4-7 for complex reasoning.",
    tags: ["models", "preferences"],
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
];

export default function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);
  const [selected, setSelected] = useState<MemoryEntry | null>(memories[0]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<MemoryEntry["type"]>("fact");
  const [newTags, setNewTags] = useState("");

  const filtered = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const createMemory = () => {
    if (!newTitle.trim()) return;
    const m: MemoryEntry = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      type: newType,
      color: TYPE_CONFIG[newType].color,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date(),
    };
    setMemories((prev) => [m, ...prev]);
    setSelected(m);
    setNewTitle(""); setNewContent(""); setNewTags("");
    setShowCreate(false);
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(memories.find(m => m.id !== id) || null);
  };

  return (
    <div className="flex h-full">
      {/* Memory list */}
      <div
        className="w-64 flex-shrink-0 border-r flex flex-col"
        style={{ borderColor: "rgba(0,212,255,0.08)", background: "rgba(4,13,26,0.4)" }}
      >
        <div
          className="px-4 py-3 border-b space-y-2"
          style={{ borderColor: "rgba(0,212,255,0.08)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold tracking-widest" style={{ color: "#ff6b6b" }}>MEMORY BANK</div>
              <div className="text-[9px] tracking-wider" style={{ color: "rgba(107,143,168,0.4)" }}>{memories.length} stored</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreate(true)}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)" }}
            >
              <Plus size={12} style={{ color: "#ff6b6b" }} />
            </motion.button>
          </div>
          {/* Search */}
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(6,18,34,0.6)", border: "1px solid rgba(0,212,255,0.1)" }}
          >
            <Search size={11} style={{ color: "rgba(107,143,168,0.4)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="flex-1 bg-transparent text-[11px] outline-none"
              style={{ color: "rgba(232,244,255,0.7)" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.map((mem, i) => {
            const isSelected = selected?.id === mem.id;
            const tc = TYPE_CONFIG[mem.type];
            return (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(mem)}
                className="p-2.5 rounded-lg cursor-pointer transition-all group"
                style={{
                  background: isSelected ? `${mem.color}10` : "rgba(6,18,34,0.5)",
                  border: `1px solid ${isSelected ? `${mem.color}25` : "rgba(0,212,255,0.05)"}`,
                }}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[11px] font-medium leading-tight" style={{ color: isSelected ? mem.color : "rgba(232,244,255,0.7)" }}>
                    {mem.title}
                  </span>
                  <span
                    className="text-[8px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                    style={{ background: `${tc.color}18`, color: tc.color }}
                  >
                    {tc.label}
                  </span>
                </div>
                <p className="text-[10px] line-clamp-2 leading-tight" style={{ color: "rgba(107,143,168,0.55)" }}>
                  {mem.content}
                </p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {mem.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] px-1 rounded"
                      style={{ background: "rgba(0,212,255,0.06)", color: "rgba(0,212,255,0.5)" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Memory Detail */}
      <div className="flex-1 overflow-y-auto p-5">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Database size={16} style={{ color: selected.color }} />
                  <h2 className="font-bold text-lg" style={{ color: selected.color }}>{selected.title}</h2>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
                    style={{ background: `${selected.color}18`, color: selected.color }}
                  >
                    {TYPE_CONFIG[selected.type].label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={11} style={{ color: "rgba(107,143,168,0.4)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(107,143,168,0.4)" }}>
                    {selected.createdAt.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteMemory(selected.id)}
                className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={13} style={{ color: "rgba(255,45,155,0.5)" }} />
              </button>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{ background: "rgba(6,18,34,0.7)", border: `1px solid ${selected.color}15` }}
            >
              <div className="text-[10px] tracking-widest mb-2" style={{ color: "rgba(107,143,168,0.4)" }}>CONTENT</div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,244,255,0.8)" }}>
                {selected.content}
              </p>
            </div>

            {selected.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={12} style={{ color: "rgba(107,143,168,0.4)" }} />
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: `${selected.color}12`, border: `1px solid ${selected.color}25`, color: selected.color }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm" style={{ color: "rgba(107,143,168,0.3)" }}>Select a memory</span>
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,4,8,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-96 p-6 rounded-2xl space-y-3"
              style={{ background: "rgba(4,13,26,0.98)", border: "1px solid rgba(255,107,107,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
            >
              <div className="text-sm font-bold tracking-widest mb-2" style={{ color: "#ff6b6b" }}>ENCODE MEMORY</div>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Memory title..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none bg-transparent"
                style={{ background: "rgba(6,18,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", color: "rgba(232,244,255,0.9)" }}
              />
              <div className="grid grid-cols-4 gap-1">
                {(Object.keys(TYPE_CONFIG) as MemoryEntry["type"][]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className="py-1.5 rounded text-[10px] font-bold tracking-wider transition-all"
                    style={{
                      background: newType === t ? `${TYPE_CONFIG[t].color}20` : "rgba(6,18,34,0.5)",
                      border: `1px solid ${newType === t ? `${TYPE_CONFIG[t].color}44` : "rgba(0,212,255,0.06)"}`,
                      color: newType === t ? TYPE_CONFIG[t].color : "rgba(107,143,168,0.4)",
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Memory content..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none bg-transparent"
                style={{ background: "rgba(6,18,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", color: "rgba(232,244,255,0.9)" }}
              />
              <input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma-separated)..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none bg-transparent"
                style={{ background: "rgba(6,18,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", color: "rgba(232,244,255,0.9)" }}
              />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(107,143,168,0.5)" }}>
                  CANCEL
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createMemory}
                  className="flex-1 py-2 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.4)", color: "#ff6b6b" }}
                >
                  ENCODE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
