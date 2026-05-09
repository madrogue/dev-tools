# Dev Tools — Roadmap & TODO

---

## Completed (Phases 1–13)

All feature work complete: 2-tab layout, Monaco two-pane tools, JSON/YAML/CSV/Base64/JWT/Regex/JSONPath/Markdown tools, Utils sub-tabs (Time / Generate / Convert / Web), format badges, auto-detect paste, cron parser, color/URL/base converters.

---

## UI/UX Overhaul — Review & Plan

### What's Working
- Dark theme is the right call for a dev tool — keep it
- Format badges (JSON/JSON5/TEXT pills) are the most polished element — keep the approach
- Two-pane Monaco layout is solid and intuitive
- Chevron icons on directional buttons (→ / ←) are a good affordance
- Sub-tab organization of Utils is clean in concept

---

### Issues Found

#### Typography
- **Fira Code is used everywhere** — monospace is right for editors, but using it for buttons, labels, section titles, and navigation makes the UI feel heavy and monotone. There's no typographic hierarchy — everything is the same weight, the same rhythm.
- **ALL CAPS buttons** — `text-transform: uppercase` on a monospace font produces blocky, condensed text. Combined with `letter-spacing`, it reads as shouting.
- **Section titles are whispers** — `.utils-section-title` at `0.8rem` gray uppercase is nearly invisible. They can't guide the eye.

#### Color & Contrast
- **Convert button is near-black** — `#1e3a8a` on `#121212` background is a very dark blue that barely reads as blue. The primary action button should command attention.
- **Validation feedback breaks immersion** — Success `#e0ffe0` and error `#ffe0e0` are jarring light backgrounds flashed onto an otherwise fully dark UI. They look like a browser default alert pasted in.
- **Border noise** — `#333` borders appear on inputs, tables, containers, buttons, and tab content all at the same color and weight. Nothing has hierarchy. Everything has the same edge.
- **Tab buttons are barely distinguishable** — Active `#444` vs inactive `#333` is a contrast ratio of ~1.05:1. Nearly invisible state change.
- **No color accent personality** — The only accent is the near-black blue button. Everything else is grays. The app has no character.

#### Spacing & Layout
- **No spacing system** — `5px`, `8px`, `10px`, `14px` gaps coexist without a grid. The result is inconsistent density that feels unplanned.
- **Buttons stretch to fill everything** — Global `flex: 1` on `button` means a lone "Paste" button spans the full pane width. Single action buttons should be natural-width or capped.
- **The `h1` title bar** — Adds 40px+ of height for a static "Dev Tools" label that a single-user tool doesn't need. Every pixel of vertical space is valuable in a code editor layout.
- **Tab row floats in the middle** — `justify-content: center` with only 2 buttons leaves them stranded in the center of a wide viewport. No visual anchor.
- **Utils form inputs get extremely wide on large screens** — No max-width on form panels. Color/base converter inputs on a 4K monitor span 1800px.

#### Interaction & Feedback
- **No transitions** — Every state change (hover, tab switch, active) is instant. Even 120ms easing transforms "cheap" into "polished."
- **No visual affordance on click-to-copy cells** — The cursor changes to pointer, but there's no copy icon, no tooltip, no feedback. Most users won't discover this.
- **Regex/JSONPath extra controls appear with no animation** — The control row pops in/out instantly.

---

### Overhaul Plan

#### UI-1 — Typography System
- Add `Inter` (or `system-ui` fallback) for all UI chrome: buttons, labels, nav, section titles, form fields
- Keep Fira Code only in Monaco editors and `<code>`/`<pre>` blocks
- Type scale: `0.7rem` metadata/badges → `0.8rem` secondary labels → `0.875rem` buttons/nav → `1rem` body → `1.1rem` section headers
- Remove `text-transform: uppercase` from action buttons; keep only for section titles and nav labels (with increased letter-spacing)

