"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookMarked, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from "lucide-react";

// ── Guide content ─────────────────────────────────────────────────────────────

const GUIDE = `
## 👋 What Is This?

CLAUDE OS is a personal AI dashboard you run on your own computer. It gives you:

- 💬 A beautiful chat interface with Claude
- 📓 A daily journal that saves to Obsidian
- 🎯 A goal tracker
- 🎤 Voice input everywhere
- 🤖 An AI agent control panel
- 📊 Live metrics and analytics

The wild part? **Claude built most of it.** You just have to ask.

---

## 🧰 What You'll Need

| Thing | Why | Where to Get It |
|-------|-----|----------------|
| 💻 A computer | To run it on | You already have one! |
| 🟢 Node.js 18+ | Runs the app | nodejs.org |
| 🔑 Anthropic API Key | Connects to Claude | console.anthropic.com |
| 🤖 Claude Code | The AI that builds it | claude.ai/code |
| ⏰ 2-3 hours | Time to build | Clear your afternoon |

---

## 🤯 The Secret Nobody Tells You

**You don't write the code. Claude writes the code. You describe what you want.**

This is called *vibe coding* — and it works. You open Claude Code, describe your vision, and Claude builds it piece by piece while you watch. If something looks wrong, you say "make it more beautiful" or "add a microphone button." Claude fixes it.

Think of yourself as the **director** and Claude as the **entire film crew.**

---

## 📦 Step 1: Install Your Tools

### Install Node.js
Go to **nodejs.org** and download the LTS version.

\`\`\`bash
node --version
# Should show v18 or higher
\`\`\`

### Get Your API Key
1. Go to **console.anthropic.com**
2. Click **API Keys** in the sidebar
3. Click **Create Key**
4. Copy it somewhere safe — you only see it once!

### Install Claude Code
\`\`\`bash
npm install -g @anthropic/claude-code
claude
\`\`\`

---

## 🎬 Step 2: Start Your Project

Open Claude Code and paste this prompt:

> *"Create a beautiful, dopamine-inducing operating system, hosted locally, for managing Claude through a website. It should be like a beautiful mission control dashboard. Use Next.js, Tailwind, and Framer Motion. Make it gorgeous."*

Claude will create all the project files, install dependencies, and write hundreds of lines of beautiful code. That's it. That's step 2.

---

## 🎨 Step 3: Make It More Beautiful

Don't be shy — keep asking for more:

> *"Make it even more modern, clean, beautiful, and dopamine-inducing. Add separate clickable sections for each AI agent. Make the chat feel like a real chat app."*

Prompts that work really well:

- 🎨 *"Make the colors more vibrant and sci-fi"*
- ✨ *"Add smooth animations when switching between panels"*
- 📱 *"Give each agent a unique avatar or logo"*
- 🌙 *"Give it a deep space / mission control aesthetic"*

> **Pro tip:** Be specific about feelings, not just features. "Make it feel exciting to open" works better than "change the colors."

---

## 🎤 Step 4: Add Voice Input

> *"Add a microphone button to every chat box. When I click it, I should be able to talk and have my words turn into text. Use the browser's built-in voice recognition. No API keys."*

Claude adds the Web Speech API — built into Chrome and Edge for free. No extra accounts needed.

---

## 📓 Step 5: Connect Your Obsidian Vault

> *"I have an Obsidian vault at ~/Documents/ObsidianVault. Make every chat, every goal, and every journal entry save to my vault automatically. Use a folder called 'Agentic OS' inside my vault. Each chat gets its own daily file."*

Claude will create a folder structure, write a server API, and add a "saved to vault" indicator on every entry.

---

## 🌐 Step 6: Make It Work for Anyone

> *"Make every setting come from a config file, not hardcoded paths. Add a setup wizard that auto-detects which AI agents are installed and asks for the vault path. Make it work on anyone's computer with one command."*

Claude builds a beautiful setup wizard that appears on first launch and walks new users through everything.

---

## 🐙 Step 7: Push to GitHub

> *"Commit this to GitHub"*

Claude initializes the git repository, writes the commit message, and pushes everything. Done.

---

## 💡 Pro Tips for Working With Claude

**🗣️ Talk Like a Human**
Don't try to sound technical. Claude understands plain English better than jargon.

✅ *"Make the buttons feel more satisfying to click"*
❌ *"Add CSS transition: transform 0.2s cubic-bezier..."*

**🔄 Iterate Fast**
Build in layers: structure first → make it beautiful → add features → polish.

**🐛 When Things Break**
Just describe what's wrong:
> *"The microphone button isn't working. When I click it nothing happens."*

Claude diagnoses and fixes it. No need to understand the error yourself.

**📸 Show, Don't Tell**
> *"Make it look like the aesthetic of Linear or Vercel's dashboard — clean, dark, minimal but powerful"*

---

## 🚀 Ideas for What to Build Next

- 🔔 **Notifications panel** — get alerts from your AI agents
- 📅 **Calendar integration** — see your schedule inside CLAUDE OS
- 🧠 **Memory system** — Claude remembers things across conversations
- 📈 **Personal analytics** — track your productivity over time
- 🤝 **Multi-model support** — GPT-4, Gemini, or local Ollama models
- 🔗 **Webhook triggers** — react to events from other apps
- 📱 **Mobile view** — make it work on your phone

---

## 🏁 Your First Session Checklist

- [ ] Install Node.js 18+
- [ ] Get Anthropic API key from console.anthropic.com
- [ ] Install Claude Code: \`npm install -g @anthropic/claude-code\`
- [ ] Run \`claude\` in a new folder
- [ ] Paste the starter prompt
- [ ] Watch it build
- [ ] Open \`http://localhost:3030\`
- [ ] Keep iterating!

---

## ❤️ Final Thought

**There are no mistakes, only iterations.**

If something looks wrong, say so. If something is missing, ask for it. Claude doesn't get tired, doesn't judge your ideas, and never says "that's too hard."

You are living in the era where anyone — *anyone* — can build the tools they've always imagined. All you have to do is describe your vision clearly and keep going.

**Now go build something amazing. 🌟**
`;

