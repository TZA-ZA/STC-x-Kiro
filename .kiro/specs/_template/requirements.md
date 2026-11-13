# Requirements — `<feature name>`

## Problem

One paragraph. What is broken or missing in the world, stated without
mentioning our solution. If this paragraph needs the product's name to make
sense, it is not a problem statement yet.

## Who has this problem

Primary user, and the moment in their day when the pain lands.

## User stories

- **US-1** — As a `<role>`, I want `<capability>` so that `<outcome>`.
  - AC-1.1 Given `<state>`, when `<action>`, then `<observable result>`.
  - AC-1.2 Given no network, when `<action>`, then cached data renders and a
    `STALE` indicator appears. *(every feature inherits this one)*
- **US-2** — ...

## Out of scope for this feature

Explicit list. This is what protects the 6-hour build.

## Definition of done

- [ ] Acceptance criteria above all demonstrable in the browser
- [ ] `npm run typecheck` clean
- [ ] Works with `NEXT_PUBLIC_LIVE_MODE=0` (cache) and `=1` (live)
- [ ] Respects `prefers-reduced-motion`
- [ ] Appears in the demo script in `docs/PITCH.md`
