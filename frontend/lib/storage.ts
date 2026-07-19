const NAMESPACE = "mindmap-os";

const key = (name: string) => `${NAMESPACE}:${name}`;

export function readStorage<T>(name: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key(name));
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStorage<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(name), JSON.stringify(value));
}

export function clearStorage(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(name));
}

export const STORAGE_KEYS = {
  startupContext: "startup-context",
  cardPositions: "card-positions",
  chatHistory: (agentId: string) => `chat:${agentId}`,
  connector: "model-connector",
  toolKeys: "tool-keys",
  mcpConnections: "mcp-connections",
} as const;
