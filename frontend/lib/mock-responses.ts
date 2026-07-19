import type { AgentId, StartupContext } from "./types";

function summarize(context: StartupContext | null): string {
  return context?.idea?.trim() || "your startup";
}

function trim(msg: string, max = 42): string {
  return msg.length > max ? `${msg.slice(0, max)}...` : msg;
}

interface ToolPlanSpec {
  toolId: string;
  summary: (msg: string, ctx: StartupContext | null) => string;
  result: (msg: string, ctx: StartupContext | null) => string;
  fetchUrl?: (msg: string, ctx: StartupContext | null) => string;
}

function slug(text: string, max = 40): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join("-")
    .slice(0, max);
}

const AGENT_TOOL_PLANS: Record<AgentId, ToolPlanSpec[]> = {
  researcher: [
    {
      toolId: "web-search",
      summary: (msg) => `Searching for "${trim(msg)}"`,
      result: () => "12 relevant results across YC, Product Hunt, and X",
      fetchUrl: (msg) =>
        `GET api.serpapi.com/search?q=${slug(msg) || "market-sizing"}&engine=google`,
    },
    {
      toolId: "competitor-scan",
      summary: () => "Scanning three competitor sites",
      result: () => "Cataloged pricing, ICP language, and hero copy",
      fetchUrl: () => "GET mealime.com,plantoeat.com,paprikaapp.com",
    },
  ],
  pm: [
    {
      toolId: "roadmap-writer",
      summary: (_msg, ctx) => `Drafting 30-day roadmap for ${summarize(ctx)}`,
      result: () => "4 weekly milestones, 12 candidate tickets",
      fetchUrl: () => "POST /internal/roadmap/scope",
    },
  ],
  cmo: [
    {
      toolId: "landing-analyzer",
      summary: () => "Analyzing top-3 landing pages in your category",
      result: () => "5 reusable headline patterns identified",
      fetchUrl: () => "GET mealime.com/pricing, plantoeat.com, paprikaapp.com/features",
    },
    {
      toolId: "copy-tester",
      summary: () => "Generating 4 headline variants for A/B",
      result: () => "2 direct, 2 curiosity-driven",
      fetchUrl: () => "POST /internal/copy/variants?n=6",
    },
  ],
  "lead-gen": [
    {
      toolId: "apollo-search",
      summary: (_msg, ctx) =>
        `Apollo search: ${ctx?.icp ? trim(ctx.icp, 32) : "your ICP"}`,
      result: () => "247 people at 89 companies. Verified emails: 71%",
      fetchUrl: () => "GET api.apollo.io/v1/mixed_people/search",
    },
    {
      toolId: "linkedin-scan",
      summary: () => "Enriching prospects from LinkedIn Sales Nav",
      result: () => "50 profiles with recent activity signals",
      fetchUrl: () => "GET linkedin.com/sales/search/people",
    },
  ],
  brand: [
    {
      toolId: "domain-check",
      summary: () => "Checking .com, .app, .xyz for candidates",
      result: () => "3 of 5 candidates have .com available",
      fetchUrl: () => "GET whoisxmlapi.com/whoisserver/WhoisService?domain=pantry.app",
    },
    {
      toolId: "trademark-check",
      summary: () => "USPTO + WIPO search across relevant classes",
      result: () => "No conflicting marks in class 42 (software)",
      fetchUrl: () => "GET tsdr.uspto.gov/api/search?text=pantry&class=42",
    },
  ],
};

export interface PlannedToolCall {
  toolId: string;
  summary: string;
  result: string;
  fetchUrl?: string;
}

export function planToolCalls(
  agentId: AgentId,
  message: string,
  context: StartupContext | null,
): PlannedToolCall[] {
  const plans = AGENT_TOOL_PLANS[agentId] ?? [];
  return plans.map((p) => ({
    toolId: p.toolId,
    summary: p.summary(message, context),
    result: p.result(message, context),
    fetchUrl: p.fetchUrl?.(message, context),
  }));
}

const MOCKS: Record<AgentId, (msg: string, ctx: StartupContext | null) => string> = {
  researcher: (_msg, ctx) => `Before I dig in, a question: when you say "${summarize(ctx)}", are we talking B2B or B2C first? Different competitors show up either way.

Here's how I'd start:
- Market: pull the last three YC batches for adjacent solutions, filter by funding stage.
- Competitors: three direct, two orthogonal. What's each one's wedge?
- Discovery: five questions that would falsify your hypothesis, not confirm it.

Want me to draft the discovery script?`,

  pm: (msg, _ctx) => `OK — "${msg.slice(0, 80)}${msg.length > 80 ? "..." : ""}".

Smallest testable slice:
1. One core workflow, end-to-end, one user role.
2. No settings screen, no admin, no analytics dashboard.
3. Launch to ten named people you already know need this.

If you're adding anything else in v1, what does it replace? Feature creep is how founders lose two months.`,

  cmo: (_msg, ctx) => `First-draft one-liner:

"${summarize(ctx)}"

That's the concept. Now the pitch: what does your user do ten minutes faster because of you? Lead with that.

Landing page structure I'd start with:
- Headline: the outcome they want, in their words
- Sub: why the old way sucks
- CTA: a single, concrete next step — waitlist, demo, or try it now

What channel are we launching on first?`,

  "lead-gen": (_msg, _ctx) => `Your ICP needs sharpening. "Solo founders" is too broad. Real ICPs sound like:

"Non-technical founders, months 1-4 after quitting a full-time role, active on X/HN, currently reading Paul Graham essays daily."

Prospecting stack for that:
- X advanced search: "quit my job" + "building" filters
- HN: Show HN and Ask HN posters this month
- Communities: Indie Hackers, r/SaaS

Cold DM hook: reference something specific they posted. Reply rate goes from 2% to 15%. Want a template?`,

  brand: (_msg, ctx) => `Three name directions off the top:

1. Compound: two familiar words that clash slightly (Linear, Framer, Notion).
2. Latin or mythology reference (Vercel, Cursor, Retool).
3. Verb-as-noun (Ship, Loop, Warp).

For "${summarize(ctx)}", I'd lean direction 1 — signals a working tool, not a startup name. Domains: try .com first, .app as backup, avoid .io in 2026 — feels dated.

Voice: opinionated, terse, doesn't over-explain. Think Linear's changelogs, not Salesforce's blog.

What feeling do you want when someone sees the logo?`,
};

export function generateMockResponse(
  agentId: AgentId,
  message: string,
  context: StartupContext | null,
): string {
  return MOCKS[agentId](message, context);
}
