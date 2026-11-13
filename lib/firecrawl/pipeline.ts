import { promises as fs } from "node:fs";
import path from "node:path";
import { activeTarget, type Target } from "./targets";
import { validateDataset, type CachedDataset, type Claim, type Dataset, type Snapshot } from "./types";

/**
 * The single data entry point for the whole application.
 *
 * Components call `loadDataset()` and never learn whether the bytes came
 * from the network or from `data/cache`. That indirection is the demo
 * safety net: venue wifi failing degrades the app to a cached corpus
 * instead of to an error boundary.
 *
 * Mode is set by NEXT_PUBLIC_LIVE_MODE:
 *   unset / "0"  -> committed cache only. The default, and what ships.
 *   "1"          -> attempt a live scrape, fall back to cache on any failure.
 */

const CACHE_DIR = path.join(process.cwd(), "data", "cache");

function cachePath(targetId: string) {
  return path.join(CACHE_DIR, `${targetId}.json`);
}

export function isLiveMode(): boolean {
  return process.env.NEXT_PUBLIC_LIVE_MODE === "1";
}

async function readCache(targetId: string): Promise<CachedDataset | null> {
  try {
    const raw = await fs.readFile(cachePath(targetId), "utf8");
    const parsed = JSON.parse(raw);
    const result = validateDataset(parsed);

    if (!result.ok) {
      // Loud in the build log, silent in the UI. A malformed cache is a
      // developer problem; the audience should never see a stack trace.
      console.error(
        `[pipeline] cache for "${targetId}" failed validation:\n  ` +
          result.errors.slice(0, 8).join("\n  "),
      );
      return null;
    }
    return result.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Load the active dataset.
 *
 * Never throws. A total failure returns an empty-but-valid Dataset so the
 * UI renders its empty states rather than crashing — on stage, an honest
 * "no data" panel is recoverable and a blank white screen is not.
 */
export async function loadDataset(target: Target = activeTarget()): Promise<Dataset> {
  if (isLiveMode()) {
    try {
      const live = await scrapeTarget(target);
      if (live.snapshots.at(-1)?.claims.length) {
        return { ...live, fromCache: false };
      }
    } catch (err) {
      console.warn(`[pipeline] live scrape failed, falling back to cache:`, err);
    }
  }

  const cached = await readCache(target.id);
  if (cached) return { ...cached, fromCache: true };

  return {
    targetId: target.id,
    label: target.label,
    question: target.question,
    snapshots: [],
    fromCache: true,
  };
}

/**
 * Perform a live scrape and return a one-snapshot dataset.
 * Imported lazily so the Firecrawl SDK never enters the client bundle.
 */
async function scrapeTarget(target: Target): Promise<CachedDataset> {
  const { fetchDocs } = await import("./client");
  const { extractClaims } = await import("./extract");

  const { docs } = await fetchDocs(target.urls);
  const { fragments, claims } = extractClaims(docs, target);

  return {
    targetId: target.id,
    label: target.label,
    question: target.question,
    snapshots: [
      {
        id: `live-${Date.now()}`,
        targetId: target.id,
        capturedAt: new Date().toISOString(),
        docs,
        fragments,
        claims,
      },
    ],
  };
}

// ── Derived views ───────────────────────────────────────────────────
// Everything below is pure, synchronous and unit-testable. Keeping
// derivation out of components means the same numbers can be asserted in
// a test and shown on a slide without being computed twice.

export interface StanceSplit {
  support: number;
  oppose: number;
  neutral: number;
  total: number;
  /** -1 (fully opposed) .. +1 (fully supportive). The headline metric. */
  consensus: number;
}

export function stanceSplit(claims: Claim[]): StanceSplit {
  const support = claims.filter((c) => c.stance === "support").length;
  const oppose = claims.filter((c) => c.stance === "oppose").length;
  const neutral = claims.filter((c) => c.stance === "neutral").length;
  const total = claims.length;

  // Weighted by confidence so a pile of hedged claims does not read as
  // strongly as a few firm ones.
  const weight = (s: Claim["stance"]) =>
    claims.filter((c) => c.stance === s).reduce((n, c) => n + c.confidence, 0);

  const w = weight("support") + weight("oppose");
  const consensus = w === 0 ? 0 : Math.round(((weight("support") - weight("oppose")) / w) * 100) / 100;

  return { support, oppose, neutral, total, consensus };
}

export interface DriftPoint {
  snapshotId: string;
  capturedAt: string;
  consensus: number;
  claimCount: number;
  sourceCount: number;
}

/**
 * Consensus over time, oldest first.
 *
 * This is the series behind the hero moment: not what the web says, but
 * how what it says has *moved*. A single scrape cannot produce this, which
 * is exactly why it is hard to copy.
 */
export function driftSeries(snapshots: Snapshot[]): DriftPoint[] {
  return [...snapshots]
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt))
    .map((s) => ({
      snapshotId: s.id,
      capturedAt: s.capturedAt,
      consensus: stanceSplit(s.claims).consensus,
      claimCount: s.claims.length,
      sourceCount: s.docs.length,
    }));
}

/** Claims grouped by tag, biggest group first. Feeds the 3D carousel. */
export function byTag(claims: Claim[]): { tag: string; claims: Claim[] }[] {
  const map = new Map<string, Claim[]>();
  for (const c of claims) {
    for (const t of c.tags) {
      const list = map.get(t) ?? [];
      list.push(c);
      map.set(t, list);
    }
  }
  return [...map.entries()]
    .map(([tag, cs]) => ({ tag, claims: cs }))
    .sort((a, b) => b.claims.length - a.claims.length);
}

/** Resolve a claim to its evidence spans and originating documents. */
export function evidenceFor(claim: Claim, snapshot: Snapshot) {
  const fragments = snapshot.fragments.filter((f) => claim.fragmentIds.includes(f.id));
  const docs = snapshot.docs.filter((d) => fragments.some((f) => f.docId === d.id));
  return { fragments, docs };
}

export function latestSnapshot(dataset: Dataset): Snapshot | null {
  return driftSeries(dataset.snapshots).length
    ? (dataset.snapshots.find(
        (s) => s.id === driftSeries(dataset.snapshots).at(-1)!.snapshotId,
      ) ?? null)
    : null;
}
