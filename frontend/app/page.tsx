"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { AgentCard } from "@/components/canvas/AgentCard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { StartupContextDialog } from "@/components/onboarding/StartupContextDialog";
import { ConnectorDialog } from "@/components/settings/ConnectorDialog";
import { AGENTS } from "@/lib/agents";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { Agent, AgentId, ModelConnector, StartupContext } from "@/lib/types";

type Positions = Record<AgentId, { x: number; y: number }>;

const DEFAULT_POSITIONS: Positions = {
  researcher: { x: 80, y: 100 },
  pm: { x: 420, y: 60 },
  cmo: { x: 760, y: 120 },
  "lead-gen": { x: 200, y: 380 },
  brand: { x: 580, y: 400 },
};

function connectorLabel(connector: ModelConnector | null): string {
  if (!connector || connector.provider === "mock") return "Mock mode";
  return connector.provider === "anthropic" ? "Anthropic" : "OpenAI";
}

export default function Home() {
  const [context, setContext] = useState<StartupContext | null>(null);
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [connectorDialogOpen, setConnectorDialogOpen] = useState(false);
  const [connector, setConnector] = useState<ModelConnector | null>(null);
  const [positions, setPositions] = useState<Positions>(DEFAULT_POSITIONS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedContext = readStorage<StartupContext>(STORAGE_KEYS.startupContext);
    setContext(storedContext);
    setContextDialogOpen(storedContext === null);

    const storedPositions = readStorage<Positions>(STORAGE_KEYS.cardPositions);
    if (storedPositions) setPositions({ ...DEFAULT_POSITIONS, ...storedPositions });

    const storedConnector = readStorage<ModelConnector>(STORAGE_KEYS.connector);
    setConnector(storedConnector);

    setHydrated(true);
  }, []);

  function handleSaveContext(next: StartupContext) {
    writeStorage(STORAGE_KEYS.startupContext, next);
    setContext(next);
    setContextDialogOpen(false);
  }

  function handleSaveConnector(next: ModelConnector) {
    writeStorage(STORAGE_KEYS.connector, next);
    setConnector(next);
    setConnectorDialogOpen(false);
  }

  function handleDragEnd(agent: Agent, x: number, y: number) {
    setPositions((prev) => {
      const next = { ...prev, [agent.id]: { x, y } };
      writeStorage(STORAGE_KEYS.cardPositions, next);
      return next;
    });
  }

  const connectorConnected = connector && connector.provider !== "mock" && connector.apiKey;

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold tracking-tight">mindmap-os</span>
          <span className="text-xs text-muted-foreground">Your AI cofounder team on a canvas</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConnectorDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectorConnected ? "bg-emerald-500" : "bg-muted-foreground/50"
              }`}
            />
            {connectorLabel(connector)}
          </button>
          {hydrated && context && (
            <button
              onClick={() => setContextDialogOpen(true)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Edit context
            </button>
          )}
        </div>
      </header>

      <div className="flex-1">
        <Canvas>
          {AGENTS.map((agent) => {
            const pos = positions[agent.id];
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                x={pos.x}
                y={pos.y}
                onDragEnd={handleDragEnd}
                onClick={setSelectedAgent}
              />
            );
          })}
        </Canvas>
      </div>

      <ChatPanel
        agent={selectedAgent}
        context={context}
        onClose={() => setSelectedAgent(null)}
      />

      <StartupContextDialog
        open={contextDialogOpen}
        initial={context}
        onSave={handleSaveContext}
        onSkip={() => setContextDialogOpen(false)}
      />

      <ConnectorDialog
        open={connectorDialogOpen}
        initial={connector}
        onSave={handleSaveConnector}
        onClose={() => setConnectorDialogOpen(false)}
      />
    </main>
  );
}
