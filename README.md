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

## Design workflow

The visual language is defined once in [`.stitch/DESIGN.md`](./.stitch/DESIGN.md) — palette, typography, spacing, component patterns, voice. That file is the source of truth. When a new screen is needed, it gets generated against `DESIGN.md` rather than freehand, so the app stays consistent as it grows.

Design generation and code sync go through **[stitch-skills](https://github.com/google-labs-code/stitch-skills)** — a bundle of Agent Skills from Google Labs that talk to [Stitch](https://stitch.withgoogle.com):

- `stitch::manage-design-system` — uploads `DESIGN.md` and applies it across screens.
- `stitch::generate-design` — generates or edits screens against the system.
- `stitch::react-components` — syncs finalized screens back into `frontend/` as React components.

The design system in `DESIGN.md` is also readable on its own — you don't need Stitch installed to understand the visual direction.

## Status

Early alpha — built in public, commit by commit. See `git log` for the progression.
