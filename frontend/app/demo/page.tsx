"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityLayer } from "@/components/canvas/ActivityLayer";
import { ActivityTicker } from "@/components/canvas/ActivityTicker";
import { AgentCard } from "@/components/canvas/AgentCard";
import { Canvas } from "@/components/canvas/Canvas";
import { ReferenceLines } from "@/components/canvas/ReferenceLines";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { AGENTS } from "@/lib/agents";
import {
  DEMO_CONTEXT,
  buildDemoActivity,
  buildSeedHistories,
  type ReferenceBeat,
  type TickerEvent,
} from "@/lib/demo";
import { useDemoRunner } from "@/lib/hooks/useDemoRunner";
import { writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { Agent, AgentId, ToolCall } from "@/lib/types";

const DEMO_NAMESPACE = "demo";

const DEFAULT_POSITIONS: Record<AgentId, { x: number; y: number }> = {
  researcher: { x: 80, y: 100 },
  pm: { x: 420, y: 60 },
  cmo: { x: 760, y: 120 },
  "lead-gen": { x: 200, y: 380 },
  brand: { x: 580, y: 400 },
};

function synthesizeActivity(agentId: AgentId): {
  agentId: AgentId;
  toolCalls: ToolCall[];
} {
  return {
    agentId,
    toolCalls: buildDemoActivity(agentId, new Date().toISOString()),
  };
}

export default function DemoPage() {
  const [replayKey, setReplayKey] = useState(0);
  return (
    <DemoWorkspace
      key={replayKey}
      onReplay={() => setReplayKey((k) => k + 1)}
    />
  );
}

function DemoWorkspace({ onReplay }: { onReplay: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [activity, setActivity] = useState<{
    agentId: AgentId;
    toolCalls: ToolCall[];
  } | null>(null);
  const [unreadAgents, setUnreadAgents] = useState<Set<AgentId>>(new Set());
  const [activeRefs, setActiveRefs] = useState<ReferenceBeat[]>([]);
  const [tickerEvents, setTickerEvents] = useState<TickerEvent[]>([]);
  const [tickerStart, setTickerStart] = useState<number | null>(null);

  useEffect(() => {
    const seeds = buildSeedHistories();
    (Object.entries(seeds) as [AgentId, ReturnType<typeof buildSeedHistories>[AgentId]][]).forEach(
      ([agentId, msgs]) => {
        writeStorage(STORAGE_KEYS.chatHistory(agentId, DEMO_NAMESPACE), msgs);
      },
    );
  }, []);

  useDemoRunner(true, {
    onActive: (agentId) =>
      setActivity(agentId ? synthesizeActivity(agentId) : null),
    onBadge: (agentId) =>
      setUnreadAgents((prev) => {
        if (prev.has(agentId)) return prev;
        const next = new Set(prev);
        next.add(agentId);
        return next;
      }),
    onReference: (ref) => {
      setActiveRefs((prev) => [...prev, ref]);
      window.setTimeout(() => {
        setActiveRefs((prev) => prev.filter((r) => r.id !== ref.id));
      }, 2400);
    },
    onTicker: (event) => {
      setTickerStart((prev) => prev ?? Date.now());
      setTickerEvents((prev) => [...prev, event]);
    },
  });

  function selectAgent(agent: Agent | null) {
    setSelectedAgent(agent);
    if (agent) {
      setUnreadAgents((prev) => {
        if (!prev.has(agent.id)) return prev;
        const next = new Set(prev);
        next.delete(agent.id);
        return next;
      });
    }
  }

  function handleDragEnd(agent: Agent, x: number, y: number) {
    setPositions((prev) => ({ ...prev, [agent.id]: { x, y } }));
  }

  return (
    <main className="flex h-screen flex-col">
      <div
        className="flex h-9 shrink-0 items-center justify-between border-b px-4 font-mono text-[11.5px]"
        style={{ backgroundColor: "#0a0a0a", borderBottomColor: "#1f1f1f" }}
      >
        <div className="flex items-center gap-2 text-neutral-400">
          <span
            aria-hidden
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
          />
          <span className="text-neutral-500">$</span>
          <span>viewing a live demo with sample data</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-neutral-400 transition-colors hover:text-neutral-100"
          >
            start your own →
          </Link>
        </div>
      </div>

      <div className="relative flex-1">
        <Canvas>
          {AGENTS.map((agent, i) => {
            const pos = positions[agent.id];
            const working = activity?.agentId === agent.id;
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                x={pos.x}
                y={pos.y}
                working={working}
                selected={isSelected}
                unread={unreadAgents.has(agent.id)}
                index={i}
                onDragEnd={handleDragEnd}
                onClick={selectAgent}
              />
            );
          })}
          <ActivityLayer activity={activity} positions={positions} />
          <ReferenceLines refs={activeRefs} positions={positions} />
        </Canvas>

        <ActivityTicker events={tickerEvents} startTime={tickerStart} />

        <button
          onClick={onReplay}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-[11.5px] shadow-lg transition-colors"
          style={{
            backgroundColor: "#0a0a0a",
            borderColor: "#2a2a2a",
            color: "#d4d4d4",
          }}
        >
          <RotateCcw size={12} strokeWidth={2} />
          replay demo
        </button>
      </div>

      <ChatPanel
        agent={selectedAgent}
        context={DEMO_CONTEXT}
        connector={null}
        onClose={() => selectAgent(null)}
        onActivity={setActivity}
        storageNamespace={DEMO_NAMESPACE}
      />
    </main>
  );
}
