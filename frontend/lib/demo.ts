import type { AgentId, ChatMessage, StartupContext, ToolCall } from "./types";

export const DEMO_CONTEXT: StartupContext = {
  idea: "A meal-prep app for busy parents that plans a week of dinners from what's already in the fridge, in under 90 seconds.",
  problem:
    "Working parents burn ~40 minutes every Sunday planning meals, then abandon the plan by Wednesday when reality hits — kids' after-school changes, one ingredient missing, someone's sick.",
  icp: "Dual-income households with two kids under twelve, household income $110k+, already subscribe to at least one meal service (HelloFresh, Instacart), most active on the app between 8:30 and 10pm.",
  stage: "idea",
  updatedAt: "2026-07-19T14:03:00.000Z",
};

const SOURCES = {
  hellofresh: ["hellofresh.com", "hellofreshgroup.com", "hf-reports.io"],
  meal: ["yougov.com", "morningconsult.com", "reddit.com/r/mealprep"],
  competitors: ["mealime.com", "plantoeat.com", "paprikaapp.com"],
  parenting: ["scarymommy.com", "todaysparent.com", "hn.parents.club"],
};

export interface DemoSourceChip {
  domain: string;
  favicon?: string;
}

export interface DemoToolCall extends Omit<ToolCall, "startedAt" | "endedAt"> {
  sources?: DemoSourceChip[];
  searchingLabel?: string;
  foundLabel?: string;
}

interface Exchange {
  user: string;
  toolCalls?: DemoToolCall[];
  reply: string;
  referencesAgent?: AgentId;
}

function chip(list: string[]): DemoSourceChip[] {
  return list.map((domain) => ({ domain }));
}

