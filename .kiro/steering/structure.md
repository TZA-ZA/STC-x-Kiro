# Structure Steering

```
.kiro/
  steering/      product | tech | design | structure  (always-on context)
  specs/         one folder per feature: requirements -> design -> tasks
  hooks/         event-driven automation (typecheck on save, spec sync)
app/
  layout.tsx     fonts, metadata, <body> shell
  page.tsx       landing: hero -> narrative scroll -> CTA
  dashboard/     the working application surface
  api/           server routes (Netlify only; excluded from static export)
components/
  hero/          above-the-fold composition
  motion/        Reveal, KineticText, Stagger — motion primitives
  primitives/    ProgressiveBlur, ScrollArea, UndoButton, BackToTopRing
  three/         ThreeDCarousel and its shaders
  dashboard/     Shell, Panel, MetricCard, SourceTether
lib/
  design/        tokens.ts — the TS mirror of the CSS theme
  firecrawl/     client | targets | pipeline | types
data/cache/      committed JSON snapshots. The demo safety net.
scripts/         scrape.ts — run manually, writes data/cache
docs/            ARCHITECTURE | PITCH | DAY-OF-RUNBOOK
```

## Naming

- Components `PascalCase.tsx`, one component per file, named export.
- Hooks `use-thing.ts`. Utilities `kebab-case.ts`.
- Types: `T` prefix never used. `interface Dataset`, not `IDataset`.
- Data files: `data/cache/<target-id>.json`, matching `targets.ts` keys.

## Where new code goes on the day

| If you are adding... | Put it in |
|---|---|
| A new scrape source | `lib/firecrawl/targets.ts` only |
| A new derived metric | `lib/firecrawl/pipeline.ts` |
| A new visual panel | `components/dashboard/` + mount in `app/dashboard/page.tsx` |
| Topic copy | `lib/content.ts` — single file, no strings in components |

That last rule is the important one: **all topic-specific copy lives in one
file**, so the whole app re-themes to the 08:00 topic by editing one module.
