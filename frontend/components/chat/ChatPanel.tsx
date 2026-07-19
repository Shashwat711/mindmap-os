"use client";

import {
  Check,
  ListChecks,
  Megaphone,
  Palette,
  Target,
  Telescope,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  Agent,
  ChatMessage,
  ModelConnector,
  StartupContext,
  ToolCall,
} from "@/lib/types";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import { sendMessage } from "@/lib/chat";
import { getToolById } from "@/lib/tools";

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

function ToolCallChip({ call, accent }: { call: ToolCall; accent: string }) {
  const tool = getToolById(call.toolId);
  const label = tool?.name ?? call.toolId;
  const dotClass =
    call.status === "pending"
      ? "border border-border"
      : call.status === "running"
        ? "animate-pulse"
        : call.status === "done"
          ? ""
          : "bg-destructive";
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px]">
      {call.status === "done" ? (
        <Check
          size={12}
          strokeWidth={2.5}
          className="mt-[3px] shrink-0"
          style={{ color: accent }}
        />
      ) : (
        <span
          className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
          style={call.status === "running" ? { backgroundColor: accent } : undefined}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="mt-0.5 text-[12.5px] text-foreground/85">{call.summary}</div>
        {call.status === "done" && call.result && (
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{call.result}</div>
        )}
      </div>
    </div>
  );
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
  }, [messages]);

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

    const capturedAgent = agent;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      agentId: capturedAgent.id,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    writeStorage(STORAGE_KEYS.chatHistory(capturedAgent.id), withUser);
    setDraft("");
    setSending(true);

    function upsert(msg: ChatMessage) {
      setMessages((prev) => {
        const existing = prev.findIndex((m) => m.id === msg.id);
        const next =
          existing >= 0
            ? prev.map((m, i) => (i === existing ? msg : m))
            : [...prev, msg];
        writeStorage(STORAGE_KEYS.chatHistory(capturedAgent.id), next);
        return next;
      });
    }

    try {
      await sendMessage(
        {
          agent: capturedAgent,
          connector,
          context,
          history: messages,
          message: trimmed,
        },
        upsert,
      );
    } catch (err) {
      upsert({
        id: crypto.randomUUID(),
        agentId: capturedAgent.id,
        role: "assistant",
        content: err instanceof Error ? err.message : "Something went wrong.",
        createdAt: new Date().toISOString(),
      });
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

  const lastMessage = messages[messages.length - 1];
  const waitingForFirstAssistant =
    sending && (!lastMessage || lastMessage.role === "user");

  return (
    <aside
      className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col border-l border-border bg-background shadow-raised"
      style={{ animation: "slide-in-right 180ms ease-out" }}
    >
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${agent.color}1F`, color: agent.color }}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight tracking-tight text-foreground">
            {agent.name}
          </div>
          <div className="mt-0.5 text-[12px] leading-none text-muted-foreground">
            {agent.title}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Close chat"
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="mt-10 space-y-2">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Ask {agent.name} about{" "}
              <span className="text-foreground">{agent.title.toLowerCase()}</span>.
            </p>
            {!context && (
              <p className="text-[12px] text-muted-foreground/70">
                Tip: fill in your startup context for sharper answers.
              </p>
            )}
          </div>
        )}
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div
                key={msg.id}
                className="ml-6 whitespace-pre-wrap rounded-xl bg-foreground px-3.5 py-2.5 text-[13.5px] leading-relaxed text-background"
              >
                {msg.content}
              </div>
            );
          }
          return (
            <div key={msg.id} className="mr-6 space-y-2">
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="space-y-1.5">
                  {msg.toolCalls.map((call) => (
                    <ToolCallChip key={call.id} call={call} accent={agent.accentColor} />
                  ))}
                </div>
              )}
              {msg.content && (
                <div className="whitespace-pre-wrap rounded-xl bg-card px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground shadow-rest">
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
        {waitingForFirstAssistant && (
          <div className="mr-6 flex gap-1 rounded-xl bg-card px-3.5 py-3 shadow-rest">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card/60 p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agent.name}...`}
          rows={2}
          disabled={sending}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:opacity-50"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Enter to send · Shift+Enter for newline
          </span>
          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
