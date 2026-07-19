"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { StartupContext, StartupStage } from "@/lib/types";

export function useStartupContext(workspaceId: string | null) {
  const local = !isSupabaseConfigured();
  const [context, setContext] = useState<StartupContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (local) {
      setContext(readStorage<StartupContext>(STORAGE_KEYS.startupContext));
      setLoading(false);
      return;
    }
    if (!workspaceId) {
      setContext(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("startup_contexts")
      .select("idea, problem, icp, stage, updated_at")
      .eq("workspace_id", workspaceId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("useStartupContext load", error);
        if (data) {
          setContext({
            idea: data.idea ?? "",
            problem: data.problem ?? "",
            icp: data.icp ?? "",
            stage: (data.stage as StartupStage) ?? "idea",
            updatedAt: data.updated_at,
          });
        } else {
          setContext(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, local]);

  const save = useCallback(
    async (next: StartupContext) => {
      if (local) {
        writeStorage(STORAGE_KEYS.startupContext, next);
        setContext(next);
        return;
      }
      if (!workspaceId) return;
      const supabase = createClient();
      const { error } = await supabase.from("startup_contexts").upsert({
        workspace_id: workspaceId,
        idea: next.idea,
        problem: next.problem,
        icp: next.icp,
        stage: next.stage,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setContext(next);
    },
    [workspaceId, local],
  );

  return { context, loading, save };
}
