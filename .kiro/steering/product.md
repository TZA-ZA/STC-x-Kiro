# Product Steering

> Loaded by Kiro on every interaction. Keeps intent stable across sessions.

## What this project is

A hackathon-grade web application built for **STC x Kiro (15 Nov 2026)**.
Topic is revealed at 08:00 on the day. Everything in this repo that is not
topic-specific was built in advance so that build time on the day goes to
the idea, not the plumbing.

**TOPIC:** `<<FILL AT 08:00>>`
**ONE-LINE PITCH:** `<<FILL AT 08:00>>`

## Non-negotiable product rules

1. **One hero moment.** The app earns its score on a single interaction a
   judge will remember. Every other surface exists to set that moment up.
   If a feature does not serve the hero moment, it is cut, not deferred.
2. **The data must be real.** Content is extracted from live sources via
   Firecrawl, not seeded with lorem or hand-written fixtures. A judge asking
   "is this real data?" must get a yes that can be proven on screen.
3. **The demo cannot fail.** Every network-dependent path has a baked
   fallback committed to the repo. Venue wifi is assumed hostile.
4. **Minimalist, not sparse.** Restraint in colour and ornament; density and
   precision in motion, typography and data. Empty is not the same as clean.
5. **No invented numbers.** Any figure on screen traces to a scraped source
   or a computed value. Nothing is mocked up to look impressive.

## Audience

Hackathon judges evaluating in a 3-6 minute window, likely technical,
likely rewarding evidence of engineering process (hence specs/hooks below).

## Out of scope

Auth flows, billing, onboarding, settings pages, admin panels, multi-tenancy.
None of these win a one-day hackathon and all of them consume hours.
