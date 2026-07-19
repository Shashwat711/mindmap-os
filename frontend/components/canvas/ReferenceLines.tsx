"use client";

import { getAgentById } from "@/lib/agents";
import { CARD_DIMENSIONS } from "./AgentCard";
import type { ReferenceBeat } from "@/lib/demo";
import type { AgentId } from "@/lib/types";

interface Props {
  refs: ReferenceBeat[];
  positions: Record<AgentId, { x: number; y: number }>;
}

const { width: CARD_W, portOffsetY: PORT_Y } = CARD_DIMENSIONS;

function portOf(pos: { x: number; y: number }, side: "left" | "right") {
  return {
    x: side === "left" ? pos.x : pos.x + CARD_W,
    y: pos.y + PORT_Y,
  };
}

export function ReferenceLines({ refs, positions }: Props) {
  if (refs.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      style={{ width: 1, height: 1 }}
      aria-hidden
    >
      <defs>
        {refs.map((ref) => {
          const fromAgent = getAgentById(ref.from);
          return (
            <marker
              key={`arrow-${ref.id}`}
              id={`ref-arrow-${ref.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M0,0 L10,5 L0,10 Z"
                fill={fromAgent?.accentColor ?? "#1c1917"}
              />
            </marker>
          );
        })}
      </defs>
      {refs.map((ref) => {
        const from = positions[ref.from];
        const to = positions[ref.to];
        const fromAgent = getAgentById(ref.from);
        if (!from || !to || !fromAgent) return null;

        const fromCenterX = from.x + CARD_W / 2;
        const toCenterX = to.x + CARD_W / 2;
        const fromSide: "left" | "right" = toCenterX >= fromCenterX ? "right" : "left";
        const toSide: "left" | "right" = fromSide === "right" ? "left" : "right";

        const a = portOf(from, fromSide);
        const b = portOf(to, toSide);

        const dx = b.x - a.x;
        const distX = Math.abs(dx) || 1;
        const handle = Math.max(60, Math.min(180, distX * 0.55));
        const c1x = fromSide === "right" ? a.x + handle : a.x - handle;
        const c2x = toSide === "left" ? b.x - handle : b.x + handle;

        const path = `M ${a.x} ${a.y} C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`;
        const approxLen = Math.hypot(dx, b.y - a.y) + handle * 1.5;

        return (
          <g
            key={ref.id}
            style={{
              animation: "ref-fade 2400ms ease-out forwards",
              color: fromAgent.accentColor,
            }}
          >
            <path
              d={path}
              fill="none"
              stroke={fromAgent.accentColor}
              strokeOpacity={0.18}
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d={path}
              fill="none"
              stroke={fromAgent.accentColor}
              strokeWidth={1.6}
              strokeLinecap="round"
              markerEnd={`url(#ref-arrow-${ref.id})`}
              strokeDasharray={approxLen}
              strokeDashoffset={approxLen}
              style={{
                animation: `ref-draw 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              }}
            />
            <path
              d={path}
              fill="none"
              stroke={fromAgent.accentColor}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeDasharray="3 8"
              strokeOpacity={0.85}
              style={{
                animation: "wire-flow 1.2s linear infinite",
                animationDelay: "0.9s",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
