import { generateMockResponse } from "./mock-responses";
import type { Agent, ChatMessage, ModelConnector, StartupContext } from "./types";

interface SendParams {
  agent: Agent;
  connector: ModelConnector | null;
  context: StartupContext | null;
  history: ChatMessage[];
  message: string;
}

export async function sendMessage({
  agent,
  connector,
  context,
  history,
  message,
}: SendParams): Promise<string> {
  const provider = connector?.provider ?? "mock";

  if (provider === "mock") {
    await new Promise((r) => setTimeout(r, 450));
    return generateMockResponse(agent.id, message, context);
  }

  if (!connector?.apiKey) {
    throw new Error("No API key configured. Open the connector settings.");
  }

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      provider,
      apiKey: connector.apiKey,
      model: connector.model,
      systemPrompt: agent.systemPrompt,
      context,
      history: history.map((h) => ({ role: h.role, content: h.content })),
      message,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data.content;
}
