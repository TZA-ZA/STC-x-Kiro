/**
 * ───────────────────────────────────────────────────────────────────────
 *  THE ONE FILE TO EDIT AT 08:00 ON HACKATHON DAY.
 * ───────────────────────────────────────────────────────────────────────
 *
 * A Target describes *what question we are interrogating the web about*.
 * Point it at new sources, run `npm run scrape`, and the entire
 * application re-themes around the new topic without another file change.
 *
 * Keep 4-8 sources. Fewer looks thin under questioning; more costs scrape
 * credits and build time without making the demo better.
 */

export interface Target {
  id: string;
  /** Short display name. Appears in the UI. */
  label: string;
  /** The question the sources are being read against. Drives extraction. */
  question: string;
  /** Pages to retrieve verbatim. */
  urls: string[];
  /** Optional discovery query — Firecrawl search, used when urls are thin. */
  searchQuery?: string;
  /** Tags the extractor is allowed to assign. Keeps the UI legend stable. */
  tags: string[];
}

/**
 * Placeholder target, live now so the pipeline, cache and UI can all be
 * built and verified before the topic exists. Replaced on the day.
 *
 * It is deliberately a real question with real sources rather than a
 * fixture: anything that works end-to-end on this will work on the
 * actual topic, and anything that only works on lorem will not.
 */
export const TARGETS: Record<string, Target> = {
  "spec-driven-dev": {
    id: "spec-driven-dev",
    label: "Spec-driven development",
    question:
      "Does spec-driven AI development produce more maintainable software than chat-driven prompting?",
    urls: [
      "https://kiro.dev/docs/specs/",
      "https://kiro.dev/docs/steering/",
      "https://kiro.dev/docs/hooks/",
      "https://aws.amazon.com/blogs/devops/",
    ],
    searchQuery: "spec-driven development agentic IDE maintainability evidence",
    tags: ["maintainability", "velocity", "team-consistency", "tooling", "cost"],
  },
};

/** The target the app renders by default. Change this line on the day. */
export const ACTIVE_TARGET_ID = "spec-driven-dev";

export function activeTarget(): Target {
  const t = TARGETS[ACTIVE_TARGET_ID];
  if (!t) {
    throw new Error(
      `ACTIVE_TARGET_ID "${ACTIVE_TARGET_ID}" is not in TARGETS. ` +
        `Available: ${Object.keys(TARGETS).join(", ")}`,
    );
  }
  return t;
}
