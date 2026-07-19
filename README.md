# mindmap-os

Your AI cofounder team on a canvas. Spin up a lineup of specialist agents — Researcher, Product Manager, CMO, Lead Gen, Brand — and get from raw idea to first move without waiting to hire.

## Overview

`mindmap-os` is a canvas workspace for solo and early-stage founders. Instead of jumping between five different chat tabs, you get five role-specific agents on one surface. Each one shares the same context — what you're building, who it's for, what stage you're at — so their advice stays consistent instead of contradictory.

Drop your idea in once. Ask each agent what they'd do next. Drag them around your workspace like you would sticky notes.

## The team

| Agent | Focus |
| --- | --- |
| **Researcher** | Market sizing, competitor teardowns, customer discovery questions |
| **Product Manager** | 1-page PRD, MVP scoping, 30-day roadmap |
| **CMO** | Positioning, one-liner, landing copy, launch plan |
| **Lead Gen** | ICP definition, prospect list format, cold outreach sequences |
| **Brand / Designer** | Naming, logo direction, brand voice, visual direction |

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

You can either bring your own model API key (Anthropic or OpenAI) via the in-app Connector, or start in mock mode to explore the UI without any credentials.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript 5**
- **Tailwind CSS 3** + **shadcn/ui** on top of **Base UI**
- **Geist** typeface family
- **[stitch-skills](https://github.com/google-labs-code/stitch-skills)** — Google Labs Agent Skills for the design workflow, backed by [Stitch](https://stitch.withgoogle.com)

## Status

Early alpha — built in public, commit by commit. See `git log` for the progression.
