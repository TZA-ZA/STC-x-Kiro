# Pitch script

**Format:** 5–6 minutes spoken, plus demo. Timings are spoken-word
estimates at a calm pace — roughly 130 words per minute. Do not speed up
to fit more in; cut words instead.

Fill every `<<…>>` after the topic lands at 08:00.

> **Note:** this structure follows the standard problem → mechanism →
> proof → ask arc. It is not matched to your own investor pitch script —
> paste that in and the phrasing can be rewritten to your voice and
> cadence.

---

## 0:00–0:40 — The cold open

Do not start with your name, the team, or the agenda. Start with the
problem as a thing the room already recognises.

> "<<One sentence describing the frustrating status quo, in concrete
> terms. Not 'information overload' — something specific enough that
> someone in the room has had it happen to them this week.>>
>
> We built <<name>>. It <<does the one thing>>. Let me show you."

**Why this shape:** judges have sat through twenty introductions. Opening
on the problem buys you attention before you have earned it.

---

## 0:40–2:10 — Demo part one: it is real

Screen up. Do not narrate the UI; narrate what it is *doing*.

1. Land on the dashboard. Point at the **source count and the capture
   timestamp**. Say: "These are live pages, retrieved <<when>>. Nothing
   here is seeded."
2. Click a claim. The evidence panel fills. Say: "Every claim is pinned
   to the sentence it came from — and to the character offsets inside the
   source document. You can go and check it."
3. Click the source link. Let the real page open. **Let it be silent for
   two seconds.** That silence is the most persuasive moment in the pitch;
   do not fill it.

**The line to land:** "Most tools cite a page. We cite a span."

---

## 2:10–3:20 — The mechanism: why this is hard

This is where technical judges decide whether to take you seriously.

> "The obvious way to build this is to ask a model for claims and then
> look for sources that support them. That produces confident-sounding
> output and unverifiable citations.
>
> We inverted it. The extractor finds the verbatim span **first** and
> derives the claim from it. A claim that has no evidence isn't filtered
> out later — it can't be constructed. That invariant is enforced in the
> type boundary, not in a code review."

Then the second technical point:

> "Everything you're seeing works with the network off. The pipeline has
> one entry point with two modes behind it, and the cached corpus is
> committed to the repo. That was a deliberate decision — <<if demoing on
> venue wifi: and it's the reason this is working right now>>."

---

## 3:20–4:30 — Demo part two: the thing nobody else has

The drift chart and <<your 09:15 feature>>.

> "A single scrape tells you what the web says today. We capture
> repeatedly, so we can show you what it's *doing* — where agreement is
> firming up, and where it's coming apart."

Scrub, filter, or open your differentiating feature here. One interaction,
done slowly and clearly. Not three done fast.

> "<<The specific, surprising thing your data actually shows. Find this
> during the build — a real finding from real sources is worth more than
> any amount of describing the feature.>>"

---

## 4:30–5:15 — How it was built

At a Kiro event, process is part of the score. Open `.kiro/` on screen.

> "This was built spec-driven. Steering files hold the product rules, the
> stack decisions and the design system, so the agent didn't drift over
> eight hours. Three hooks ran the whole day: typecheck on every save, a
> design-system guard that rejects hardcoded colours and off-grid
> spacing, and a cache-freshness check that catches the classic failure
> where the pipeline expects fields the cached data doesn't have.
>
> The reason we could re-theme the entire app to today's topic in under
> an hour is that all the topic-specific content lives in two files."

**Have `.kiro/steering/design.md` and `targets.ts` open in tabs.** Showing
is faster than claiming.

---

## 5:15–6:00 — Close

> "What's here today: <<honest scope>>. What's next: <<one concrete
> thing, not three vague ones>>.
>
> The broader point: <<why evidence-tethering / drift matters beyond this
> demo — one sentence, no grand claims>>.
>
> Both URLs are live, the repo is public, and the cached corpus means you
> can clone it and get identical output. Happy to take questions."

---

## Questions you will be asked

Rehearse these answers. Being caught flat-footed undoes a good demo.

**"Is this actually live or is it cached?"**
Both, and the UI tells you which — point at the LIVE/CACHED badge. Then:
"Cached is the default on purpose. I'd rather show you real data from
twenty minutes ago than risk a dead demo on conference wifi." Then offer
to flip live mode. Offering is as convincing as doing.

**"How do you know the extraction is accurate?"**
"We don't paraphrase — the claim text *is* the source sentence, so there's
no drift between claim and evidence. The classification of stance is
lexical and I'd put it at roughly <<honest %>> — which is why the
confidence number is on every card and why the span is always one click
away. The user audits, we don't ask them to trust us."

**"Why not just use an LLM for extraction?"**
"For a one-day build: reproducibility. The committed cache has to match
the code that reads it, and a deterministic extractor gives us that, plus
it runs offline and costs nothing. The swap point is two functions in
`extract.ts` — the evidence-first invariant holds either way."

**"What's genuinely new here?"**
Do not say "AI-powered". Say: "Two things. Citing spans with offsets
rather than pages, and treating consensus as a time series rather than a
fact. The second one needs repeated capture, which is why you don't see
it elsewhere."

**"What would you do with more time?"**
Have one specific answer ready. "<<X>>" — not "scale it" or "add more
features".

---

## Delivery notes

- **Say numbers out loud as numbers.** "Fourteen claims across six
  sources" is more credible than pointing at the screen.
- **Do not apologise for scope.** "This is just a prototype" costs you
  points. Say what it does and let its limits be limits.
- **When something breaks, keep talking.** Say what should have happened,
  then move to the next thing. Judges forgive a bug; they do not forgive
  thirty seconds of silent clicking.
- **End on the sentence you planned.** Trailing off into "yeah, so…
  that's it" throws away the ending.
