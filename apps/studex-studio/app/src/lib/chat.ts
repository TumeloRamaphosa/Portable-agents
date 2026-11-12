import { loadSettings } from "./settings";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const QUEUE_KEY = "studex-studio-chat-queue";

export function loadQueuedMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQueuedMessages(msgs: ChatMessage[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(msgs));
}

export async function sendChat(
  messages: { role: string; content: string }[],
): Promise<{ ok: true; content: string } | { ok: false; reason: "down" | "config" }> {
  const { endpointUrl, model } = loadSettings();
  if (!endpointUrl.trim()) {
    return { ok: false, reason: "config" };
  }
  try {
    const res = await fetch(`${endpointUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "default",
        messages,
        stream: false,
      }),
    });
    if (!res.ok) {
      return { ok: false, reason: "down" };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "(empty response)";
    return { ok: true, content };
  } catch {
    return { ok: false, reason: "down" };
  }
}
