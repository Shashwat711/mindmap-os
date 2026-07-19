"use client";

import {
  ListChecks,
  Megaphone,
  Palette,
  Target,
  Telescope,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Agent, ChatMessage, ModelConnector, StartupContext } from "@/lib/types";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import { sendMessage } from "@/lib/chat";

const ICON_MAP: Record<string, typeof Telescope> = {
  Telescope,
  ListChecks,
  Megaphone,
  Target,
  Palette,
};

interface Props {
  agent: Agent | null;
  context: StartupContext | null;
  connector: ModelConnector | null;
  onClose: () => void;
}

export function ChatPanel({ agent, context, connector, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!agent) {
      setMessages([]);
      return;
    }
    const stored = readStorage<ChatMessage[]>(STORAGE_KEYS.chatHistory(agent.id));
    setMessages(stored ?? []);
  }, [agent]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    if (!agent) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agent, onClose]);

  if (!agent) return null;

  const Icon = ICON_MAP[agent.icon] ?? Telescope;

  async function send() {
    if (!agent) return;
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      agentId: agent.id,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    writeStorage(STORAGE_KEYS.chatHistory(agent.id), withUser);
    setDraft("");
    setSending(true);

    try {
      const content = await sendMessage({
        agent,
        connector,
        context,
        history: messages,
        message: trimmed,
      });
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        agentId: agent.id,
        role: "assistant",
        content,
        createdAt: new Date().toISOString(),
      };
      const withReply = [...withUser, reply];
      setMessages(withReply);
      writeStorage(STORAGE_KEYS.chatHistory(agent.id), withReply);
    } catch (err) {
      const error: ChatMessage = {
        id: crypto.randomUUID(),
        agentId: agent.id,
        role: "assistant",
        content: err instanceof Error ? err.message : "Something went wrong.",
        createdAt: new Date().toISOString(),
      };
      const withError = [...withUser, error];
      setMessages(withError);
      writeStorage(STORAGE_KEYS.chatHistory(agent.id), withError);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col border-l border-border bg-background shadow-xl">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${agent.color}18`, color: agent.color }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight">{agent.name}</div>
          <div className="text-xs text-muted-foreground">{agent.title}</div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close chat"
        >
          <X size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Ask {agent.name} about{" "}
              <span className="text-foreground">{agent.title.toLowerCase()}</span>.
            </p>
            {!context && (
              <p className="mt-2 text-xs text-muted-foreground/70">
                Tip: fill in your startup context for sharper answers.
              </p>
            )}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "ml-6 bg-foreground text-background"
                : "mr-6 bg-muted text-foreground"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {sending && (
          <div className="mr-6 flex gap-1 rounded-xl bg-muted px-3.5 py-2.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agent.name}...`}
          rows={2}
          disabled={sending}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Enter to send · Shift+Enter for newline
          </span>
          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/85 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
