"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { TOOLS } from "@/lib/tools";
import type { McpConnection, ModelConnector, ModelProvider } from "@/lib/types";

const PROVIDERS: {
  value: ModelProvider;
  label: string;
  hint: string;
  models: string[];
  defaultModel: string;
}[] = [
  {
    value: "mock",
    label: "Mock mode",
    hint: "Explore the UI with canned responses. No API key required.",
    models: [],
    defaultModel: "",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    hint: "Bring your own key. Stored locally in your browser.",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
    defaultModel: "claude-sonnet-4-6",
  },
  {
    value: "openai",
    label: "OpenAI",
    hint: "Bring your own key. Stored locally in your browser.",
    models: ["gpt-4o", "gpt-4o-mini"],
    defaultModel: "gpt-4o",
  },
];

const TABS = [
  { value: "model", label: "Model" },
  { value: "tools", label: "Tools" },
  { value: "mcp", label: "MCP" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

interface Props {
  open: boolean;
  initialConnector: ModelConnector | null;
  initialToolKeys: Record<string, string>;
  initialMcp: McpConnection[];
  onSaveConnector: (c: ModelConnector) => void;
  onSaveToolKeys: (keys: Record<string, string>) => void;
  onSaveMcp: (list: McpConnection[]) => void;
  onClose: () => void;
}

export function SettingsPanel({
  open,
  initialConnector,
  initialToolKeys,
  initialMcp,
  onSaveConnector,
  onSaveToolKeys,
  onSaveMcp,
  onClose,
}: Props) {
  const [tab, setTab] = useState<TabValue>("model");

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-foreground/40 backdrop-blur-[4px]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 flex max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-card shadow-raised outline-none">
          <div className="border-b border-border px-6 pb-0 pt-6">
            <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
              Settings
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Configure the model, per-tool API keys, and MCP connections.
            </Dialog.Description>
            <div className="mt-5 flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                    tab === t.value
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {tab === "model" && (
              <ModelTab initial={initialConnector} onSave={onSaveConnector} />
            )}
            {tab === "tools" && (
              <ToolsTab initial={initialToolKeys} onSave={onSaveToolKeys} />
            )}
            {tab === "mcp" && <McpTab initial={initialMcp} onSave={onSaveMcp} />}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModelTab({
  initial,
  onSave,
}: {
  initial: ModelConnector | null;
  onSave: (c: ModelConnector) => void;
}) {
  const [provider, setProvider] = useState<ModelProvider>(initial?.provider ?? "mock");
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? "");
  const [model, setModel] = useState(
    initial?.model ??
      PROVIDERS.find((p) => p.value === (initial?.provider ?? "mock"))?.defaultModel ??
      "",
  );
  const current = PROVIDERS.find((p) => p.value === provider)!;
  const requiresKey = provider !== "mock";

  function changeProvider(next: ModelProvider) {
    setProvider(next);
    setModel(PROVIDERS.find((p) => p.value === next)!.defaultModel);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      provider,
      apiKey: requiresKey ? apiKey.trim() : undefined,
      model: requiresKey ? model : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {PROVIDERS.map((p) => (
          <label
            key={p.value}
            className={`flex cursor-pointer flex-col gap-0.5 rounded-md border px-3 py-2.5 transition-colors ${
              provider === p.value
                ? "border-foreground bg-foreground/[0.05]"
                : "border-border hover:border-foreground/40"
            }`}
          >
            <input
              type="radio"
              name="provider"
              value={p.value}
              checked={provider === p.value}
              onChange={() => changeProvider(p.value)}
              className="sr-only"
            />
            <span className="text-[13.5px] font-medium text-foreground">{p.label}</span>
            <span className="text-[11.5px] text-muted-foreground">{p.hint}</span>
          </label>
        ))}
      </div>

      {requiresKey && (
        <>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-foreground">Model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            >
              {current.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-foreground">API key</span>
            <input
              type="password"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "anthropic" ? "sk-ant-..." : "sk-..."}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <span className="block text-[11px] text-muted-foreground">
              Stored in localStorage. Don't use a production key.
            </span>
          </label>
        </>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:bg-foreground/85"
        >
          Save model
        </button>
      </div>
    </form>
  );
}

function ToolsTab({
  initial,
  onSave,
}: {
  initial: Record<string, string>;
  onSave: (keys: Record<string, string>) => void;
}) {
  const [keys, setKeys] = useState<Record<string, string>>(initial);
  const keyedTools = useMemo(() => TOOLS.filter((t) => t.requiresKey), []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(keys);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-[13px] text-muted-foreground">
        Add API keys for tools your agents can call. Keys are stored locally and only sent to
        their respective providers.
      </p>
      <div className="space-y-3">
        {keyedTools.map((tool) => {
          const storageName = tool.keyStorageName ?? tool.id;
          return (
            <div
              key={tool.id}
              className="rounded-md border border-border bg-background/40 p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-medium text-foreground">
                  {tool.name}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {tool.provider}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{tool.description}</p>
              <input
                type="password"
                value={keys[storageName] ?? ""}
                onChange={(e) =>
                  setKeys((prev) => ({ ...prev, [storageName]: e.target.value }))
                }
                placeholder={`${tool.provider} API key`}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:bg-foreground/85"
        >
          Save keys
        </button>
      </div>
    </form>
  );
}

function McpTab({
  initial,
  onSave,
}: {
  initial: McpConnection[];
  onSave: (list: McpConnection[]) => void;
}) {
  const [list, setList] = useState<McpConnection[]>(initial);

  function addConnection() {
    setList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        url: "",
        transport: "sse",
        enabled: true,
      },
    ]);
  }

  function update(id: string, patch: Partial<McpConnection>) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    setList((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(list.filter((c) => c.name.trim() && c.url.trim()));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-[13px] text-muted-foreground">
        Wire in Model Context Protocol servers your agents can call. Connections are stored
        locally; actual dispatch runs through the chat route.
      </p>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
            <p className="text-[13px] text-muted-foreground">No MCP connections yet.</p>
          </div>
        )}
        {list.map((conn) => (
          <div
            key={conn.id}
            className="rounded-md border border-border bg-background/40 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={conn.name}
                onChange={(e) => update(conn.id, { name: e.target.value })}
                placeholder="Connection name"
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={conn.enabled}
                  onChange={(e) => update(conn.id, { enabled: e.target.checked })}
                />
                Enabled
              </label>
              <button
                type="button"
                onClick={() => remove(conn.id)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove connection"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={conn.url}
                onChange={(e) => update(conn.id, { url: e.target.value })}
                placeholder="https://mcp.example.com or command path"
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
              <select
                value={conn.transport}
                onChange={(e) =>
                  update(conn.id, {
                    transport: e.target.value as McpConnection["transport"],
                  })
                }
                className="rounded-md border border-border bg-background px-2 py-1.5 text-[12px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              >
                <option value="sse">SSE</option>
                <option value="http">HTTP</option>
                <option value="stdio">stdio</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={addConnection}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-foreground transition-colors hover:bg-background"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add connection
        </button>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:bg-foreground/85"
        >
          Save MCP
        </button>
      </div>
    </form>
  );
}
