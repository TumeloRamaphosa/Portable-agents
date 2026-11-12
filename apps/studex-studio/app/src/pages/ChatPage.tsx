import { useEffect, useState } from "react";
import {
  sendChat,
  loadQueuedMessages,
  saveQueuedMessages,
  type ChatMessage,
} from "../lib/chat";
import { loadSettings } from "../lib/settings";

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [endpointDown, setEndpointDown] = useState(false);
  const [queued, setQueued] = useState<ChatMessage[]>(loadQueuedMessages());

  useEffect(() => {
  }, []);

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const result = await sendChat(history);
    if (result.ok) {
      setEndpointDown(false);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: result.content },
      ]);
    } else if (result.reason === "down") {
      setEndpointDown(true);
      const q = [...queued, userMsg];
      setQueued(q);
      saveQueuedMessages(q);
    } else {
      setEndpointDown(true);
    }
  }

  const settings = loadSettings();

  return (
    <>
      <h1 className="headline">Writers&apos; Room</h1>
      <p style={{ color: "var(--muted)" }}>
        OpenAI-compatible endpoint · model: {settings.model || "(set in Settings)"}
      </p>

      {endpointDown && (
        <div className="banner warn">endpoint down — message queued locally</div>
      )}

      {queued.length > 0 && (
        <div className="banner">
          {queued.length} queued message(s) waiting for endpoint
        </div>
      )}

      <section className="panel">
        <div className="chat-log">
          {messages.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Draft scripts and shot notes here.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="chat-row">
              <div className="role">{m.role}</div>
              <div>{m.content}</div>
            </div>
          ))}
        </div>
        <div className="field-row">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message the Writers' Room…"
          />
        </div>
        <button type="button" className="btn primary" onClick={onSend}>
          Send
        </button>
      </section>
    </>
  );
}
