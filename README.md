<div align="center">

# DRIFT

**Evidence-tethered web consensus**

Extracts claims from live sources, pins every claim to the exact sentence
it came from, and shows how consensus has moved over time.

Built for **STC × Kiro**, 15 November 2026

</div>

---

## The idea in one paragraph

Ask any AI assistant what the web thinks about something and you get a
confident paragraph with no way to check it. The citations, where they
exist, point at whole pages rather than the sentence that actually carried
the claim. Drift inverts the usual order of operations: it finds the
**verbatim span first** and derives the claim from it, so every assertion
carries the character offsets it came from. Then it captures repeatedly,
so you can see not just what the web says but what it is *doing* — where
agreement is firming up and where it is coming apart.

## Quick start

```bash
npm ci
npm run seed     # build the cache from the offline corpus — no API key needed
npm run dev
```

Open <http://localhost:3000>. That is the whole setup: **the app runs with
no API key and no network**, because the extracted corpus is committed to
the repo.

To refresh from live sources:

```bash
echo 'FIRECRAWL_API_KEY=fc-…' > .env.local
npm run scrape                  # appends a new capture
npm run scrape -- --discover    # also pulls in search-discovered URLs
```

Each `scrape` **appends** a capture rather than replacing it, because the
drift view needs more than one point to say anything.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run seed` | Build cache from `data/raw/` — offline, no key |
| `npm run scrape` | Live scrape via Firecrawl, appends a capture |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build (Netlify target) |
| `npm run build:pages` | Static export (GitHub Pages target) |

## Architecture

```
targets.ts ──▶ Firecrawl ──▶ extract.ts ──▶ data/cache/*.json
   (what to ask)   (retrieval)   (spans → claims)    (committed)
                                                          │
                                       pipeline.ts ◀──────┘
                                     (one entry point,
                                      two data modes)
                                            │
                              ┌─────────────┴─────────────┐
                              ▼                           ▼
                        app/page.tsx              app/dashboard/page.tsx
                        (landing)                 (the instrument)
```

Three decisions worth knowing about:

**Evidence before claims.** `extract.ts` scores and selects source
sentences, then builds claims from them. A `Claim` carries non-empty
`fragmentIds` by construction, and `validateDataset` rejects any dataset
where a claim cites a fragment that does not exist. A claim without
evidence is not filtered out — it cannot be represented.

**One data entry point, two modes.** Components call `loadDataset()` and
never learn whether the bytes came from the network or from disk. Cache is
the default; `NEXT_PUBLIC_LIVE_MODE=1` attempts a live scrape and falls
back silently on any failure. The demo cannot be killed by bad wifi.

**Topic-specific content lives in two files.** `lib/firecrawl/targets.ts`
(what to interrogate) and `lib/content.ts` (every user-facing string). No
component contains a hardcoded string, which is why the whole app can be
re-themed to a new topic in under an hour.

## Built spec-driven

The repo is Kiro-native from the first commit.

```
.kiro/
├── steering/     always-on context: product rules, stack, design system,
│                 file layout. Keeps the agent from drifting over a long day.
├── specs/        requirements → design → tasks, per feature
└── hooks/        typecheck-on-save · design-system guard · cache freshness
```

The **design-system guard** hook is the one that earns its keep: it checks
every edited component against `steering/design.md` and flags hardcoded
hex colours, drop shadows, off-grid spacing, a second border weight, or
more than one accent element competing in a viewport. Under time pressure
that is exactly the drift that makes a UI look generic.

## Design notes

Near-monochrome, single accent, 4px grid, 1px hairlines, no drop shadows.
Depth comes from surface value steps and a layered progressive-blur
component rather than from shadow boxes. One entry animation throughout:
8px of offset, zero opacity, expo-out.

Two choices that went against the obvious option:

- **The claim ring is CSS 3D, not WebGL.** Text rendered into a GL texture
  loses crispness, selection and copy, and drops out of the accessibility
  tree. A `preserve-3d` ring keeps every card as real focusable DOM while
  giving the same spatial read.
- **Chart marks use a separate palette from the UI accents.** The UI
  accents sit at OKLCH L 0.75–0.90, which is right for text on near-black
  but far above the 0.48–0.67 band dark-mode chart marks need. The chart
  palette was validated, not eyeballed: all five checks pass, and the
  diverging axis is teal-to-orange rather than green-to-orange, which
  collapses to ΔE 3.2 under deuteranopia.

Reduced motion is honoured throughout — GSAP scrubs snap to end state,
offsets become opacity-only, and the 3D ring flattens to a scrollable row.

## Deployment

Both targets build from git on push; neither needs a manual deploy step.

| Target | Trigger | Data mode |
|---|---|---|
| Netlify | push to `main`, via its GitHub integration | cache (live-capable) |
| GitHub Pages | push to `main`, via `.github/workflows/pages.yml` | cache only |

Two live URLs is deliberate redundancy: a bad deploy or an outage twenty
minutes before judging is then an inconvenience rather than the end of the
presentation.

## Docs

- [`docs/PITCH.md`](docs/PITCH.md) — the 5–6 minute script and the
  questions to rehearse
- [`docs/DAY-OF-RUNBOOK.md`](docs/DAY-OF-RUNBOOK.md) — hour-by-hour plan
  with abort thresholds
- [`.kiro/steering/`](.kiro/steering/) — the rules the build follows

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Motion · GSAP · three.js / react-three-fiber · Firecrawl · self-hosted Geist
