"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

const ACTIVE_KEY = "mindmap-os:active-workspace";

interface WorkspaceRow {
  id: string;
  name: string;
  created_at: string;
}

function toWorkspace(row: WorkspaceRow): Workspace {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function useWorkspace() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActive = useCallback((id: string) => {
    setActiveIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_KEY, id);
    }
  }, []);

  const create = useCallback(
    async (name: string): Promise<string> => {
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
    [refresh, setActive],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const active = workspaces.find((w) => w.id === activeId) ?? null;

  return { workspaces, activeId, active, loading, setActive, create, rename, remove, refresh };
}
