"use client";

import { useEffect, useState } from "react";
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">mindmap-os</h1>
      <p className="text-lg text-muted-foreground">Your AI cofounder team on a canvas</p>

      {hydrated && context && (
        <button
          onClick={() => setDialogOpen(true)}
          className="mt-4 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Edit startup context
        </button>
      )}

      <StartupContextDialog
        open={dialogOpen}
        initial={context}
        onSave={handleSave}
        onSkip={() => setDialogOpen(false)}
      />
    </main>
  );
}
