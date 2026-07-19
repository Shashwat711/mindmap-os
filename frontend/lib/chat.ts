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
  message,
}: SendParams): Promise<string> {
  const provider = connector?.provider ?? "mock";

  if (provider === "mock") {
    await new Promise((r) => setTimeout(r, 450));
    return generateMockResponse(agent.id, message, context);
  }

  throw new Error(
    `Provider "${provider}" is not wired up yet. Switch to Mock mode or wait for the next commit.`,
  );
}
