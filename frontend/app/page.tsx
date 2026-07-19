"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { StartupContextDialog } from "@/components/onboarding/StartupContextDialog";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { StartupContext } from "@/lib/types";

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
        <Canvas>{/* agent cards render here */}</Canvas>
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
