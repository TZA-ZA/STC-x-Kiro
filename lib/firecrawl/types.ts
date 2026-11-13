/**
 * The typed boundary between the open web and this application.
 *
 * Deliberately topic-agnostic: the shapes below describe *evidence and
 * claims*, not any particular subject. On the day of the hackathon the
 * topic changes what we point `targets.ts` at; it does not change these
 * types. That is the whole reason this file exists before the topic does.
 */

/** A page we retrieved. `markdown` is Firecrawl's cleaned output. */
export interface SourceDoc {
  id: string;
  url: string;
  host: string;
  title: string;
  /** ISO timestamp of retrieval. Drives the STALE indicator. */
  fetchedAt: string;
  markdown: string;
  /** Firecrawl-reported publication date, when the page exposed one. */
  publishedAt?: string;
}

/**
 * A verbatim span inside a SourceDoc.
 *
 * This is the unit that makes claims auditable: a Fragment always carries
 * the character offsets it came from, so the UI can quote it and link
 * straight back to the passage rather than asserting a source vaguely.
 */
export interface Fragment {
  id: string;
  docId: string;
  text: string;
  charStart: number;
  charEnd: number;
}

export type Stance = "support" | "oppose" | "neutral";

/**
 * An assertion extracted from one or more Fragments.
 *
 * `fragmentIds` is non-empty by construction — a Claim with no evidence is
 * dropped during normalisation rather than rendered with a shrug. This is
 * enforced in `pipeline.ts`, not merely documented here.
 */
export interface Claim {
  id: string;
  text: string;
  stance: Stance;
  /** 0-1, from the extraction model. Never invented in the UI. */
  confidence: number;
  fragmentIds: string[];
  tags: string[];
}

/** One complete capture of the sources at a point in time. */
export interface Snapshot {
  id: string;
  targetId: string;
  capturedAt: string;
  docs: SourceDoc[];
  fragments: Fragment[];
  claims: Claim[];
}

/**
 * All captures for one target, oldest first.
 *
 * More than one snapshot is what enables drift: comparing captures shows
 * how the web's position on a question moved, which is a far stronger
 * demo than a single static scrape.
 */
export interface Dataset {
  targetId: string;
  label: string;
  question: string;
  snapshots: Snapshot[];
  /** Set by the pipeline: `true` when served from committed cache. */
  fromCache: boolean;
}

/** Shape of each file in `data/cache/`. */
export type CachedDataset = Omit<Dataset, "fromCache">;

// ── Runtime validation ──────────────────────────────────────────────
// Hand-written rather than pulled from a schema library: it is 40 lines,
// it adds no dependency to the critical path, and the error messages say
// exactly which field of which record failed, which matters at 2pm on a
// hackathon day far more than elegance does.

function isStr(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

export function validateDataset(input: unknown): {
  ok: boolean;
  errors: string[];
  value?: CachedDataset;
} {
  const errors: string[] = [];
  const d = input as CachedDataset;

  if (!d || typeof d !== "object") {
    return { ok: false, errors: ["dataset is not an object"] };
  }
  if (!isStr(d.targetId)) errors.push("targetId missing");
  if (!Array.isArray(d.snapshots)) errors.push("snapshots is not an array");

  if (Array.isArray(d.snapshots)) {
    d.snapshots.forEach((s, i) => {
      const at = `snapshots[${i}]`;
      if (!isStr(s?.capturedAt)) errors.push(`${at}.capturedAt missing`);
      if (!Array.isArray(s?.docs)) errors.push(`${at}.docs is not an array`);
      if (!Array.isArray(s?.claims)) errors.push(`${at}.claims is not an array`);
      if (!Array.isArray(s?.fragments)) errors.push(`${at}.fragments is not an array`);

      const fragIds = new Set((s?.fragments ?? []).map((f) => f.id));
      (s?.claims ?? []).forEach((c, j) => {
        if (!c.fragmentIds?.length) {
          errors.push(`${at}.claims[${j}] has no evidence`);
        }
        for (const fid of c.fragmentIds ?? []) {
          if (!fragIds.has(fid)) {
            errors.push(`${at}.claims[${j}] cites unknown fragment ${fid}`);
          }
        }
      });
    });
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, errors: [], value: d };
}
