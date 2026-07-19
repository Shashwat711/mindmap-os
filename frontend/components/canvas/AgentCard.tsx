"use client";

import {
  ListChecks,
  Megaphone,
  Palette,
  Target,
  Telescope,
} from "lucide-react";
import { useRef, useState } from "react";
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
  index?: number;
  onClick?: (agent: Agent) => void;
  onDragEnd?: (agent: Agent, x: number, y: number) => void;
}

export function AgentCard({ agent, x, y, working, index = 0, onClick, onDragEnd }: Props) {
  const Icon = ICON_MAP[agent.icon] ?? Telescope;
  const scale = useCanvasScale();
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

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

  return (
    <div
      onMouseDown={handleMouseDown}
      className="pointer-events-auto absolute w-[280px] cursor-grab select-none rounded-2xl border border-border bg-card p-4 shadow-rest transition-shadow duration-150 hover:shadow-raised active:cursor-grabbing"
      style={{
        left: posX,
        top: posY,
        borderLeftWidth: 4,
        borderLeftColor: agent.color,
        animation: `card-appear 380ms ease-out ${index * 70}ms backwards`,
      }}
    >
      {working && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `0 0 0 3px ${agent.accentColor}`,
              animation: "card-pulse-ring 1.8s ease-out infinite",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `0 0 0 3px ${agent.accentColor}`,
              animation: "card-pulse-ring 1.8s ease-out infinite",
              animationDelay: "0.6s",
            }}
          />
        </>
      )}
      <div className="relative flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${agent.color}1F`, color: agent.color }}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight tracking-tight text-card-foreground">
            {agent.name}
          </div>
          <div className="mt-0.5 text-[12px] leading-none text-muted-foreground">
            {agent.title}
          </div>
        </div>
      </div>
      <p className="relative mt-3 text-[13px] leading-relaxed text-card-foreground/85">
        {agent.description}
      </p>
    </div>
  );
}
