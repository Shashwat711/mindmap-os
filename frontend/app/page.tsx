"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { AgentCard } from "@/components/canvas/AgentCard";
import { StartupContextDialog } from "@/components/onboarding/StartupContextDialog";
import { AGENTS } from "@/lib/agents";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { AgentId, StartupContext } from "@/lib/types";

const DEFAULT_POSITIONS: Record<AgentId, { x: number; y: number }> = {
  researcher: { x: 80, y: 100 },
  pm: { x: 420, y: 60 },
  cmo: { x: 760, y: 120 },
  "lead-gen": { x: 200, y: 380 },
  brand: { x: 580, y: 400 },
};

export default function Home() {
  const [context, setContext] = useState<StartupContext | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStorage<StartupContext>(STORAGE_KEYS.startupContext);
    setContext(stored);
    setDialogOpen(stored === null);
    setHydrated(true);
  }, []);

  function handleSave(next: StartupContext) {
    writeStorage(STORAGE_KEYS.startupContext, next);
    setContext(next);
    setDialogOpen(false);
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold tracking-tight">mindmap-os</span>
          <span className="text-xs text-muted-foreground">Your AI cofounder team on a canvas</span>
        </div>
        {hydrated && context && (
          <button
            onClick={() => setDialogOpen(true)}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Edit context
          </button>
        )}
      </header>

      <div className="flex-1">
        <Canvas>
          {AGENTS.map((agent) => {
            const pos = DEFAULT_POSITIONS[agent.id];
            return <AgentCard key={agent.id} agent={agent} x={pos.x} y={pos.y} />;
          })}
        </Canvas>
      </div>

      <StartupContextDialog
        open={dialogOpen}
        initial={context}
        onSave={handleSave}
        onSkip={() => setDialogOpen(false)}
      />
    </main>
  );
}