const EXCHANGES: Record<AgentId, Exchange[]> = {
  researcher: [
    {
      user: "What's the market look like for a smarter meal-prep app aimed at busy parents?",
      toolCalls: [
        {
          id: "seed-r-1a",
          toolId: "web-search",
          status: "done",
          summary: "Searching meal-kit churn and household meal-planning data",
          result: "8 sources · YouGov, HelloFresh Q3, r/mealprep, Morning Consult",
          searchingLabel: "Searching the web",
          foundLabel: "Found 8 sources",
          sources: chip([...SOURCES.hellofresh.slice(0, 2), ...SOURCES.meal.slice(0, 2)]),
        },
        {
          id: "seed-r-1b",
          toolId: "competitor-scan",
          status: "done",
          summary: "Teardown: Mealime, Plan to Eat, Paprika",
          result: "Cataloged pricing, ICP language, and where each leaves room open",
          searchingLabel: "Scanning competitors",
          foundLabel: "3 teardowns ready",
          sources: chip(SOURCES.competitors),
        },
      ],
      reply: `Market's real but ugly. Meal-kit category grew ~11% CAGR since 2022, but retention is the problem — HelloFresh's own investor deck shows 34% of subscribers churn inside the first 3 months. That's your wedge, not the growth number.

Three things worth knowing:

1. Mealime and Plan to Eat both position around "planning" but bury the "what you already own" angle. Neither reads the pantry. That's a real gap.
2. Paprika has a cult of ~800k paid users, iOS-only, one-time purchase — proves parents will pay for a tool, not a subscription.
3. The Sunday-planning-Wednesday-abandonment pattern shows up in every parenting forum I sampled. Universal enough to lead with.

I'd sharpen the ICP before you build anything. Right now "busy parents" is a category, not a customer. Want me to draft the discovery script?`,
    },
    {
      user: "Yes — draft the discovery questions.",
      toolCalls: [
        {
          id: "seed-r-2a",
          toolId: "web-search",
          status: "done",
          summary: "Pulling Jobs-to-be-Done interview templates",
          result: "Bob Moesta framework + parenting-specific probes",
          searchingLabel: "Searching JTBD frameworks",
          foundLabel: "Found 4 templates",
          sources: chip([...SOURCES.parenting.slice(0, 2), "jobstobedone.org"]),
        },
      ],
      reply: `Five questions. Ask them in order, don't paraphrase, don't lead. Record if you can.

1. Walk me through the last time you planned a week of dinners. Where were you, what time was it, what did you use?
2. What was the moment you realized "this plan isn't going to survive the week"?
3. When the plan broke, what did you actually do — order takeout, improvise, ask your partner?
4. If you could pay someone $20 a month to solve exactly one part of this, which part?
5. Who else in your household would need to be on board for this to work?

Question 4 is the money question. If they hesitate on the price, the pain isn't sharp enough yet. Aim for 12 conversations, then we regroup.`,
    },
  ],
  pm: [
    {
      user: "Given what Researcher found, what's the MVP?",
      toolCalls: [
        {
          id: "seed-p-1a",
          toolId: "roadmap-writer",
          status: "done",
          summary: "Scoping MVP against the 34% churn wedge",
          result: "3 candidate cuts, one recommended",
          searchingLabel: "Analyzing Research findings",
          foundLabel: "3 scope options ready",
        },
      ],
      referencesAgent: "researcher",
      reply: `Building on what Research surfaced — the wedge is "your plan survives Wednesday," not "we plan your week." Those are different products.

Smallest testable slice (v1, 21 days of build):

1. Photo the fridge → app extracts ingredients (use OpenAI vision, no custom model)
2. Generate 4 dinners for the next 4 nights, using what's there + max 3 new items
3. One "the plan just broke" button — regenerates from tonight, keeping tomorrow if possible

That's it. No calendar sync, no grocery integration, no family accounts, no macro tracking. Ship to 20 parents you already know.

Success metric: do 6 of 10 users still open it on day 8? If yes, we've built something. If no, no amount of feature-adding fixes it.`,
    },
    {
      user: "What about grocery-list export? Every competitor has it.",
      toolCalls: [
        {
          id: "seed-p-2a",
          toolId: "roadmap-writer",
          status: "done",
          summary: "Cost-of-scope analysis: grocery integration",
          result: "6 engineer-days, Instacart API terms restrictive",
          searchingLabel: "Weighing scope tradeoffs",
          foundLabel: "Verdict ready",
        },
      ],
      reply: `Every competitor has it and every competitor churns at 34%. That's not a coincidence — grocery lists are table stakes, not a differentiator.

In v1, no. Here's why: the moment you promise "we'll build your grocery list," you own the accuracy problem. One wrong quantity and the user quits. Six engineer-days to build, forever to maintain.

In v2, sure — but only after we know the pantry-vision loop actually works. If we ship the fridge photo and 4 out of 20 users can't be bothered to take it, no amount of grocery integration saves us.

If you push back on this in three weeks with real user complaints, I'll reopen it. Not before.`,
    },
  ],
  cmo: [
    {
      user: "Draft positioning and a one-liner.",
      toolCalls: [
        {
          id: "seed-c-1a",
          toolId: "landing-analyzer",
          status: "done",
          summary: "Auditing competitor hero copy",
          result: "5 patterns identified, 4 to avoid",
          searchingLabel: "Analyzing landing pages",
          foundLabel: "Found 5 hero patterns",
          sources: chip(SOURCES.competitors),
        },
        {
          id: "seed-c-1b",
          toolId: "copy-tester",
          status: "done",
          summary: "Generating 6 one-liner variants",
          result: "2 direct, 2 curiosity, 2 anti-category",
          searchingLabel: "Drafting variants",
          foundLabel: "6 candidates ready",
        },
      ],
      referencesAgent: "pm",
      reply: `Anchoring on PM's cut: the promise is "your plan survives Wednesday." Everything else is downstream.

Positioning:
For dual-income parents who cook most weeknights, [product] is a meal planner that reads your fridge — unlike HelloFresh or Mealime, it works with what you already own, and adapts when the week goes sideways.

One-liner candidates, ranked:

1. "The meal plan that survives Wednesday." — Winner. Refers to the actual failure mode.
2. "Plan dinner from what's in your fridge. In 90 seconds." — Direct, but flat.
3. "Cook the food you already bought." — Anti-category, could work for a landing test.

Landing page: lead with the failure mode ("Sunday's meal plan is already dead by Wednesday"), then the promise, then the 90-second demo. Do NOT show a recipe photo above the fold. Every competitor does. Show the fridge photo → the plan appearing. That's your differentiator visualized.

Launch: Product Hunt is wrong for this — parents don't scroll PH. Warm intros to 3 parenting newsletters and one TikTok creator in the "realistic parenting" niche gets you further.`,
    },
  ],
  "lead-gen": [
    {
      user: "Given the ICP, where do I find the first 50 users?",
      toolCalls: [
        {
          id: "seed-l-1a",
          toolId: "apollo-search",
          status: "done",
          summary: "Searching dual-income parents by trigger event",
          result: "Not the right channel — Apollo is B2B",
          searchingLabel: "Trying Apollo",
          foundLabel: "Wrong channel — pivoting",
        },
        {
          id: "seed-l-1b",
          toolId: "apify-scraper",
          status: "done",
          summary: "Scraping /r/workingparents and /r/mealprep",
          result: "184 recent posts matching pain signals",
          searchingLabel: "Scraping parent communities",
          foundLabel: "Found 184 signal posts",
          sources: chip(["reddit.com/r/workingparents", "reddit.com/r/mealprep"]),
        },
      ],
      referencesAgent: "researcher",
      reply: `Apollo's the wrong tool here — this is consumer, not B2B. Ignoring that lever.

Where the ICP actually lives:

1. r/workingparents (312k members) and r/mealprep (2.1M) — 184 recent posts mentioning "Sunday planning" or "meal plan failed." Not spam-worthy; DM 20 max with a specific reference to their post.
2. Two parenting newsletters worth pitching: The Parenting Reset (18k subs, personal replies) and Kids These Days (43k, sponsors are open).
3. TikTok creators in the "chaotic weeknight dinner" niche — @lazyparenting has 400k, average CPM is $12, or free if you offer beta access.

Cold outreach template — three lines, one ask:

Subject: your post about Wednesday chaos

Saw your post in r/workingparents about the meal plan falling apart mid-week. Building a thing that photographs the fridge and re-plans from there, would love 15 minutes to show you and get told what's dumb about it.

If we're being honest, expect a 6-8% reply rate from Reddit DMs, 18-22% from the newsletter warm intros. Aim for 12 real conversations before you touch a paid channel.`,
    },
  ],
  brand: [
    {
      user: "Names, please. And don't give me another AI-suffixed thing.",
      toolCalls: [
        {
          id: "seed-b-1a",
          toolId: "domain-check",
          status: "done",
          summary: "Checking .com and .app for candidates",
          result: "4 of 6 available",
          searchingLabel: "Checking availability",
          foundLabel: "4 domains open",
        },
        {
          id: "seed-b-1b",
          toolId: "trademark-check",
          status: "done",
          summary: "USPTO search across class 42",
          result: "No blocking marks on the top 3",
          searchingLabel: "USPTO scan",
          foundLabel: "Clean for top 3",
        },
      ],
      referencesAgent: "cmo",
      reply: `Anchoring on CMO's one-liner — "the plan that survives Wednesday" — names should feel warm, direct, a little dry. Not clever. Not "AI."

Three directions:

1. Pantry — .com taken (sold for $28k in '21), .app open. Evocative, obvious, feels like a real utility.
2. Wednesday — themed around the failure mode itself. Bold. .com available. Would let you own a specific day of the week as brand equity.
3. Slate — clean slate, weekly reset. Short, memorable. .com taken by a design agency, but slate.food is open.

My pick: Wednesday. It's unexpected, it's the name of the problem, and no one else will do it because it feels too specific — which is exactly why it works.

Visual direction: warm off-white background (not stark white), a single mustard or terracotta accent, one weight of a humanist serif for the wordmark, sans for everything else. Think a small cookbook publisher, not a tech startup. Avoid: green (health-tech clichè), photos of steaming pans (every meal-kit site), any icon with a chef hat.

Voice: an experienced friend who cooks and doesn't lecture. "Fridge photo. Four dinners. Done." Not "Reimagining weeknight dining with AI." If it sounds like a Salesforce blog, rewrite it.`,
    },
  ],
};

