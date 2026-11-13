# Day-of runbook — 15 Nov 2026, 08:00–16:00

Eight hours including judging. The foundation in this repo is already
built, so the budget below assumes you are **filling in a topic, not
starting a project**. Times are wall-clock. Abort thresholds are not
suggestions — the single most common way a good hackathon project dies is
a team spending 90 minutes on a feature that was scheduled for 30.

---

## Before you leave the house

- [ ] Laptop charged, charger packed, phone hotspot tested
- [ ] `git pull` and `npm ci` already done, so you are not installing
      dependencies on venue wifi
- [ ] `npm run dev` confirmed working offline (turn wifi off and reload)
- [ ] `FIRECRAWL_API_KEY` in `.env.local` and verified with one
      `npm run scrape`
- [ ] Both demo URLs open on your phone
- [ ] Kiro installed and signed in

---

## 08:00–08:25 — Topic lands. Do not open the editor.

Twenty-five minutes of thinking beats four hours of building the wrong
thing. On paper or in a note:

1. Write the topic verbatim.
2. Write **three questions** the topic implies where *sources on the web
   would disagree with each other*. Disagreement is the fuel — this app
   has nothing to show on a question everyone answers the same way.
3. For each, name 4–6 real URLs you could scrape. If you cannot name
   them in two minutes, that question is out.
4. Pick the one with the sharpest disagreement and the easiest sources.

Then update the two files and nothing else:
- `lib/firecrawl/targets.ts` — the question, the URLs, the tags
- `lib/content.ts` — hero line, the three narrative beats

**Checkpoint 08:25:** topic chosen, two files edited. If you are still
deciding at 08:35, take the question with the best URLs and move.

---

## 08:25–09:15 — Get real data on screen

```bash
npm run scrape          # writes data/cache/<id>.json
npm run dev
```

Then iterate on the question wording until the claim count looks healthy.
The extractor scores sentences against the question, so **the question is
the tuning knob**, not the code.

- Fewer than ~8 claims → the question's vocabulary does not match the
  sources. Rewrite the question using words the sources actually use.
- All claims `neutral` → sources are descriptive, not argumentative. Swap
  in opinion pieces, reviews or comparisons.
- Claims look irrelevant → raise the threshold in `extract.ts`
  (`s.score >= 3`) to 4 or 5.

Run `npm run scrape` **three or four times across the day** — every run
appends a capture, and the drift chart is the hero moment. Two points is
a line; five is a story.

**Checkpoint 09:15:** dashboard renders real claims with real evidence.
If not, you have a data problem, not a UI problem — stay here.

---

## 09:15–12:00 — Build the one differentiating feature

Everything up to now was re-theming. This block is where you earn the
score. Write a spec first — `.kiro/specs/<feature>/` from the template.
That is ten minutes that saves an hour of drift, and at a Kiro event the
spec itself is evidence of process.

Pick **one**:

| Option | Why it lands |
|---|---|
| **Source-level drift** | Which source moved first, and who followed. Nobody shows attribution of a change. |
| **Disagreement map** | Cluster claims by tag × stance, show where the fight actually is. |
| **Contradiction pairs** | Surface two claims from different sources that directly conflict, side by side with both spans. |
| **Scrub the timeline** | Drag across captures and watch claim cards enter, leave and flip stance. |

**Abort threshold:** if the feature is not working by **11:15**, stop and
ship what you have. A polished three-surface app beats a broken four.

**12:00 — hard freeze on new features.** Anything not working now is cut.

---

## 12:00–13:00 — Lunch, away from the laptop

Non-negotiable. Every judging disaster in history was built in hour seven
by someone who had not eaten.

---

## 13:00–14:00 — Harden

In this order, because this is the order things fail on stage:

1. `npm run typecheck` and `npm run build` both clean
2. **Turn your wifi off and reload the app.** It must work. This is the
   single most valuable test of the day.
3. Click every interactive element once. Fix anything that throws.
4. Check it at 1280×720 — the projector will not be your laptop's
   resolution. Also check at 100% browser zoom, not your usual 90%.
5. Toggle `prefers-reduced-motion` on and reload.
6. Commit, push, and confirm **both** live URLs updated.
7. Screen-record a 90-second clip of the full demo. If the laptop dies,
   you present the video and still score.

---

## 14:00–15:00 — Pitch and rehearse

`docs/PITCH.md` has the script. Fill the blanks, then **say it out loud
three times with a timer**. Reading it silently does not count; you will
discover the awkward sentences only by speaking them.

- Run 1: find where you run long
- Run 2: cut 20%
- Run 3: without notes

---

## 15:00–16:00 — Judging

Laptop plugged in, both URLs in open tabs, phone as third backup,
notifications off, Do Not Disturb on, screen recording as the fourth
backup.

---

## If something breaks

| Symptom | Fix |
|---|---|
| Blank page after a change | Check the browser console first, not the code. 90% of the time it is a client/server boundary — a `"use client"` file importing `node:fs` through the pipeline. |
| `npm run scrape` fails | The app still works; it serves the committed cache. Do not debug this during judging hour. |
| Styles all gone on Pages | `basePath` mismatch, or `.nojekyll` missing. Use the Netlify URL and move on. |
| 3D ring invisible | Check the console for a WebGL error. The ring is CSS 3D, so this is almost certainly a `preserve-3d` being killed by an `overflow` on a parent. |
| Build fails on Netlify, works locally | Node version. `netlify.toml` pins 22; confirm it is being read. |
| Everything is on fire at 14:45 | `git log --oneline`, find the last commit that worked, `git checkout <sha>`, demo that. |

---

## The rule that matters most

**A smaller demo that works beats a larger one that stutters.** Judges
remember one moment clearly presented. They do not remember a feature
list, and they remember a crash for the rest of the afternoon.
