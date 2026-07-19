export type AgentId =
  | "researcher"
  | "pm"
  | "cmo"
  | "lead-gen"
  | "brand";

export interface Agent {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  systemPrompt: string;
  color: string;
  accentColor: string;
  icon: string;
}

export type StartupStage = "idea" | "building" | "launching" | "growing";

export interface StartupContext {
  idea: string;
  problem: string;
  icp: string;
  stage: StartupStage;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  agentId: AgentId;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export type ModelProvider = "anthropic" | "openai" | "mock";

export interface ModelConnector {
  provider: ModelProvider;
  apiKey?: string;
  model?: string;
}

export interface CardPosition {
  agentId: AgentId;
  x: number;
  y: number;
}
