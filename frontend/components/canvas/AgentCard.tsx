"use client";

import {
  ListChecks,
  Megaphone,
  Palette,
  Target,
  Telescope,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Agent } from "@/lib/types";
import { useCanvasScale } from "./Canvas";

const ICON_MAP: Record<string, typeof Telescope> = {
  Telescope,
  ListChecks,
  Megaphone,
  Target,
  Palette,
};

interface Props {
  agent: Agent;
  x: number;
  y: number;
  working?: boolean;
  selected?: boolean;
  unread?: boolean;
  index?: number;
  onClick?: (agent: Agent) => void;
  onDragEnd?: (agent: Agent, x: number, y: number) => void;
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 184;

export const CARD_DIMENSIONS = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  portOffsetY: CARD_HEIGHT / 2,
};

const CHROME_DOT_COLORS = {
  red: "#3a1c1c",
  yellow: "#3a2f18",
  green: "#1a3325",
};

function TerminalCursor({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="ml-[2px] inline-block h-[1em] w-[7px] translate-y-[2px] align-baseline"
      style={{
        backgroundColor: color,
        animation: "terminal-cursor 1.06s steps(2, end) infinite",
      }}
    />
  );
}

function ThinkingDots() {
  return (
    <span aria-hidden className="inline-flex">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            animation: "thinking-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 180}ms`,
          }}
        >
          .
        </span>
      ))}
    </span>
  );
}

export function AgentCard({
  agent,
  x,
  y,
  working,
  selected,
  unread,
  index = 0,
  onClick,
  onDragEnd,
}: Props) {
  const Icon = ICON_MAP[agent.icon] ?? Telescope;
  const scale = useCanvasScale();
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [justFinished, setJustFinished] = useState(false);
  const prevWorking = useRef(working);
  const dragState = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (prevWorking.current && !working) {
      setJustFinished(true);
      const t = window.setTimeout(() => setJustFinished(false), 1600);
      prevWorking.current = working;
      return () => window.clearTimeout(t);
    }
    prevWorking.current = working;
  }, [working]);

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    dragState.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: x,
      startY: y,
      moved: false,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    const state = dragState.current;
    if (!state) return;
    const dx = (e.clientX - state.startClientX) / scale;
    const dy = (e.clientY - state.startClientY) / scale;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) state.moved = true;
    setDragPos({ x: state.startX + dx, y: state.startY + dy });
  }

  function handleMouseUp() {
    const state = dragState.current;
    if (!state) return;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    if (state.moved && dragPos) {
      onDragEnd?.(agent, Math.round(dragPos.x), Math.round(dragPos.y));
    } else {
      onClick?.(agent);
    }
    dragState.current = null;
    setDragPos(null);
  }

  const posX = dragPos?.x ?? x;
  const posY = dragPos?.y ?? y;
  const accent = agent.accentColor;

  const statusLabel = working ? "thinking" : justFinished ? "done" : "idle";
  const statusColor = working
    ? "#e5e5e5"
    : justFinished
      ? "#4ade80"
      : "#a3a3a3";

  return (
    <div
      onMouseDown={handleMouseDown}
      className="pointer-events-auto absolute select-none overflow-hidden rounded-md font-mono transition-colors duration-150 active:cursor-grabbing"
      style={{
        left: posX,
        top: posY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#0a0a0a",
        cursor: "grab",
        borderTop: `1px solid ${accent}`,
        borderRight: "1px solid #1f1f1f",
        borderBottom: "1px solid #1f1f1f",
        borderLeft: `1px solid ${accent}`,
        boxShadow: selected
          ? `0 0 0 1px ${accent}66, 0 6px 20px rgba(0, 0, 0, 0.55)`
          : "0 2px 10px rgba(0, 0, 0, 0.35)",
        animation: working
          ? `card-appear 380ms ease-out ${index * 70}ms backwards`
          : `card-appear 380ms ease-out ${index * 70}ms backwards, card-breath ${5.2 + (index % 3) * 0.6}s ease-in-out ${1200 + index * 340}ms infinite`,
      }}
    >
      {unread && !selected && (
        <span
          aria-label="New message"
          className="pointer-events-none absolute -right-1 -top-1 z-10 flex h-3 w-3 items-center justify-center"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: accent,
              animation: "badge-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
              opacity: 0.55,
            }}
          />
          <span
            className="relative h-2 w-2 rounded-full"
            style={{
              backgroundColor: accent,
              boxShadow: "0 0 0 2px #0a0a0a",
            }}
          />
        </span>
      )}

      {/* Terminal chrome bar */}
      <div
        className="flex h-6 items-center gap-2 border-b px-2.5"
        style={{
          backgroundColor: "#0f0f0f",
          borderBottomColor: "#1f1f1f",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full transition-colors duration-200"
            style={{ backgroundColor: working ? accent : CHROME_DOT_COLORS.red }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: CHROME_DOT_COLORS.yellow }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: CHROME_DOT_COLORS.green }}
          />
        </div>
        <span className="text-[10.5px] leading-none tracking-tight text-neutral-500">
          {agent.id}@mindmap-os
        </span>
      </div>

      {/* Body */}
      <div className="relative flex h-[calc(100%-24px)] flex-col px-3 pb-3 pt-2.5">
        <div className="flex items-start gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border"
            style={{
              backgroundColor: "#131313",
              borderColor: "#242424",
              color: agent.color,
            }}
          >
            <Icon size={16} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1 pt-[1px]">
            <div className="text-[13px] font-semibold leading-tight tracking-tight text-neutral-100">
              {agent.name}
            </div>
            <div className="mt-0.5 text-[10.5px] leading-none text-neutral-500">
              {agent.title}
            </div>
          </div>
        </div>

        <div
          className="mt-2.5 flex items-baseline text-[11.5px] leading-none"
          style={{ color: statusColor }}
        >
          <span className="mr-1" style={{ color: accent }}>
            $
          </span>
          <span className="mr-1 text-neutral-500">status:</span>
          <span>
            {statusLabel}
            {working && <ThinkingDots />}
            {justFinished && <span className="ml-1">✓</span>}
          </span>
          <TerminalCursor color={accent} />
        </div>

        <p
          className="mt-2.5 line-clamp-3 flex-1 overflow-hidden text-[11.5px] leading-[1.5] text-neutral-500"
          style={{ letterSpacing: "-0.005em" }}
        >
          <span className="mr-1" style={{ color: accent }}>
            &gt;
          </span>
          {agent.description}
        </p>
      </div>

      {/* Activity sweep bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"
        style={{ backgroundColor: working ? "#141414" : "transparent" }}
      >
        {working && (
          <div
            className="h-full w-1/3"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              animation: "activity-sweep 1.4s linear infinite",
            }}
          />
        )}
      </div>

      {/* Ports */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border"
        style={{
          left: -5,
          backgroundColor: "#0a0a0a",
          borderColor: working ? accent : "#2a2a2a",
          boxShadow: working ? `0 0 0 3px ${accent}22` : undefined,
          transition: "box-shadow 180ms ease-out, border-color 180ms ease-out",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border"
        style={{
          right: -5,
          backgroundColor: "#0a0a0a",
          borderColor: working ? accent : "#2a2a2a",
          boxShadow: working ? `0 0 0 3px ${accent}22` : undefined,
          transition: "box-shadow 180ms ease-out, border-color 180ms ease-out",
        }}
      />
    </div>
  );
}
