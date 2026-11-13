# Design Steering

## The brief in one line

Minimalist but advanced: a near-monochrome surface where **motion and data
carry all the expression**, and colour is used as a signal rather than
decoration.

## Palette (single accent, enforced)

| Token | Value | Use |
|---|---|---|
| `--c-void` | `#08090B` | Page background |
| `--c-surface` | `#0E1013` | Panels, cards |
| `--c-raise` | `#14171B` | Hover, nested surfaces |
| `--c-line` | `rgba(255,255,255,0.07)` | Hairline borders — 1px, never 2 |
| `--c-ink` | `#F4F4F1` | Primary text (warm, not pure white) |
| `--c-muted` | `#878D97` | Secondary text, axis labels |
| `--c-faint` | `#4A505A` | Tertiary, disabled |
| `--c-signal` | `#C3F53C` | THE accent. Live state, key metric, focus |
| `--c-cool` | `#5BE4D1` | Second data series only — never UI chrome |
| `--c-warn` | `#FF8A4C` | Drift, staleness, divergence |

**Rule:** at most one `--c-signal` element competing for attention per
viewport. If two things glow, nothing does.

## Typography

- Single family: **Geist Sans**, with **Geist Mono** for all numerals,
  source URLs, timestamps and IDs. Mono on data is the whole "advanced" cue.
- Scale (clamped, fluid): display `clamp(2.75rem, 7vw, 6.5rem)`,
  h1 `2.25rem`, h2 `1.5rem`, body `0.9375rem`, meta `0.75rem`.
- Display type: `letter-spacing: -0.04em`, `line-height: 0.95`. Tight.
- Meta/label type: `0.6875rem`, `letter-spacing: 0.14em`, uppercase.
- Never centre a paragraph longer than two lines.

## Space and form

- 4px base grid. Spacing only from {4, 8, 12, 16, 24, 32, 48, 64, 96, 128}.
- Radii: `10px` cards, `8px` controls, `999px` pills. Nothing in between.
- **No drop shadows.** Depth comes from surface value steps and the
  progressive-blur layer, not from blur-y boxes.
- Borders are `1px` hairlines at 7% white. A second visible border weight
  anywhere in the app is a bug.

## Motion doctrine

- Durations: `120ms` micro (hover, press), `280ms` element entry,
  `640ms` section choreography. Nothing between 300 and 600ms.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entries (expo-out),
  `cubic-bezier(0.7, 0, 0.84, 0)` for exits. Springs only for drag and 3D.
- Everything that enters does so from **8px of offset and 0 opacity**. Never
  scale text on entry; scale reads cheap.
- Progressive blur masks every section boundary and modal edge, so content
  dissolves rather than clipping. This is the single most "native iOS" cue
  in the build.
- `prefers-reduced-motion`: transforms become opacity-only, GSAP scrubs snap
  to end state, 3D carousel becomes a static ring.

## What to avoid

Gradient text, glassmorphism panels, purple-to-blue gradients, emoji in UI,
pill badges on every card, generic shadcn card stacks, more than two font
weights in one view. All of these read as "default AI output" and will be
recognised as such by judges who have seen forty submissions.
