"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import type { ModelConnector, ModelProvider } from "@/lib/types";

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

interface Props {
  open: boolean;
  initial: ModelConnector | null;
  onSave: (connector: ModelConnector) => void;
  onClose: () => void;
}

export function ConnectorDialog({ open, initial, onSave, onClose }: Props) {
  const [provider, setProvider] = useState<ModelProvider>(initial?.provider ?? "mock");
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? "");
  const [model, setModel] = useState(
    initial?.model ?? PROVIDERS.find((p) => p.value === (initial?.provider ?? "mock"))?.defaultModel ?? "",
  );

  const currentProvider = PROVIDERS.find((p) => p.value === provider)!;
  const requiresKey = provider !== "mock";

  function changeProvider(next: ModelProvider) {
    setProvider(next);
    const p = PROVIDERS.find((x) => x.value === next)!;
    setModel(p.defaultModel);
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
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-foreground/40 backdrop-blur-[4px]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-card p-6 shadow-raised outline-none">
          <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            Connect a model
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Choose who's answering. Your API key stays in your browser.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                    {currentProvider.models.map((m) => (
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

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:bg-foreground/85"
              >
                Save connector
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