function toChatMessage(
  agentId: AgentId,
  role: "user" | "assistant",
  content: string,
  toolCalls?: DemoToolCall[],
  index = 0,
): ChatMessage {
  const baseTime = new Date("2026-07-19T14:03:00.000Z").getTime();
  return {
    id: `seed-${agentId}-${role}-${index}`,
    agentId,
    role,
    content,
    toolCalls: toolCalls?.map((tc, i) => ({
      id: tc.id,
      toolId: tc.toolId,
      status: tc.status,
      summary: tc.summary,
      result: tc.result,
      startedAt: new Date(baseTime + index * 60000 + i * 3000).toISOString(),
      endedAt: new Date(baseTime + index * 60000 + i * 3000 + 2500).toISOString(),
    })),
    createdAt: new Date(baseTime + index * 60000 + 5000).toISOString(),
  };
}

export function buildSeedHistories(): Record<AgentId, ChatMessage[]> {
  const out: Record<AgentId, ChatMessage[]> = {
    researcher: [],
    pm: [],
    cmo: [],
    "lead-gen": [],
    brand: [],
  };
  (Object.entries(EXCHANGES) as [AgentId, Exchange[]][]).forEach(([agentId, exs]) => {
    exs.forEach((ex, i) => {
      out[agentId].push(toChatMessage(agentId, "user", ex.user, undefined, i * 2));
      out[agentId].push(
        toChatMessage(agentId, "assistant", ex.reply, ex.toolCalls, i * 2 + 1),
      );
    });
  });
  return out;
}

