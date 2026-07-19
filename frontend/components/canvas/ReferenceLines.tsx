"use client";

import { getAgentById } from "@/lib/agents";
import type { ReferenceBeat } from "@/lib/demo";
import type { AgentId } from "@/lib/types";

const CARD_W = 280;
const CARD_H = 168;

interface Props {
  refs: ReferenceBeat[];
  positions: Record<AgentId, { x: number; y: number }>;
}

function centerOf(pos: { x: number; y: number }) {
  return { x: pos.x + CARD_W / 2, y: pos.y + CARD_H / 2 };
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

        const a = centerOf(from);
        const b = centerOf(to);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;

        // Trim endpoints so the line starts/ends at the card edge, not the center.
        const trim = 90;
        const ax = a.x + (dx / dist) * trim;
        const ay = a.y + (dy / dist) * trim;
        const bx = b.x - (dx / dist) * trim;
        const by = b.y - (dy / dist) * trim;

        // Perpendicular offset for curve control point.
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const bow = Math.min(120, dist * 0.22);
        const cx = (ax + bx) / 2 + perpX * bow;
        const cy = (ay + by) / 2 + perpY * bow;

        const path = `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
        const approxLen = Math.hypot(bx - ax, by - ay) + bow;

        return (
          <g key={ref.id} style={{ animation: "ref-fade 2400ms ease-out forwards" }}>
            <path
              d={path}
              fill="none"
              stroke={fromAgent.accentColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              markerEnd={`url(#ref-arrow-${ref.id})`}
              strokeDasharray={approxLen}
              strokeDashoffset={approxLen}
              style={{
                animation: `ref-draw 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
