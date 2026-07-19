"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAgentById } from "@/lib/agents";
import type { TickerEvent } from "@/lib/demo";

interface Props {
  events: TickerEvent[];
  startTime: number | null;
}

function formatTs(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  const whole = Math.floor(s);
  const dec = Math.floor((s - whole) * 10);
  const mm = String(Math.floor(whole / 60)).padStart(2, "0");
  const ss = String(whole % 60).padStart(2, "0");
  return `${mm}:${ss}.${dec}`;
}

export function ActivityTicker({ events, startTime }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [events.length]);

  if (events.length === 0 || startTime === null) return null;

  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-4 z-30 w-[340px] overflow-hidden rounded-lg border border-border bg-card/95 shadow-rest backdrop-blur-sm"
      style={{ animation: "message-in 220ms ease-out" }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between border-b border-border/70 px-3 py-1.5 text-left transition-colors hover:bg-background/50"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600"
          />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            system.activity
          </span>
          <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground/70">
            · {events.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronUp size={12} strokeWidth={2} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={12} strokeWidth={2} className="text-muted-foreground" />
        )}
      </button>
      {!collapsed && (
        <div
          ref={scrollRef}
          className="max-h-[168px] overflow-y-auto px-3 py-2"
          style={{ scrollbarWidth: "thin" }}
        >
          <ul className="space-y-[3px] font-mono text-[11px] leading-[1.55]">
            {events.map((event) => {
              const agent = getAgentById(event.agentId);
              const ts = formatTs(event.at);
              return (
                <li
                  key={event.id}
                  className="flex items-baseline gap-2"
                  style={{ animation: "ticker-in 240ms ease-out" }}
                >
                  <span className="tabular-nums text-muted-foreground/70">{ts}</span>
                  <span
                    aria-hidden
                    className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-[1px]"
                    style={{ backgroundColor: agent?.accentColor ?? "#a8a29e" }}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground/85">
                    {event.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