// ── Copyable prompt card ──────────────────────────────────────────────────────

function PromptCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl p-4 my-2 group"
      style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.12)" }}>
      <p className="text-[12px] leading-relaxed pr-8 italic" style={{ color: "rgba(0,212,255,0.8)" }}>{text}</p>
      <button onClick={copy}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center"
        style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
        {copied ? <Check size={11} style={{ color: "#10b981" }} /> : <Copy size={11} style={{ color: "#00d4ff" }} />}
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function GuidePanel() {
  const [tocOpen, setTocOpen] = useState(false);

  const sections = [
    "👋 What Is This?", "🧰 What You'll Need", "🤯 The Secret",
    "📦 Step 1: Install", "🎬 Step 2: Start", "🎨 Step 3: Beautify",
    "🎤 Step 4: Voice", "📓 Step 5: Vault", "🌐 Step 6: Share",
    "🐙 Step 7: GitHub", "💡 Pro Tips", "🚀 What to Build Next",
    "🏁 Checklist", "❤️ Final Thought",
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.6)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.25)" }}>
            <BookMarked size={15} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <p className="text-[12px] font-bold tracking-widest" style={{ color: "#ec4899" }}>GUIDE</p>
            <p className="text-[10px]" style={{ color: "rgba(122,163,192,0.45)" }}>
              How to build this with Claude · saved to vault
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ToC toggle */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setTocOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", color: "#f472b6" }}>
            {tocOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Contents
          </motion.button>

          <a href="https://github.com/kenschisler-ctrl/claude-os" target="_blank" rel="noreferrer">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", color: "#00d4ff" }}>
              <ExternalLink size={11} /> GitHub
            </motion.div>
          </a>
        </div>
      </div>

      {/* ── Table of Contents ── */}
      <AnimatePresence>
        {tocOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex-shrink-0 border-b"
            style={{ borderColor: "rgba(0,212,255,0.07)", background: "rgba(3,8,16,0.5)" }}>
            <div className="px-5 py-3 flex flex-wrap gap-1.5">
              {sections.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full cursor-default"
                  style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.15)", color: "rgba(244,114,182,0.7)" }}>
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 mb-8 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.06), rgba(0,212,255,0.06))",
              border: "1px solid rgba(236,72,153,0.15)",
            }}>
            <div className="text-4xl mb-3">🚀</div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "rgba(240,248,255,0.95)" }}>
              How to Build Your Own AI Command Center Using Claude
            </h1>
            <p className="text-sm" style={{ color: "rgba(122,163,192,0.6)" }}>
              Anyone can build this. You don't need to be a programmer.<br />
              You just need to know how to have a conversation.
            </p>
          </motion.div>

          {/* Markdown body */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
            className="guide-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mt-10 mb-4 pb-2 flex items-center gap-2"
                    style={{ color: "rgba(240,248,255,0.9)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[13px] font-bold mt-6 mb-2" style={{ color: "#00d4ff" }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(200,220,240,0.75)" }}>
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold" style={{ color: "rgba(240,248,255,0.95)" }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={{ color: "rgba(167,139,250,0.85)" }}>{children}</em>
                ),
                blockquote: ({ children }) => (
                  <div className="rounded-xl px-4 py-3 my-4"
                    style={{ background: "rgba(0,212,255,0.05)", borderLeft: "2px solid rgba(0,212,255,0.3)" }}>
                    <div className="text-[12px] leading-relaxed italic" style={{ color: "rgba(0,212,255,0.8)" }}>
                      {children}
                    </div>
                  </div>
                ),
                code: ({ children, className }) => {
                  const isBlock = !!className;
                  if (isBlock) {
                    return (
                      <div className="rounded-xl overflow-hidden my-4">
                        <div className="px-3 py-1.5 flex items-center gap-2"
                          style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
                          <span className="w-2 h-2 rounded-full" style={{ background: "rgba(245,158,11,0.6)" }} />
                          <span className="w-2 h-2 rounded-full" style={{ background: "rgba(16,185,129,0.6)" }} />
                        </div>
                        <pre className="px-4 py-3 overflow-x-auto text-[12px] leading-relaxed font-mono"
                          style={{ background: "rgba(3,8,16,0.9)", color: "rgba(0,212,255,0.85)" }}>
                          {children}
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded-md text-[11px] font-mono"
                      style={{ background: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>
                      {children}
                    </code>
                  );
                },
                ul: ({ children }) => (
                  <ul className="space-y-1.5 my-3 ml-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 my-3 ml-1 list-decimal list-inside">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[13px] flex gap-2 items-start leading-relaxed" style={{ color: "rgba(200,220,240,0.75)" }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(236,72,153,0.6)" }} />
                    <span>{children}</span>
                  </li>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-xl" style={{ border: "1px solid rgba(0,212,255,0.1)" }}>
                    <table className="w-full text-[12px]">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead style={{ background: "rgba(0,212,255,0.06)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2.5 text-left font-semibold tracking-wide text-[11px]"
                    style={{ color: "rgba(0,212,255,0.7)" }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2.5" style={{ color: "rgba(200,220,240,0.7)", borderTop: "1px solid rgba(0,212,255,0.05)" }}>
                    {children}
                  </td>
                ),
                hr: () => (
                  <div className="my-8 h-px rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.2), rgba(139,92,246,0.2), transparent)" }} />
                ),
              }}
            >
              {GUIDE}
            </ReactMarkdown>
          </motion.div>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-10 rounded-2xl p-6 text-center"
            style={{ background: "rgba(7,21,38,0.6)", border: "1px solid rgba(236,72,153,0.1)" }}>
            <p className="text-xs" style={{ color: "rgba(122,163,192,0.4)" }}>
              Built with Claude Code · Runs on your machine · Saves to your vault
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <a href="https://github.com/kenschisler-ctrl/claude-os" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] hover:opacity-80 transition-opacity"
                style={{ color: "#00d4ff" }}>
                <ExternalLink size={11} /> View on GitHub
              </a>
              <span style={{ color: "rgba(122,163,192,0.2)" }}>·</span>
              <a href="https://claude.ai/code" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] hover:opacity-80 transition-opacity"
                style={{ color: "#8b5cf6" }}>
                <ExternalLink size={11} /> Get Claude Code
              </a>
              <span style={{ color: "rgba(122,163,192,0.2)" }}>·</span>
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] hover:opacity-80 transition-opacity"
                style={{ color: "#ec4899" }}>
                <ExternalLink size={11} /> Get API Key
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
