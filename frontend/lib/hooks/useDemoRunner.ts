"use client";

import { useEffect, useRef } from "react";
import { DEMO_SEEN_KEY, DEMO_TIMELINE, type ReferenceBeat, type TickerEvent } from "@/lib/demo";
import type { AgentId } from "@/lib/types";

export interface DemoHandlers {
  onActive?: (agentId: AgentId | null) => void;
  onBadge?: (agentId: AgentId) => void;
  onReference?: (ref: ReferenceBeat) => void;
  onTicker?: (event: TickerEvent) => void;
  onFinished?: () => void;
}

export function useDemoRunner(enabled: boolean, handlers: DemoHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const timers: number[] = [];
    const schedule = (at: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, at));
    };

    DEMO_TIMELINE.activeAgent.forEach(({ at, agentId }) =>
      schedule(at, () => handlersRef.current.onActive?.(agentId)),
    );
    DEMO_TIMELINE.badges.forEach(({ at, agentId }) =>
      schedule(at, () => handlersRef.current.onBadge?.(agentId)),
    );
    DEMO_TIMELINE.references.forEach((ref) =>
      schedule(ref.at, () => handlersRef.current.onReference?.(ref)),
    );
    DEMO_TIMELINE.ticker.forEach((event) =>
      schedule(event.at, () => handlersRef.current.onTicker?.(event)),
    );

    const lastAt = Math.max(
      0,
      ...DEMO_TIMELINE.activeAgent.map((b) => b.at),
      ...DEMO_TIMELINE.ticker.map((b) => b.at),
      ...DEMO_TIMELINE.badges.map((b) => b.at),
    );
    schedule(lastAt + 400, () => {
      window.localStorage.setItem(DEMO_SEEN_KEY, "1");
      handlersRef.current.onFinished?.();
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [enabled]);
}
