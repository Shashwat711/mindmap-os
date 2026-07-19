"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StartupContext, StartupStage } from "@/lib/types";

export function useStartupContext(workspaceId: string | null) {
  const [context, setContext] = useState<StartupContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [workspaceId]);

  const save = useCallback(
    async (next: StartupContext) => {
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
    [workspaceId],
  );

  return { context, loading, save };
}
