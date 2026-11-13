# Technical Steering

## Stack (fixed — do not re-litigate during the event)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Static export for Pages, server routes for Netlify |
| Language | TypeScript, `strict` | Catch errors at build, not on stage |
| Styling | Tailwind CSS v4 (`@theme`) | Tokens live in CSS, no config file churn |
| Motion | `motion` (Framer Motion v14) | Layout/presence animation, springs |
| Scroll choreography | GSAP + ScrollTrigger | Pinning and scrubbed timelines |
| 3D | `three` + `@react-three/fiber` + `drei` | The 3D carousel hero moment |
| Data extraction | Firecrawl (`@mendable/firecrawl-js`) | Unstructured web -> typed JSON |
| Icons | `lucide-react` | Consistent 1.5px stroke weight |

## Architecture rules

- **Server does data, client does motion.** Scraping and normalisation never
  run in a client component. Anything touching `three` or GSAP is `"use client"`.
- **Two data modes, one interface.** `lib/firecrawl/pipeline.ts` exposes a
  single `loadDataset()`. It reads from `data/cache/*.json` by default and
  hits the network only when `NEXT_PUBLIC_LIVE_MODE=1`. Components never know
  which mode they are in.
- **Typed boundary.** Everything crossing the scrape boundary is validated
  against the types in `lib/firecrawl/types.ts`. A malformed scrape degrades
  to cache; it never renders `undefined`.
- **No barrel files.** Import from the concrete path. Keeps Turbopack fast.
- **Static-export safe.** No `next/image` loaders requiring a server, no
  dynamic route params without `generateStaticParams`, no middleware.

## Performance budget

- Landing route: interactive in under 2s on venue wifi.
- 3D scene: capped at 60fps, `dpr={[1, 1.75]}`, lazy-mounted below the fold.
- Respect `prefers-reduced-motion` everywhere — GSAP timelines and motion
  variants both check it. A judge with motion sensitivity still sees the app.

## Commands

```bash
npm run dev          # local dev
npm run scrape       # refresh data/cache from live sources
npm run build        # production build (Netlify)
npm run build:pages  # static export for GitHub Pages
npm run typecheck    # tsc --noEmit, run before every commit
```
