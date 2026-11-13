/**
 * ───────────────────────────────────────────────────────────────────────
 *  ALL TOPIC-SPECIFIC COPY. THE SECOND FILE TO EDIT AT 08:00.
 * ───────────────────────────────────────────────────────────────────────
 *
 * No component in this app contains a user-facing string. Everything the
 * audience reads comes from here, so the entire product re-themes to the
 * revealed topic by editing this file and `lib/firecrawl/targets.ts` —
 * two files, no component churn, no find-and-replace through JSX.
 *
 * Current values are the pre-topic placeholder product, kept deliberately
 * plausible so the build can be rehearsed end-to-end before the reveal.
 */

export const product = {
  name: "Drift",
  /** Shown in the nav and as the mono wordmark. Keep under 10 chars. */
  mark: "DRIFT",
  tagline: "Evidence-tethered web consensus",

  /** The hero line. Set in display type, word-masked on load.
   *  Two short clauses beat one long one — it has to be readable in the
   *  1.5 seconds a judge spends before deciding to pay attention. */
  heroLine: "The web changed its mind. Here is the receipt.",

  /** One sentence under the hero. States the mechanism, not the benefit. */
  heroSub:
    "Drift reads live sources, pins every claim to the exact sentence it came from, and plays back how the consensus moved.",

  /** The question currently being interrogated. Mirrors targets.ts. */
  question:
    "Does spec-driven AI development produce more maintainable software than chat-driven prompting?",

  cta: { primary: "Open the instrument", secondary: "How it works" },
} as const;

/**
 * The three-beat narrative on the landing scroll.
 *
 * Structure is fixed: problem, mechanism, proof. Judges have seen a
 * hundred "here are our features" sections; a short argument lands harder.
 */
export const narrative = [
  {
    kicker: "The problem",
    title: "AI summaries launder their sources",
    body:
      "Ask any assistant what the web thinks and you get a confident paragraph with no way to check it. The citations, when they exist, point at whole pages rather than the sentence that actually carried the claim. You cannot audit a vibe.",
  },
  {
    kicker: "The mechanism",
    title: "Evidence first, claim second",
    body:
      "Drift inverts the usual order. It finds the verbatim span before it forms the claim, so every assertion carries the character offsets it came from. A claim with no evidence is not filtered out later — it cannot be constructed in the first place.",
  },
  {
    kicker: "The proof",
    title: "Consensus is a time series, not a fact",
    body:
      "One scrape tells you what the web says today. Repeated captures tell you what it is doing — where agreement is firming up, where it is coming apart, and which source moved first. That second thing is the one nobody is showing you.",
  },
] as const;

/** Metric tile labels. Values are always computed, never written here. */
export const metrics = {
  consensus: {
    label: "Consensus",
    hint: "Confidence-weighted. −1 opposed, +1 supportive.",
  },
  claims: { label: "Claims extracted", hint: "Each tethered to a source span." },
  sources: { label: "Live sources", hint: "Retrieved via Firecrawl." },
  drift: { label: "Drift", hint: "Change since the earliest capture." },
} as const;

export const ui = {
  liveBadge: "LIVE",
  cacheBadge: "CACHED",
  evidencePanelTitle: "Evidence",
  evidenceEmpty: "Select a claim to see the passage it came from.",
  noData:
    "No capture yet. Run `npm run seed` for the offline corpus, or `npm run scrape` with a Firecrawl key.",
  tetherHint: "Every claim below links to a verbatim span. Click to inspect.",
} as const;
