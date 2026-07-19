"use client";

import { useEffect, useState } from "react";
import { getAgentById } from "@/lib/agents";
import { CARD_DIMENSIONS } from "./AgentCard";
import type { Agent, AgentId, ToolCall } from "@/lib/types";

interface Props {
  activity: { agentId: AgentId; toolCalls: ToolCall[] } | null;
  positions: Record<AgentId, { x: number; y: number }>;
}

const SUB_WIDTH = 200;
const SUB_HEIGHT = 44;
const SUB_GAP_Y = 6;
const HORIZONTAL_OFFSET = 40;

const { width: CARD_W, height: CARD_H } = CARD_DIMENSIONS;

type Phase = "entering" | "running" | "done" | "expiring";

interface SubProps {
  call: ToolCall;
  agent: Agent;
  parentPos: { x: number; y: number };
  stackIndex: number;
  totalCount: number;
}

function SubProcessNode({ call, agent, parentPos, stackIndex, totalCount }: SubProps) {
  const [phase, setPhase] = useState<Phase>(
    call.status === "done" ? "done" : "entering",
  );
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (phase !== "entering") return;
    const t = window.setTimeout(() => {
      setPhase(call.status === "done" ? "done" : "running");
    }, 30);
    return () => window.clearTimeout(t);
  }, [phase, call.status]);

  useEffect(() => {
    if (call.status === "done" && phase === "running") {
      setPhase("done");
    }
  }, [call.status, phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const jitter = 1800 + Math.random() * 1400;
    const t = window.setTimeout(() => setPhase("done"), jitter);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => setPhase("expiring"), 2000);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "expiring") return;
    const t = window.setTimeout(() => setGone(true), 420);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (gone) return null;

  const stackTotalHeight = totalCount * SUB_HEIGHT + (totalCount - 1) * SUB_GAP_Y;
  const parentCenterY = parentPos.y + CARD_H / 2;
  const startY = parentCenterY - stackTotalHeight / 2;
  const nodeX = parentPos.x + CARD_W + HORIZONTAL_OFFSET;
  const nodeY = startY + stackIndex * (SUB_HEIGHT + SUB_GAP_Y);

  const opacity = phase === "entering" ? 0 : phase === "expiring" ? 0 : 1;
  const scale = phase === "entering" ? 0.85 : 1;

  const isDone = phase === "done" || phase === "expiring";
  const runningText = call.searchingLabel || call.summary;
  const doneText = call.foundLabel || call.result || call.summary;
  const displayText = isDone ? doneText : runningText;

  const parentPortX = parentPos.x + CARD_W;
  const parentPortY = parentCenterY;
  const subPortX = nodeX;
  const subPortY = nodeY + SUB_HEIGHT / 2;
  const bendX = parentPortX + HORIZONTAL_OFFSET / 2;

  return (
    <>
      <svg
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        style={{
          width: 1,
          height: 1,
          opacity,
          transition: "opacity 400ms ease-out",
        }}
        aria-hidden
      >
        <path
          d={`M ${parentPortX} ${parentPortY} L ${bendX} ${parentPortY} L ${bendX} ${subPortY} L ${subPortX} ${subPortY}`}
          fill="none"
          stroke={agent.accentColor}
          strokeWidth={1}
          strokeOpacity={0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 5"
          style={{ animation: "wire-flow 0.9s linear infinite" }}
        />
      </svg>

      <div
        className="pointer-events-none absolute overflow-hidden rounded-md font-mono"
        style={{
          left: nodeX,
          top: nodeY,
          width: SUB_WIDTH,
          height: SUB_HEIGHT,
          backgroundColor: "#0a0a0a",
          borderLeft: `1px solid ${agent.accentColor}`,
          borderTop: "1px solid #1a1a1a",
          borderRight: "1px solid #1a1a1a",
          borderBottom: "1px solid #1a1a1a",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "left center",
          transition: "opacity 400ms ease-out, transform 200ms ease-out",
        }}
      >
        <div className="flex h-full flex-col justify-center gap-1 px-2.5">
          <div className="flex items-center gap-1.5">
            {isDone ? (
              <span
                aria-hidden
                className="inline-block text-[10.5px] leading-none"
                style={{ color: agent.accentColor }}
              >
                ✓
              </span>
            ) : (
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: agent.accentColor,
                  animation: "thinking-dot 1.4s ease-in-out infinite",
                }}
              />
            )}
            <span className="truncate text-[10.5px] leading-none tracking-tight text-neutral-200">
              {call.toolId}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              aria-hidden
              className="text-[10px] leading-none"
              style={{ color: agent.accentColor, opacity: 0.8 }}
            >
              &gt;
            </span>
            <span className="truncate text-[10px] leading-tight text-neutral-500">
              {displayText}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function ActivityLayer({ activity, positions }: Props) {
  if (!activity) return null;
  const agent = getAgentById(activity.agentId);
  const pos = positions[activity.agentId];
  if (!agent || !pos) return null;

  const visible = activity.toolCalls.filter(
    (tc) => tc.status === "running" || tc.status === "done",
  );
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((call, i) => (
        <SubProcessNode
          key={call.id}
          call={call}
          agent={agent}
          parentPos={pos}
          stackIndex={i}
          totalCount={visible.length}
        />
      ))}
    </>
  );
}
