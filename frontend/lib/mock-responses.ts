import type { AgentId, StartupContext } from "./types";

function summarize(context: StartupContext | null): string {
  return context?.idea?.trim() || "your startup";
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
