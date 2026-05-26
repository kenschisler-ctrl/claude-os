import fs from "fs";
import path from "path";

export interface AppConfig {
  setupComplete: boolean;
  anthropicApiKey: string;
  vaultPath: string;
  vaultFolder: string;
  enabledAgents: string[];
}

const CONFIG_FILE = path.join(process.cwd(), "claude-os.config.json");

const DEFAULTS: AppConfig = {
  setupComplete: false,
  anthropicApiKey: "",
  vaultPath: "",
  vaultFolder: "Agentic OS",
  enabledAgents: ["claude"],
};

export function readConfig(): AppConfig {
  let file: Partial<AppConfig> = {};
  try {
    file = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch {}
  return {
    ...DEFAULTS,
    ...file,
    // env vars override file (lets advanced users use environment variables)
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || file.anthropicApiKey || "",
    vaultPath:       process.env.VAULT_PATH        || file.vaultPath        || "",
  };
}

export function writeConfig(updates: Partial<AppConfig>): AppConfig {
  const current = readConfig();
  const next: AppConfig = { ...current, ...updates };
  // never persist env-var-sourced keys into the file
  const toWrite = { ...next };
  if (process.env.ANTHROPIC_API_KEY) delete (toWrite as Partial<AppConfig>).anthropicApiKey;
  if (process.env.VAULT_PATH)        delete (toWrite as Partial<AppConfig>).vaultPath;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(toWrite, null, 2), "utf8");
  return next;
}
