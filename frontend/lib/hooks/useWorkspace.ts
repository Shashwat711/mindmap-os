"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

const ACTIVE_KEY = "mindmap-os:active-workspace";

const LOCAL_WORKSPACE: Workspace = {
  id: "local",
  name: "Local workspace",
  createdAt: new Date(0).toISOString(),
};

interface WorkspaceRow {
  id: string;
  name: string;
  created_at: string;
}

function toWorkspace(row: WorkspaceRow): Workspace {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function useWorkspace() {
  const local = !isSupabaseConfigured();

  const [workspaces, setWorkspaces] = useState<Workspace[]>(
    local ? [LOCAL_WORKSPACE] : [],
  );
  const [activeId, setActiveIdState] = useState<string | null>(
    local ? LOCAL_WORKSPACE.id : null,
  );
  const [loading, setLoading] = useState(!local);

  const refresh = useCallback(async () => {
    if (local) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load workspaces", error);
      setLoading(false);
      return;
    }

    const items = (data ?? []).map(toWorkspace);
    setWorkspaces(items);

    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem(ACTIVE_KEY) : null;
    const validStored = items.some((w) => w.id === stored) ? stored : null;
    const nextActive = validStored ?? items[0]?.id ?? null;
    setActiveIdState(nextActive);
    if (nextActive && typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_KEY, nextActive);
    }
    setLoading(false);
  }, [local]);

  useEffect(() => {
    if (local) return;
    void refresh();
  }, [refresh, local]);

  const setActive = useCallback(
    (id: string) => {
      if (local) return;
      setActiveIdState(id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_KEY, id);
      }
    },
    [local],
  );

  const create = useCallback(
    async (name: string): Promise<string> => {
      if (local) return LOCAL_WORKSPACE.id;
      const supabase = createClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Not signed in");

      const { data, error } = await supabase
        .from("workspaces")
        .insert({ name, user_id: user.id })
        .select("id, name, created_at")
        .single();
      if (error || !data) throw error ?? new Error("Insert failed");
      await refresh();
      setActive(data.id);
      return data.id;
    },
    [local, refresh, setActive],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      if (local) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [local, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      if (local) return;
      const supabase = createClient();
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [local, refresh],
  );

  const active = workspaces.find((w) => w.id === activeId) ?? null;

  return { workspaces, activeId, active, loading, setActive, create, rename, remove, refresh };
}
