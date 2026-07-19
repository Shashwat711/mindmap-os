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
  toolIds: string[];
}

export type StartupStage = "idea" | "building" | "launching" | "growing";

export interface StartupContext {
  idea: string;
  problem: string;
  icp: string;
  stage: StartupStage;
  updatedAt: string;
}

export interface Tool {
  id: string;
  name: string;
  provider: string;
  description: string;
  requiresKey: boolean;
  keyStorageName?: string;
}

export type ToolCallStatus = "pending" | "running" | "done" | "error";

export interface ToolCallSource {
  domain: string;
}

export interface ToolCall {
  id: string;
  toolId: string;
  status: ToolCallStatus;
  summary: string;
  result?: string;
  startedAt: string;
  endedAt?: string;
  searchingLabel?: string;
  foundLabel?: string;
  sources?: ToolCallSource[];
  fetchUrl?: string;
}

export interface ChatMessage {
  id: string;
  agentId: AgentId;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  createdAt: string;
}

export type ModelProvider = "anthropic" | "openai" | "mock";

export interface ModelConnector {
  provider: ModelProvider;
  apiKey?: string;
  model?: string;
}

export interface ToolKey {
  toolId: string;
  apiKey: string;
}

export interface McpConnection {
  id: string;
  name: string;
  url: string;
  transport: "sse" | "stdio" | "http";
  enabled: boolean;
}

export interface CardPosition {
  agentId: AgentId;
  x: number;
  y: number;
}
