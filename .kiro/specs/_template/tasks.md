# Tasks — `<feature name>`

Ordered so that **something demoable exists after every task**. No task
leaves the app in a non-renderable state.

- [ ] 1. Define types in `lib/firecrawl/types.ts`
- [ ] 2. Add target to `lib/firecrawl/targets.ts`, run `npm run scrape`,
         commit the resulting `data/cache/*.json`
- [ ] 3. Implement derivation in `lib/firecrawl/pipeline.ts` + a cache-only
         smoke check
- [ ] 4. Static render of the panel against cached data (no motion yet)
- [ ] 5. Wire motion and the hero interaction
- [ ] 6. Reduced-motion and WebGL-loss fallbacks
- [ ] 7. Add to the demo script, rehearse the 30 seconds that show it off

## Time budget

| Task | Estimate | Actual |
|---|---|---|
| 1-3 (data) | | |
| 4-5 (UI) | | |
| 6-7 (polish) | | |

Fill `Actual` as you go. If a task runs 2x its estimate, cut it and move on —
the runbook in `docs/DAY-OF-RUNBOOK.md` has the abort thresholds.
