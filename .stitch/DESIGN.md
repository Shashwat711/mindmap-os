# mindmap-os — Design System

The source of truth for Stitch-generated screens and hand-authored components.

## Product tone

Not another purple-gradient AI app. Feels like a well-designed tool a small studio would ship. Warm neutrals, sharp typography, a single earthy accent — not a rainbow of pastels.

**Reference brands (aim):** Linear, Retool, Framer, Notion (early), Basecamp, Craft.

**Anti-references (avoid):** generic OpenAI-app clones, purple-to-pink gradients, glassmorphism, oversized emoji, "your AI assistant" hero art.

## Color

The palette is intentionally small. One neutral background family, one dark ink for text, five reserved agent colors, and a single warm accent used sparingly.

### Neutrals

| Token | Hex | Where used |
|---|---|---|
| `--paper` | `#efe9dd` | Preferred app background (cream, subtly warm) |
| `--paper-soft` | `#f5f0e6` | Card backgrounds when on a darker paper canvas |
| `--ink` | `#1c1917` | Primary text, borders, buttons |
| `--ink-soft` | `#57534e` | Secondary text |
| `--ink-mute` | `#a8a29e` | Tertiary text, muted labels |
| `--rule` | `#e7e0d0` | Hairline borders on paper |

### Accent

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#c2410c` | Primary accent — center dot of the app icon, primary CTAs on dark surfaces, focus rings. Use sparingly. |

### Agent colors

Each agent has a fixed color for their card left-bar, chat panel header, and any avatar chip. These are the *only* places these colors appear — never used for generic UI chrome.

| Agent | Primary | Accent |
|---|---|---|
| Researcher | `#0f766e` (deep teal) | `#14b8a6` |
| Product Manager | `#c2410c` (burnt orange) | `#f97316` |
| CMO | `#be185d` (rose) | `#ec4899` |
| Lead Gen | `#365314` (forest) | `#84cc16` |
| Brand | `#6b21a8` (royal purple) | `#a855f7` |

### Dark mode

Same palette inverted: `--ink` becomes background, `--paper` becomes text. Agent colors keep the same primary; accent brightens slightly for legibility.

## Typography

| Role | Font | Weight | Size / Line |
|---|---|---|---|
| Display | Geist Sans | 600 | 32–48 / 1.05 |
| H1 (in-app title) | Geist Sans | 600 | 18 / 1.2 |
| Body | Geist Sans | 400 | 14 / 1.55 |
| Small | Geist Sans | 400 | 12 / 1.4 |
| Mono | Geist Mono | 400 | 12 / 1.4 (API keys, code snippets only) |

Numeric font-feature `tnum` on: numbers in tables, timestamps, counters. Never on prose.

## Spacing & rhythm

- Base unit: **4px**. All paddings/margins snap to multiples of 4.
- Card interior padding: `16px` (`p-4`).
- Section spacing: `24px` between major card regions.
- Modals: `24px` interior, `16px` between form fields.
- Header row: `40px` tall, `12px` horizontal padding.

## Radius

| Element | Radius |
|---|---|
| Buttons, inputs, chips | `8px` |
| Cards, popovers | `16px` |
| Modals | `20px` |
| Chat message bubbles | `12px` |
| App icon container | `7/32 of size` (rounded, not pill) |

Avoid `rounded-full` on anything that isn't an avatar or dot.

## Shadow

Two elevations, no more.

| Level | Shadow |
|---|---|
| Rest (cards on canvas) | `0 1px 2px rgba(28, 25, 23, 0.04), 0 1px 3px rgba(28, 25, 23, 0.06)` |
| Raised (chat panel, modal) | `0 4px 12px rgba(28, 25, 23, 0.08), 0 10px 30px rgba(28, 25, 23, 0.10)` |

No colored shadows. No blur-heavy glassmorphism.

## Components

### Agent card
- Width: `280px`. Height: auto (~160px typical).
- Background: `--paper-soft` on canvas.
- Left border: `4px` solid in agent's primary color.
- Icon chip: `36×36`, `8px` radius, background `agent.primary` at 12% opacity, glyph in `agent.primary` at 100%.
- Name: 15px / 600. Title: 12px / 400 in `--ink-soft`. Description: 13px / 400 in `--ink` at 80%.
- Hover: lift shadow to Raised.
- Grabbed: `cursor: grabbing`, no visual change beyond cursor.

### Chat panel
- Right-anchored drawer, `420px` wide, full viewport height.
- Slides in from right, `180ms ease-out`.
- Header: same layout as agent card header, always visible.
- Messages: user right-aligned with `--ink` background + `--paper` text; assistant left-aligned with `--paper-soft` background + `--ink` text.
- Input at bottom: single textarea, `Enter` sends, `Shift+Enter` inserts newline. Send button aligned to the right of the meta hint.

### Onboarding & Connector dialogs
- Centered modal, `max-width: 512px`.
- Backdrop: `--ink` at 40% opacity + `backdrop-blur(4px)`.
- Radio-as-card pattern for enum choices (used for `stage` and `provider`). Selected: border `--ink`, background `--ink` at 5%.

### Canvas
- Background: `--paper`.
- Grid: radial dots (`--rule`), `24px` cell size, scales with zoom.
- Pan cursor: `grab` (empty area), `grabbing` (while panning).
- Zoom: 0.3× to 3×, wheel-anchored to cursor.

### Header (app chrome)
- Height `40px`, bottom-border `1px` `--rule`.
- Left: `mindmap-os` wordmark (14px / 600) + tagline (12px / 400 `--ink-soft`).
- Right: connector status pill (dot + label) + "Edit context" button. Both `12px`.

## Voice & copy

- Second person, active voice. "Ask the Researcher" not "The Researcher can be asked."
- Short. If a sentence has three commas, cut it.
- No "AI-powered," "revolutionary," "seamless." No exclamation marks.
- Empty states should tell the user the *next specific action*, not describe the empty state.

Examples the app *would* say:
- "Ask Researcher about market intelligence."
- "Enter to send. Shift+Enter for newline."
- "Bring your own key. Stored locally."

Examples the app *would not* say:
- "Welcome to your AI-powered workspace! ✨"
- "Loading amazing results..."
- "Oops! Something went wrong."

## Motion

- Default: `180ms ease-out`.
- Modals: `220ms ease-out`.
- Micro (button hover, chip): `120ms ease-out`.
- No bounce, no spring, no confetti.

## What Stitch should preserve

When generating new screens:
1. Cream `--paper` background, not white.
2. Left-bar-on-card pattern for anything role-typed.
3. Radio-as-card for enum selection.
4. Small header, no big hero on interior surfaces.
5. Agent colors never repurposed as generic UI colors.
