// Client-side helpers for vault writes

export async function vaultSaveChat(payload: {
  userMessage: string;
  assistantMessage: string;
  model: string;
  tokens?: number;
}): Promise<void> {
  try {
    await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "chat", ...payload }),
    });
  } catch {
    // vault writes are best-effort — never block the UI
  }
}

export async function vaultSaveJournal(content: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res  = await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "journal", content }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "active" | "completed" | "archived";
  createdAt: string;
  completedAt?: string;
}

export async function vaultSaveGoals(goals: Goal[]): Promise<void> {
  try {
    await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "goals", goals }),
    });
  } catch {
    // best-effort
  }
}
