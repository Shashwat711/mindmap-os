import { generateMockResponse, planToolCalls } from "./mock-responses";
import type {
  Agent,
  ChatMessage,
  ModelConnector,
  StartupContext,
  ToolCall,
} from "./types";

interface SendParams {
  agent: Agent;
  connector: ModelConnector | null;
  context: StartupContext | null;
  history: ChatMessage[];
  message: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function jitter(base: number, spread: number): number {
  return base + Math.random() * spread;
}

async function runMock(
  agent: Agent,
  context: StartupContext | null,
  message: string,
  onUpdate?: (msg: ChatMessage) => void,
): Promise<ChatMessage> {
  const plans = planToolCalls(agent.id, message, context);
  const now = () => new Date().toISOString();

  const initialToolCalls: ToolCall[] = plans.map((p) => ({
    id: crypto.randomUUID(),
    toolId: p.toolId,
    status: "pending",
    summary: p.summary,
    fetchUrl: p.fetchUrl,
    startedAt: now(),
  }));

  let current: ChatMessage = {
    id: crypto.randomUUID(),
    agentId: agent.id,
    role: "assistant",
    content: "",
    toolCalls: initialToolCalls,
    createdAt: now(),
  };
  onUpdate?.(current);

  for (let i = 0; i < initialToolCalls.length; i++) {
    await sleep(jitter(280, 200));
    current = {
      ...current,
      toolCalls: current.toolCalls!.map((tc, idx) =>
        idx === i ? { ...tc, status: "running" } : tc,
      ),
    };
    onUpdate?.(current);

    await sleep(jitter(650, 500));
    current = {
      ...current,
      toolCalls: current.toolCalls!.map((tc, idx) =>
        idx === i
          ? { ...tc, status: "done", result: plans[i].result, endedAt: now() }
          : tc,
      ),
    };
    onUpdate?.(current);
  }

  await sleep(320);
  current = { ...current, content: generateMockResponse(agent.id, message, context) };
  onUpdate?.(current);

  return current;
}

export async function sendMessage(
  { agent, connector, context, history, message }: SendParams,
  onUpdate?: (msg: ChatMessage) => void,
): Promise<ChatMessage> {
  const provider = connector?.provider ?? "mock";

  if (provider === "mock") {
    return runMock(agent, context, message, onUpdate);
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
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);

  const finalMsg: ChatMessage = {
    id: crypto.randomUUID(),
    agentId: agent.id,
    role: "assistant",
    content: data.content,
    createdAt: new Date().toISOString(),
  };
  onUpdate?.(finalMsg);
  return finalMsg;
}
