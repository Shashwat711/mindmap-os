"use client";

import type { AgentId, ToolCall } from "@/lib/types";
import { getAgentById } from "@/lib/agents";
import { getToolById } from "@/lib/tools";

interface Props {
  activity: { agentId: AgentId; toolCalls: ToolCall[] } | null;
  positions: Record<AgentId, { x: number; y: number }>;
}

const CARD_W = 280;
const CARD_H = 168;
const NODE_W = 148;
const NODE_H = 26;

const OFFSETS: Array<[number, number]> = [
  [-NODE_W - 24, -12],
  [CARD_W + 24, -12],
  [CARD_W + 48, CARD_H / 2 - NODE_H / 2],
  [CARD_W + 24, CARD_H - NODE_H + 12],
  [-NODE_W - 24, CARD_H - NODE_H + 12],
  [-NODE_W - 48, CARD_H / 2 - NODE_H / 2],
];

export function ActivityLayer({ activity, positions }: Props) {
  if (!activity) return null;
  const agent = getAgentById(activity.agentId);
  const pos = positions[activity.agentId];
  if (!agent || !pos) return null;

  const cardCenterX = pos.x + CARD_W / 2;
  const cardCenterY = pos.y + CARD_H / 2;

  const visible = activity.toolCalls.filter(
    (tc) => tc.status === "running" || tc.status === "done",
  );
  if (visible.length === 0) return null;

  return (
    <>
      <svg
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        style={{ width: 1, height: 1 }}
        aria-hidden
      >
        {visible.map((call, i) => {
          const [dx, dy] = OFFSETS[i % OFFSETS.length];
          const nodeCenterX = pos.x + dx + NODE_W / 2;
          const nodeCenterY = pos.y + dy + NODE_H / 2;
          const midX = (cardCenterX + nodeCenterX) / 2;
          const midY = (cardCenterY + nodeCenterY) / 2 - 20;
          const done = call.status === "done";
          return (
            <path
              key={call.id}
              d={`M ${cardCenterX} ${cardCenterY} Q ${midX} ${midY} ${nodeCenterX} ${nodeCenterY}`}
              fill="none"
              stroke={agent.accentColor}
              strokeWidth={1.5}
              strokeDasharray={done ? undefined : "4 4"}
              opacity={done ? 0.3 : 0.75}
              style={done ? undefined : { animation: "dash-flow 0.8s linear infinite" }}
            />
          );
        })}
      </svg>

      {visible.map((call, i) => {
        const tool = getToolById(call.toolId);
        const [dx, dy] = OFFSETS[i % OFFSETS.length];
        const done = call.status === "done";
        return (
          <div
            key={call.id}
            className="pointer-events-none absolute flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] shadow-rest"
            style={{
              left: pos.x + dx,
              top: pos.y + dy,
              width: NODE_W,
              height: NODE_H,
              animation: "ghost-node-in 260ms ease-out",
              opacity: done ? 0.7 : 1,
            }}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                call.status === "running" ? "animate-pulse" : ""
              }`}
              style={{ backgroundColor: agent.accentColor }}
            />
            <span className="truncate text-foreground/85">
              {tool?.name ?? call.toolId}
            </span>
          </div>
        );
      })}
    </>
  );
}
