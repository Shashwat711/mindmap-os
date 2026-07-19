import { NextResponse } from "next/server";

interface ChatContext {
  idea?: string;
  problem?: string;
  icp?: string;
  stage?: string;
}

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  provider: "anthropic" | "openai";
  apiKey: string;
  model: string;
  systemPrompt: string;
  context: ChatContext | null;
  history: HistoryMessage[];
  message: string;
}

function contextBlock(ctx: ChatContext | null): string {
  if (!ctx) return "";
  return `\n\n## Founder's startup context
- Idea: ${ctx.idea?.trim() || "(not set)"}
- Problem: ${ctx.problem?.trim() || "(not set)"}
- Ideal customer: ${ctx.icp?.trim() || "(not set)"}
- Stage: ${ctx.stage || "(not set)"}`;
}

async function callAnthropic(body: RequestBody): Promise<string> {
  const system = body.systemPrompt + contextBlock(body.context);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": body.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: body.model,
      max_tokens: 1024,
      system,
      messages: [
        ...body.history,
        { role: "user", content: body.message },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic returned ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") throw new Error("Empty response from Anthropic");
  return text;
}

async function callOpenAI(body: RequestBody): Promise<string> {
  const system = body.systemPrompt + contextBlock(body.context);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${body.apiKey}`,
    },
    body: JSON.stringify({
      model: body.model,
      messages: [
        { role: "system", content: system },
        ...body.history,
        { role: "user", content: body.message },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI returned ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("Empty response from OpenAI");
  return text;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }

  try {
    const content =
      body.provider === "anthropic"
        ? await callAnthropic(body)
        : await callOpenAI(body);
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