#### UI-2 — Color System Rebuild
- Body: `#0f0f0f` → Surface: `#171717` → Elevated: `#1f1f1f` → Input: `#262626` → Border: `#2e2e2e` muted / `#3d3d3d` interactive
- Text: `#e8e8e8` primary → `#a0a0a0` secondary → `#606060` muted
- Primary accent: `#3b82f6` (vivid blue) — readable, modern, not harsh
- Accent hover: `#2563eb`; Accent muted (action buttons): `#1d2d3e` bg with `#3b82f6` text
- Validation: dark-compatible — success `#166534` bg / `#4ade80` text; error `#7f1d1d` bg / `#f87171` text
- Remove uniform `#333` border; use 2-level border system: `#2a2a2a` structural, `#3d3d3d` interactive focus

#### UI-3 — Button Redesign
- Remove global `flex: 1` on `button`; buttons size to content with `min-width`
- Primary (Apply/Convert/Parse): `#3b82f6` bg, white text, `border-radius: 6px`, `padding: 8px 16px`
- Secondary (Paste/Copy/Refresh): `#262626` bg, `#a0a0a0` text, `#3d3d3d` border — clearly subordinate
- Destructive: not needed; skip
- Add `transition: background 120ms ease, box-shadow 120ms ease` to all buttons
- Primary hover: subtle `box-shadow: 0 0 0 2px rgba(59,130,246,0.3)` glow

#### UI-4 — App Shell Slim-Down
- Replace `h1` with a slim `16px`-tall top bar containing a small wordmark/logo on the left, nothing else — or remove entirely and let tabs serve as the header
- Move main tab buttons to the left edge as a slim vertical nav (or a full-width top bar) — not floating in the center
- Main tab active state: accent-colored left border `3px solid #3b82f6` + lighter background, not just a shade of gray

#### UI-5 — Spacing Grid
- Adopt 8px base unit throughout: `4px` tight, `8px` default gap, `16px` section padding, `24px` between sections, `32px` major separations
- Replace ad-hoc `5px`/`10px`/`14px` values
- Constrain Utils form panels to `max-width: 900px` so inputs don't become unusable on wide screens

#### UI-6 — Transitions & Micro-interactions
- `transition: 120ms ease` on all hover states (buttons, tabs, rows)
- Tab/panel switch: `opacity` fade `0→1` over `150ms`
- Regex/JSONPath control row: `max-height` + `overflow: hidden` transition instead of instant display toggle
- Click-to-copy cells: flash a brief `#3b82f6` background tint for `300ms` on click as confirmation

#### UI-7 — Inputs & Forms
- Unified input style: `background: #1a1a1a`, `border: 1px solid #2e2e2e`, `border-radius: 6px`, `padding: 8px 12px`, `color: #e8e8e8`
- Focus state: `border-color: #3b82f6`, `box-shadow: 0 0 0 2px rgba(59,130,246,0.15)`, no browser default outline
- Select elements: same style as inputs, custom caret via `appearance: none` + SVG background
- Textarea: same system; remove separate `#2e2e2e` background inconsistency

#### UI-8 — Tab & Sub-tab Polish
- Main tabs: full-width row or left-anchored; `font: 0.875rem Inter`; active = accent left border + brighter bg
- Utils sub-tabs: increase contrast between active/inactive; active tab underline with accent color is cleaner than the background-match border trick
- Persist active states visually in a way that's obvious at a glance without having to compare shades

#### UI-9 — Section Titles & Dividers
- Section titles: `0.875rem`, `font-weight: 600`, `color: #a0a0a0`, no uppercase, small accent dot or icon with consistent spacing
- Dividers: increase `margin` to `24px 0`, lighten to `#222` so they recede rather than assert
- Add `padding: 0 0 8px` below titles to separate title from first control

#### UI-10 — Fun / Personality
- Accent the format badges further — slight glow (`box-shadow`) on JSON blue badge
- Consider a subtle grid or dot-pattern background on the main body (very faint, `#1a1a1a`)
- The Apply/Convert buttons could have a very subtle animated shimmer on hover (CSS `background-position` shift on a gradient)
- Icon-only button option for Paste/Copy with tooltips to save horizontal space
