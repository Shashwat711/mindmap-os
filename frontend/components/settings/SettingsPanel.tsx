"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TOOLS } from "@/lib/tools";
import type {
  McpConnection,
  ModelConnector,
  ModelProvider,
  Tool,
} from "@/lib/types";

const ANTHROPIC_MODELS = [
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];
const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini"];

const PROVIDER_COLORS: Record<string, string> = {
  google: "#4a7a6b",
  github: "#6b6b6b",
  slack: "#7a4a6b",
  notion: "#8a6a3b",
  serpapi: "#5a6b3b",
  apify: "#3b6b7a",
  apollo: "#7a5b3b",
  linkedin: "#3b5a7a",
};

const TABS = [
  { value: "model", label: "Model" },
  { value: "tools", label: "Tools" },
  { value: "mcp", label: "MCP Servers" },
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
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/72 backdrop-blur-[3px]" />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 flex max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg font-mono outline-none"
          style={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #1f1f1f",
            color: "#e5e5e5",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Terminal chrome */}
          <div
            className="flex h-8 shrink-0 items-center justify-between border-b px-3"
            style={{ borderBottomColor: "#1a1a1a", backgroundColor: "#0f0f0f" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#3a1c1c" }}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#3a2f18" }}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#1a3325" }}
                />
              </div>
              <span className="text-[10.5px] tracking-tight text-neutral-500">
                connect@mindmap-os
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 transition-colors hover:text-neutral-100"
              aria-label="Close"
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Header */}
          <div
            className="shrink-0 border-b px-6 pb-0 pt-5"
            style={{ borderBottomColor: "#1a1a1a" }}
          >
            <Dialog.Title className="font-sans text-[18px] font-semibold tracking-tight text-neutral-100">
              Connect your stack
            </Dialog.Title>
            <Dialog.Description className="mt-1 font-sans text-[13px] text-neutral-500">
              Optional. Bring your own model + tool keys, or stay in mock mode.
            </Dialog.Description>
            <div className="mt-5 flex gap-0">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className="border-b-2 px-3 py-2.5 text-[10.5px] uppercase tracking-[0.14em] transition-colors"
                  style={{
                    borderBottomColor:
                      tab === t.value ? "#e5e5e5" : "transparent",
                    color: tab === t.value ? "#f5f5f5" : "#737373",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {tab === "model" && (
              <ModelTab initial={initialConnector} onSave={onSaveConnector} />
            )}
            {tab === "tools" && (
              <ToolsTab initial={initialToolKeys} onSave={onSaveToolKeys} />
            )}
            {tab === "mcp" && (
              <McpTab initial={initialMcp} onSave={onSaveMcp} />
            )}
          </div>

          {/* Sticky bottom tip */}
          <div
            className="flex shrink-0 items-center justify-between gap-4 border-t px-6 py-3"
            style={{ borderTopColor: "#1a1a1a", backgroundColor: "#0f0f0f" }}
          >
            <span className="truncate text-[10.5px] text-neutral-600">
              $ tip: mock mode works with zero setup, connect real APIs anytime
            </span>
            <button
              onClick={onClose}
              className="shrink-0 text-[11px] text-neutral-400 transition-colors hover:text-neutral-100"
            >
              skip for now →
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================================================
// MODEL TAB
// ============================================================================

function ModelTab({
  initial,
  onSave,
}: {
  initial: ModelConnector | null;
  onSave: (c: ModelConnector) => void;
}) {
  const [anthropicKey, setAnthropicKey] = useState(
    initial?.provider === "anthropic" ? initial.apiKey ?? "" : "",
  );
  const [openaiKey, setOpenaiKey] = useState(
    initial?.provider === "openai" ? initial.apiKey ?? "" : "",
  );
  const [anthropicModel, setAnthropicModel] = useState(
    initial?.provider === "anthropic"
      ? initial.model ?? ANTHROPIC_MODELS[1]
      : ANTHROPIC_MODELS[1],
  );
  const [openaiModel, setOpenaiModel] = useState(
    initial?.provider === "openai"
      ? initial.model ?? OPENAI_MODELS[0]
      : OPENAI_MODELS[0],
  );

  const anthropicConnected =
    initial?.provider === "anthropic" && !!initial.apiKey?.trim();
  const openaiConnected =
    initial?.provider === "openai" && !!initial.apiKey?.trim();

  function connect(provider: ModelProvider) {
    if (provider === "anthropic") {
      onSave({
        provider: "anthropic",
        apiKey: anthropicKey.trim(),
        model: anthropicModel,
      });
    } else if (provider === "openai") {
      onSave({
        provider: "openai",
        apiKey: openaiKey.trim(),
        model: openaiModel,
      });
    } else {
      onSave({ provider: "mock" });
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ProviderCard
          name="Anthropic"
          monogram="A"
          monogramColor="#c86a3f"
          apiKey={anthropicKey}
          onKeyChange={setAnthropicKey}
          keyPlaceholder="sk-ant-..."
          connected={anthropicConnected}
          model={anthropicModel}
          onModelChange={setAnthropicModel}
          models={ANTHROPIC_MODELS}
          onConnect={() => connect("anthropic")}
          onDisconnect={() => connect("mock")}
        />
        <ProviderCard
          name="OpenAI"
          monogram="O"
          monogramColor="#4a7a5b"
          apiKey={openaiKey}
          onKeyChange={setOpenaiKey}
          keyPlaceholder="sk-..."
          connected={openaiConnected}
          model={openaiModel}
          onModelChange={setOpenaiModel}
          models={OPENAI_MODELS}
          onConnect={() => connect("openai")}
          onDisconnect={() => connect("mock")}
        />
      </div>
      <div className="text-[10.5px] text-neutral-600">
        # note: keys are stored in your browser only. don&apos;t use production
        keys.
      </div>
    </div>
  );
}

function ProviderCard({
  name,
  monogram,
  monogramColor,
  apiKey,
  onKeyChange,
  keyPlaceholder,
  connected,
  model,
  onModelChange,
  models,
  onConnect,
  onDisconnect,
}: {
  name: string;
  monogram: string;
  monogramColor: string;
  apiKey: string;
  onKeyChange: (v: string) => void;
  keyPlaceholder: string;
  connected: boolean;
  model: string;
  onModelChange: (m: string) => void;
  models: string[];
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const canConnect = apiKey.trim().length > 6;

  return (
    <div
      className="overflow-hidden rounded-md"
      style={{
        backgroundColor: "#0d0d0d",
        borderLeft: `1px solid ${connected ? "#4ade80" : "#2a2a2a"}`,
        borderTop: "1px solid #1a1a1a",
        borderRight: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
        transition: "border-color 200ms ease-out",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-sm text-[11px] font-semibold text-neutral-100"
            style={{ backgroundColor: monogramColor, fontFamily: "inherit" }}
            aria-hidden
          >
            {monogram}
          </span>
          <span className="font-sans text-[13px] font-medium tracking-tight text-neutral-100">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full transition-colors duration-200"
            style={{ backgroundColor: connected ? "#4ade80" : "#404040" }}
          />
          <span className="text-[10.5px] tracking-tight text-neutral-500">
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>

      <div
        className="space-y-2.5 border-t px-3 py-3"
        style={{ borderTopColor: "#1a1a1a" }}
      >
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder={keyPlaceholder}
          className="w-full rounded-sm border px-2.5 py-1.5 font-mono text-[11.5px] outline-none placeholder:text-neutral-700"
          style={{
            backgroundColor: "#050505",
            borderColor: "#1f1f1f",
            color: "#e5e5e5",
          }}
        />
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full rounded-sm border px-2 py-1.5 font-mono text-[11px] outline-none"
          style={{
            backgroundColor: "#050505",
            borderColor: "#1f1f1f",
            color: "#e5e5e5",
          }}
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {connected ? (
          <div className="flex items-center justify-between pt-0.5">
            <span
              className="flex items-center gap-1 text-[10.5px]"
              style={{ color: "#4ade80" }}
            >
              <Check size={11} strokeWidth={2.5} />
              connected
            </span>
            <button
              onClick={onDisconnect}
              className="text-[10.5px] text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-300"
            >
              disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={!canConnect}
            className="w-full rounded-sm py-1.5 text-[11.5px] font-medium transition-colors disabled:opacity-40"
            style={{
              backgroundColor: canConnect ? "#e5e5e5" : "#1a1a1a",
              color: canConnect ? "#0a0a0a" : "#525252",
              fontFamily: "inherit",
            }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TOOLS TAB
// ============================================================================

function ToolsTab({
  initial,
  onSave,
}: {
  initial: Record<string, string>;
  onSave: (keys: Record<string, string>) => void;
}) {
  const [keys, setKeys] = useState<Record<string, string>>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const keyedTools = useMemo(() => TOOLS.filter((t) => t.requiresKey), []);

  function connect(tool: Tool, key: string) {
    const storageName = tool.keyStorageName ?? tool.id;
    const next = { ...keys, [storageName]: key.trim() };
    setKeys(next);
    onSave(next);
    setExpandedId(null);
  }

  function disconnect(tool: Tool) {
    const storageName = tool.keyStorageName ?? tool.id;
    const next = { ...keys };
    delete next[storageName];
    setKeys(next);
    onSave(next);
  }

  return (
    <div className="space-y-3">
      <div className="text-[10.5px] text-neutral-600">
        # tools your agents can call. each one uses its own provider key.
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {keyedTools.map((tool) => {
          const storageName = tool.keyStorageName ?? tool.id;
          const connected = !!keys[storageName]?.trim();
          const expanded = expandedId === tool.id;
          return (
            <ToolConnectorCard
              key={tool.id}
              tool={tool}
              connected={connected}
              expanded={expanded}
              onExpand={() => setExpandedId(expanded ? null : tool.id)}
              onConnect={(k) => connect(tool, k)}
              onDisconnect={() => disconnect(tool)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ToolConnectorCard({
  tool,
  connected,
  expanded,
  onExpand,
  onConnect,
  onDisconnect,
}: {
  tool: Tool;
  connected: boolean;
  expanded: boolean;
  onExpand: () => void;
  onConnect: (key: string) => void;
  onDisconnect: () => void;
}) {
  const [draftKey, setDraftKey] = useState("");
  const color = PROVIDER_COLORS[tool.provider] ?? "#525252";

  return (
    <div
      className="overflow-hidden rounded-md"
      style={{
        backgroundColor: "#0d0d0d",
        borderLeft: `1px solid ${connected ? "#4ade80" : color}`,
        borderTop: "1px solid #1a1a1a",
        borderRight: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[10.5px] font-semibold text-neutral-100"
              style={{ backgroundColor: color, fontFamily: "inherit" }}
              aria-hidden
            >
              {tool.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <div className="font-sans text-[12.5px] font-medium tracking-tight text-neutral-100">
                {tool.name}
              </div>
              <div className="mt-0.5 text-[10.5px] leading-snug text-neutral-500">
                {tool.description}
              </div>
            </div>
          </div>
          {connected ? (
            <div className="flex shrink-0 items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#4ade80" }}
              />
              <span className="text-[10px] text-neutral-500">on</span>
            </div>
          ) : null}
        </div>
        <div className="mt-2.5 flex items-center justify-end gap-2">
          {connected ? (
            <button
              onClick={onDisconnect}
              className="text-[10.5px] text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-300"
            >
              disconnect
            </button>
          ) : expanded ? (
            <>
              <input
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draftKey.trim())
                    onConnect(draftKey);
                }}
                placeholder="paste api key"
                className="min-w-0 flex-1 rounded-sm border px-2 py-1 font-mono text-[11px] outline-none placeholder:text-neutral-700"
                style={{
                  backgroundColor: "#050505",
                  borderColor: "#1f1f1f",
                  color: "#e5e5e5",
                }}
              />
              <button
                onClick={() => draftKey.trim() && onConnect(draftKey)}
                disabled={!draftKey.trim()}
                className="shrink-0 rounded-sm px-2 py-1 text-[10.5px] font-medium transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: draftKey.trim() ? "#e5e5e5" : "#1a1a1a",
                  color: draftKey.trim() ? "#0a0a0a" : "#525252",
                  fontFamily: "inherit",
                }}
              >
                save
              </button>
            </>
          ) : (
            <button
              onClick={onExpand}
              className="rounded-sm border px-2.5 py-1 text-[10.5px] transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: "#2a2a2a",
                color: "#d4d4d4",
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MCP TAB
// ============================================================================

const MOCK_DISCOVERY_POOL = [
  "web_search",
  "calendar_read",
  "calendar_write",
  "docs_read",
  "docs_search",
  "gmail_search",
  "gmail_send",
  "drive_search",
  "notes_read",
  "tasks_list",
];

function hashUrl(url: string): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function discoverFor(url: string): string[] {
  const h = hashUrl(url);
  const count = 2 + (h % 4);
  const start = h % MOCK_DISCOVERY_POOL.length;
  const tools: string[] = [];
  for (let i = 0; i < count; i++) {
    tools.push(MOCK_DISCOVERY_POOL[(start + i) % MOCK_DISCOVERY_POOL.length]);
  }
  return tools;
}

function McpTab({
  initial,
  onSave,
}: {
  initial: McpConnection[];
  onSave: (list: McpConnection[]) => void;
}) {
  const [list, setList] = useState<McpConnection[]>(initial);
  const [draftUrl, setDraftUrl] = useState("");

  function addFromUrl() {
    const url = draftUrl.trim();
    if (!url) return;
    const name = url.replace(/^https?:\/\//, "").split("/")[0];
    const next: McpConnection[] = [
      ...list,
      {
        id: crypto.randomUUID(),
        name,
        url,
        transport: "sse",
        enabled: true,
      },
    ];
    setList(next);
    onSave(next);
    setDraftUrl("");
  }

  function remove(id: string) {
    const next = list.filter((c) => c.id !== id);
    setList(next);
    onSave(next);
  }

  return (
    <div className="space-y-4">
      <div className="text-[10.5px] text-neutral-600">
        # model context protocol servers your agents can call.
      </div>

      <div
        className="flex items-center gap-2 rounded-md border px-3 py-2"
        style={{ backgroundColor: "#0d0d0d", borderColor: "#1f1f1f" }}
      >
        <span className="text-[11.5px] text-neutral-600">$</span>
        <input
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addFromUrl();
          }}
          placeholder="https://mcp.example.com  or  stdio://./server"
          className="min-w-0 flex-1 bg-transparent font-mono text-[11.5px] outline-none placeholder:text-neutral-700"
          style={{ color: "#e5e5e5" }}
        />
        <button
          onClick={addFromUrl}
          disabled={!draftUrl.trim()}
          className="flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1 text-[10.5px] font-medium transition-colors disabled:opacity-40"
          style={{
            backgroundColor: draftUrl.trim() ? "#e5e5e5" : "#1a1a1a",
            color: draftUrl.trim() ? "#0a0a0a" : "#525252",
            fontFamily: "inherit",
          }}
        >
          <Plus size={11} strokeWidth={2.5} />
          add server
        </button>
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
          <div
            className="rounded-md border border-dashed px-4 py-6 text-center text-[11.5px] text-neutral-600"
            style={{ borderColor: "#1f1f1f" }}
          >
            no mcp servers connected yet
          </div>
        )}
        {list.map((conn) => {
          const tools = discoverFor(conn.url);
          return (
            <div
              key={conn.id}
              className="overflow-hidden rounded-md"
              style={{
                backgroundColor: "#0d0d0d",
                borderLeft: "1px solid #4ade80",
                borderTop: "1px solid #1a1a1a",
                borderRight: "1px solid #1a1a1a",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: "#4ade80" }}
                  />
                  <span className="truncate text-[11.5px] text-neutral-200">
                    {conn.name}
                  </span>
                  <span
                    className="shrink-0 rounded-sm border px-1.5 text-[9.5px] uppercase tracking-[0.1em] text-neutral-500"
                    style={{ borderColor: "#2a2a2a" }}
                  >
                    {conn.transport}
                  </span>
                </div>
                <button
                  onClick={() => remove(conn.id)}
                  className="shrink-0 text-neutral-600 transition-colors hover:text-neutral-300"
                  aria-label="Remove server"
                >
                  <Trash2 size={12} strokeWidth={2} />
                </button>
              </div>
              <div
                className="border-t px-3 py-2"
                style={{ borderTopColor: "#1a1a1a" }}
              >
                <div className="text-[10.5px] text-neutral-500">
                  <span style={{ color: "#4ade80" }}>&gt;</span> discovered{" "}
                  {tools.length} tools
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border px-1.5 py-0.5 text-[10px] text-neutral-400"
                      style={{
                        backgroundColor: "#050505",
                        borderColor: "#1f1f1f",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
