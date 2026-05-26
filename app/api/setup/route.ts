import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fsp from "fs/promises";
import path from "path";
import os from "os";
import { readConfig, writeConfig } from "@/lib/config.server";

const run = promisify(exec);

async function hasCommand(cmd: string): Promise<boolean> {
  try { await run(`which ${cmd}`); return true; } catch { return false; }
}

async function ollamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(800),
    });
    return res.ok;
  } catch { return false; }
}

async function detectVaults(): Promise<string[]> {
  const home = os.homedir();
  const candidates = [
    path.join(home, "Documents", "ObsidianVault"),
    path.join(home, "Documents", "Obsidian"),
    path.join(home, "ObsidianVault"),
    path.join(home, "Obsidian"),
    path.join(home, "vault"),
    path.join(home, "notes"),
    path.join(home, "Documents", "notes"),
  ];
  const found: string[] = [];
  for (const p of candidates) {
    try { await fsp.access(p); found.push(p); } catch {}
  }
  return found;
}

export async function GET() {
  const [claudeCli, ollama, vaultPaths] = await Promise.all([
    hasCommand("claude"),
    ollamaRunning(),
    detectVaults(),
  ]);

  const cfg = readConfig();

  return Response.json({
    config: {
      setupComplete: cfg.setupComplete,
      vaultPath:     cfg.vaultPath,
      vaultFolder:   cfg.vaultFolder,
      enabledAgents: cfg.enabledAgents,
      hasApiKey:     !!cfg.anthropicApiKey,
    },
    detected: {
      vaultPaths,
      agents: [
        {
          id:          "claude",
          name:        "Claude (Anthropic API)",
          description: "Sonnet 4.6 · Opus 4.7 · Haiku 4.5",
          available:   true,
          status:      cfg.anthropicApiKey ? "ready" : "needs-key",
        },
        {
          id:          "claude-cli",
          name:        "Claude CLI",
          description: "Local claude command-line tool",
          available:   claudeCli,
          status:      claudeCli ? "ready" : "not-installed",
        },
        {
          id:          "ollama",
          name:        "Ollama",
          description: "Llama, Mistral, Phi — runs locally",
          available:   ollama,
          status:      ollama ? "ready" : "not-running",
        },
      ],
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = writeConfig({
      anthropicApiKey: body.anthropicApiKey ?? "",
      vaultPath:       body.vaultPath       ?? "",
      vaultFolder:     body.vaultFolder      ?? "Agentic OS",
      enabledAgents:   body.enabledAgents    ?? ["claude"],
      setupComplete:   true,
    });
    return Response.json({ ok: true, config: { ...updated, anthropicApiKey: undefined } });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
