import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readConfig } from "@/lib/config.server";

function getBase() {
  const cfg = readConfig();
  return path.join(cfg.vaultPath, cfg.vaultFolder);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function longDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ── Chat ─────────────────────────────────────────────────────────────────────
// Appends one user↔Claude exchange to Chats/YYYY-MM-DD.md
async function appendChat(payload: {
  date?: string;
  userMessage: string;
  assistantMessage: string;
  model: string;
  tokens?: number;
}) {
  const date  = payload.date ?? todayISO();
  const dir   = path.join(getBase(), "Chats");
  const file  = path.join(dir, `${date}.md`);
  await ensureDir(dir);

  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const modelShort = payload.model.includes("opus") ? "Opus 4.7"
    : payload.model.includes("haiku") ? "Haiku 4.5"
    : "Sonnet 4.6";

  // Create header if file doesn't exist yet
  let header = "";
  try {
    await fs.access(file);
  } catch {
    header = `---\ndate: ${date}\ntags:\n  - agentic-os/chat\n---\n\n# 🗨️ Chats — ${longDate(date)}\n\n`;
  }

  const block = `## ${now} · ${modelShort}\n\n`
    + `> **You**\n> ${payload.userMessage.replace(/\n/g, "\n> ")}\n\n`
    + `**Claude** *(${payload.model})*\n\n${payload.assistantMessage}\n\n`
    + (payload.tokens ? `*${payload.tokens.toLocaleString()} tokens*\n\n` : "")
    + `---\n\n`;

  await fs.appendFile(file, header + block, "utf8");
  return file;
}

// ── Journal ───────────────────────────────────────────────────────────────────
// Appends a timestamped entry to Journal/YYYY-MM-DD.md
async function appendJournal(payload: { date?: string; content: string }) {
  const date  = payload.date ?? todayISO();
  const dir   = path.join(getBase(), "Journal");
  const file  = path.join(dir, `${date}.md`);
  await ensureDir(dir);

  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  let header = "";
  try {
    await fs.access(file);
  } catch {
    header = `---\ndate: ${date}\ntags:\n  - agentic-os/journal\n---\n\n# 📓 Journal — ${longDate(date)}\n\n`;
  }

  const block = `## ${now}\n\n${payload.content.trim()}\n\n---\n\n`;
  await fs.appendFile(file, header + block, "utf8");
  return file;
}

// ── Goals ─────────────────────────────────────────────────────────────────────
// Rewrites Goals/Goals.md with the full current goal list
async function writeGoals(payload: { goals: Array<{ id: string; title: string; description?: string; priority: string; status: string; createdAt: string; completedAt?: string }> }) {
  const dir  = path.join(getBase(), "Goals");
  const file = path.join(dir, "Goals.md");
  await ensureDir(dir);

  const active    = payload.goals.filter(g => g.status === "active");
  const completed = payload.goals.filter(g => g.status === "completed");
  const archived  = payload.goals.filter(g => g.status === "archived");

  const goalLine = (g: typeof payload.goals[0]) => {
    const check  = g.status === "completed" ? "x" : " ";
    const pri    = g.priority === "high" ? "🔴" : g.priority === "medium" ? "🟡" : "🟢";
    const detail = g.description ? `\n  - ${g.description}` : "";
    const ts     = g.completedAt ? ` *(completed ${g.completedAt.slice(0, 10)})*` : ` *(added ${g.createdAt.slice(0, 10)})*`;
    return `- [${check}] ${pri} **${g.title}**${ts}${detail}`;
  };

  const updated = todayISO();
  let md = `---\ntags:\n  - agentic-os/goals\nupdated: ${updated}\n---\n\n# 🎯 Goals\n\n`;

  if (active.length) {
    md += `## Active (${active.length})\n\n${active.map(goalLine).join("\n")}\n\n`;
  }
  if (completed.length) {
    md += `## Completed (${completed.length})\n\n${completed.map(goalLine).join("\n")}\n\n`;
  }
  if (archived.length) {
    md += `## Archived (${archived.length})\n\n${archived.map(goalLine).join("\n")}\n\n`;
  }

  await fs.writeFile(file, md, "utf8");
  return file;
}

// ── Read ──────────────────────────────────────────────────────────────────────
async function readFile(type: string, date: string) {
  const subdir = type === "chat" ? "Chats" : "Journal";
  const file   = path.join(getBase(), subdir, `${date}.md`);
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body as { type: string };

    let filePath: string;
    if (type === "chat")    filePath = await appendChat(body);
    else if (type === "journal") filePath = await appendJournal(body);
    else if (type === "goals")   filePath = await writeGoals(body);
    else return Response.json({ error: `Unknown type: ${type}` }, { status: 400 });

    return Response.json({ ok: true, file: filePath });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[vault]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "chat";
  const date = searchParams.get("date") ?? todayISO();

  const content = await readFile(type, date);
  return Response.json({ content, date });
}