export interface TickerEvent {
  id: string;
  at: number;
  agentId: AgentId;
  label: string;
}

export interface ReferenceBeat {
  id: string;
  at: number;
  from: AgentId;
  to: AgentId;
  label: string;
}

export interface DemoTimeline {
  ticker: TickerEvent[];
  references: ReferenceBeat[];
  activeAgent: { at: number; agentId: AgentId | null }[];
  badges: { at: number; agentId: AgentId }[];
}

export const DEMO_TIMELINE: DemoTimeline = {
  activeAgent: [
    { at: 900, agentId: "researcher" },
    { at: 6600, agentId: "pm" },
    { at: 12400, agentId: "cmo" },
    { at: 18200, agentId: null },
  ],
  ticker: [
    { id: "t-1", at: 900, agentId: "researcher", label: "researcher.web-search  →  querying" },
    { id: "t-2", at: 2300, agentId: "researcher", label: "researcher.web-search  ←  8 sources" },
    { id: "t-3", at: 3600, agentId: "researcher", label: "researcher.competitor-scan  →  running" },
    { id: "t-4", at: 5100, agentId: "researcher", label: "researcher.competitor-scan  ←  3 teardowns" },
    { id: "t-5", at: 6600, agentId: "pm", label: "pm.roadmap-writer  →  scoping" },
    { id: "t-6", at: 8400, agentId: "pm", label: "pm.roadmap-writer  ←  3 scope options" },
    { id: "t-7", at: 9800, agentId: "pm", label: "pm  ⟶  referencing researcher.findings" },
    { id: "t-8", at: 12400, agentId: "cmo", label: "cmo.landing-analyzer  →  auditing" },
    { id: "t-9", at: 14000, agentId: "cmo", label: "cmo.landing-analyzer  ←  5 patterns" },
    { id: "t-10", at: 15100, agentId: "cmo", label: "cmo.copy-tester  →  6 variants" },
    { id: "t-11", at: 16800, agentId: "cmo", label: "cmo  ⟶  referencing pm.scope" },
  ],
  references: [
    { id: "ref-1", at: 9800, from: "pm", to: "researcher", label: "pm reads researcher's wedge" },
    { id: "ref-2", at: 16800, from: "cmo", to: "pm", label: "cmo anchors on pm's cut" },
  ],
  badges: [
    { at: 5500, agentId: "researcher" },
    { at: 11200, agentId: "pm" },
    { at: 17400, agentId: "cmo" },
  ],
};

export const DEMO_SEEN_KEY = "mindmap-os:demo-played";

let _seedAttempted = false;
export function seedDemoIfEmpty(
  hasContext: () => boolean,
  writeContext: (ctx: StartupContext) => void,
  hasChat: (agentId: AgentId) => boolean,
  writeChat: (agentId: AgentId, msgs: ChatMessage[]) => void,
): boolean {
  if (_seedAttempted) return false;
  _seedAttempted = true;
  if (typeof window === "undefined") return false;
  if (hasContext()) return false;
  writeContext(DEMO_CONTEXT);
  const seeds = buildSeedHistories();
  (Object.entries(seeds) as [AgentId, ChatMessage[]][]).forEach(([agentId, msgs]) => {
    if (!hasChat(agentId)) writeChat(agentId, msgs);
  });
  return true;
}
