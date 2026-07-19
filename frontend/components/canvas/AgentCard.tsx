"use client";

import {
  ListChecks,
  Megaphone,
  Palette,
  Target,
  Telescope,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { Agent } from "@/lib/types";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const ICON_MAP: Record<string, IconComponent> = {
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
  onClick?: (agent: Agent) => void;
}

export function AgentCard({ agent, x, y, onClick }: Props) {
  const Icon = ICON_MAP[agent.icon] ?? Telescope;
  return (
    <div
      className="pointer-events-auto absolute w-[280px] select-none rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:shadow-md"
      style={{ left: x, top: y, borderLeftWidth: 4, borderLeftColor: agent.color }}
      onClick={() => onClick?.(agent)}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${agent.color}18`, color: agent.color }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight text-card-foreground">
            {agent.name}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{agent.title}</div>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-card-foreground/80">
        {agent.description}
      </p>
    </div>
  );
}
