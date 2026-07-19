"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { AgentCard } from "@/components/canvas/AgentCard";
import { ActivityLayer } from "@/components/canvas/ActivityLayer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { StartupContextDialog } from "@/components/onboarding/StartupContextDialog";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { AGENTS } from "@/lib/agents";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { useStartupContext } from "@/lib/hooks/useStartupContext";
import type {
  Agent,
  AgentId,
  McpConnection,
  ModelConnector,
  StartupContext,
  ToolCall,
} from "@/lib/types";

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
  const { activeId, loading: workspaceLoading } = useWorkspace();
  const {
    context,
    loading: contextLoading,
    save: saveContext,
  } = useStartupContext(activeId);

  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connector, setConnector] = useState<ModelConnector | null>(null);
  const [toolKeys, setToolKeys] = useState<Record<string, string>>({});
  const [mcpConnections, setMcpConnections] = useState<McpConnection[]>([]);
  const [positions, setPositions] = useState<Positions>(DEFAULT_POSITIONS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activity, setActivity] = useState<{
    agentId: AgentId;
    toolCalls: ToolCall[];
  } | null>(null);

  useEffect(() => {
    const storedPositions = readStorage<Positions>(STORAGE_KEYS.cardPositions);
    if (storedPositions) setPositions({ ...DEFAULT_POSITIONS, ...storedPositions });

    const storedConnector = readStorage<ModelConnector>(STORAGE_KEYS.connector);
    setConnector(storedConnector);

    const storedToolKeys = readStorage<Record<string, string>>(STORAGE_KEYS.toolKeys);
    if (storedToolKeys) setToolKeys(storedToolKeys);

    const storedMcp = readStorage<McpConnection[]>(STORAGE_KEYS.mcpConnections);
    if (storedMcp) setMcpConnections(storedMcp);
  }, []);

  useEffect(() => {
    if (workspaceLoading || contextLoading) return;
    if (!context) setContextDialogOpen(true);
  }, [workspaceLoading, contextLoading, context]);

  async function handleSaveContext(next: StartupContext) {
    await saveContext(next);
    setContextDialogOpen(false);
  }

  function handleSaveConnector(next: ModelConnector) {
    writeStorage(STORAGE_KEYS.connector, next);
    setConnector(next);
  }

  function handleSaveToolKeys(next: Record<string, string>) {
    writeStorage(STORAGE_KEYS.toolKeys, next);
    setToolKeys(next);
  }

  function handleSaveMcp(next: McpConnection[]) {
    writeStorage(STORAGE_KEYS.mcpConnections, next);
    setMcpConnections(next);
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
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-baseline gap-2.5">
          <span className="text-sm font-semibold tracking-tight text-foreground">mindmap-os</span>
          <span className="text-xs text-muted-foreground">Your AI cofounder team on a canvas</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectorConnected ? "bg-emerald-600" : "bg-muted-foreground/40"
              }`}
            />
            {connectorLabel(connector)}
          </button>
          {context && (
            <button
              onClick={() => setContextDialogOpen(true)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Edit context
            </button>
          )}
        </div>
      </header>

      <div className="flex-1">
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
                index={i}
                onDragEnd={handleDragEnd}
                onClick={setSelectedAgent}
              />
            );
          })}
          <ActivityLayer activity={activity} positions={positions} />
        </Canvas>
      </div>

      <ChatPanel
        agent={selectedAgent}
        context={context}
        connector={connector}
        onClose={() => setSelectedAgent(null)}
        onActivity={setActivity}
      />

      <StartupContextDialog
        open={contextDialogOpen}
        initial={context}
        onSave={handleSaveContext}
        onSkip={() => setContextDialogOpen(false)}
      />

      <SettingsPanel
        open={settingsOpen}
        initialConnector={connector}
        initialToolKeys={toolKeys}
        initialMcp={mcpConnections}
        onSaveConnector={handleSaveConnector}
        onSaveToolKeys={handleSaveToolKeys}
        onSaveMcp={handleSaveMcp}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}
