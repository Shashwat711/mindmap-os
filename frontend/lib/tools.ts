import type { Tool } from "./types";

export const TOOLS: Tool[] = [
  {
    id: "web-search",
    name: "Web search",
    provider: "serpapi",
    description: "Google and Bing search results via SerpAPI.",
    requiresKey: true,
    keyStorageName: "serpapi",
  },
  {
    id: "apify-scraper",
    name: "Apify scraper",
    provider: "apify",
    description: "Run any Apify actor — competitor scrapes, LinkedIn, Twitter.",
    requiresKey: true,
    keyStorageName: "apify",
  },
  {
    id: "competitor-scan",
    name: "Competitor scan",
    provider: "internal",
    description: "Structured teardown of a company URL — positioning, pricing, wedge.",
    requiresKey: false,
  },
  {
    id: "roadmap-writer",
    name: "Roadmap writer",
    provider: "internal",
    description: "Drafts a 30-day roadmap from the current startup context.",
    requiresKey: false,
  },
  {
    id: "landing-analyzer",
    name: "Landing analyzer",
    provider: "internal",
    description: "Rewrites landing page headlines against the current positioning.",
    requiresKey: false,
  },
  {
    id: "copy-tester",
    name: "Copy tester",
    provider: "internal",
    description: "Generates A/B variants of a headline or one-liner.",
    requiresKey: false,
  },
  {
    id: "apollo-search",
    name: "Apollo search",
    provider: "apollo",
    description: "People and company search via Apollo.io.",
    requiresKey: true,
    keyStorageName: "apollo",
  },
  {
    id: "linkedin-scan",
    name: "LinkedIn scan",
    provider: "linkedin",
    description: "Pull LinkedIn Sales Nav lists into structured prospects.",
    requiresKey: true,
    keyStorageName: "linkedin",
  },
  {
    id: "domain-check",
    name: "Domain check",
    provider: "internal",
    description: "WHOIS lookup + TLD availability for name candidates.",
    requiresKey: false,
  },
  {
    id: "trademark-check",
    name: "Trademark check",
    provider: "internal",
    description: "USPTO and international trademark search for a proposed name.",
    requiresKey: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    provider: "google",
    description: "Read files and search across your Drive.",
    requiresKey: true,
    keyStorageName: "google-drive",
  },
  {
    id: "github",
    name: "GitHub",
    provider: "github",
    description: "Browse repos, issues, and PRs your team already lives in.",
    requiresKey: true,
    keyStorageName: "github",
  },
  {
    id: "slack",
    name: "Slack",
    provider: "slack",
    description: "Post to channels and read recent thread context.",
    requiresKey: true,
    keyStorageName: "slack",
  },
  {
    id: "notion",
    name: "Notion",
    provider: "notion",
    description: "Pull specs and notes straight from your workspace.",
    requiresKey: true,
    keyStorageName: "notion",
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}
