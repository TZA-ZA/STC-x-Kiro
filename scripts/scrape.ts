/**
 * Refresh `data/cache/<target>.json` from live sources.
 *
 *   npm run scrape              # active target
 *   npm run scrape -- <id>      # a specific target
 *   npm run scrape -- --discover  # also pull in search-discovered URLs
 *
 * Snapshots APPEND rather than replace. That is deliberate: the drift view
 * needs more than one capture to say anything, so every run adds a point
 * to the series. Run it a few times across the days before the event and
 * the hero chart has real history in it instead of a single dot.
 *
 * The resulting JSON is committed. That is what makes the demo immune to
 * venue wifi — see .kiro/steering/product.md rule 3.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { TARGETS, ACTIVE_TARGET_ID, type Target } from "../lib/firecrawl/targets";
import { fetchDocs, discoverUrls } from "../lib/firecrawl/client";
import { extractClaims } from "../lib/firecrawl/extract";
import { validateDataset, type CachedDataset, type Snapshot } from "../lib/firecrawl/types";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");
const MAX_SNAPSHOTS = 12;

function arg(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function loadExisting(targetId: string): Promise<CachedDataset | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, `${targetId}.json`), "utf8");
    const res = validateDataset(JSON.parse(raw));
    return res.ok ? (res.value ?? null) : null;
  } catch {
    return null;
  }
}

async function run(target: Target) {
  console.log(`\n→ target: ${target.label} (${target.id})`);
  console.log(`  question: ${target.question}`);

  let urls = [...target.urls];

  if (arg("discover") && target.searchQuery) {
    const found = await discoverUrls(target.searchQuery, 4);
    const fresh = found.filter((u) => !urls.includes(u));
    console.log(`  discovered ${fresh.length} additional url(s)`);
    urls = [...urls, ...fresh];
  }

  console.log(`  fetching ${urls.length} page(s)…`);
  const { docs, failures } = await fetchDocs(urls);

  for (const f of failures) {
    console.warn(`  ! ${f.url}\n    ${f.reason}`);
  }

  if (docs.length === 0) {
    // Hard stop: never overwrite a good cache with nothing.
    console.error(
      `\n✗ every source failed. Existing cache left untouched.\n` +
        `  Check FIRECRAWL_API_KEY and network, then retry.`,
    );
    process.exitCode = 1;
    return;
  }

  const { fragments, claims } = extractClaims(docs, target);
  console.log(`  extracted ${claims.length} claim(s) from ${docs.length} source(s)`);

  if (claims.length === 0) {
    console.error(
      `\n✗ no claims passed the relevance threshold.\n` +
        `  The sources probably do not discuss the question. Revise\n` +
        `  target.question or target.urls in lib/firecrawl/targets.ts.`,
    );
    process.exitCode = 1;
    return;
  }

  const snapshot: Snapshot = {
    id: `snap-${new Date().toISOString().replace(/[:.]/g, "-")}`,
    targetId: target.id,
    capturedAt: new Date().toISOString(),
    docs,
    fragments,
    claims,
  };

  const existing = await loadExisting(target.id);
  const next: CachedDataset = {
    targetId: target.id,
    label: target.label,
    question: target.question,
    snapshots: [...(existing?.snapshots ?? []), snapshot].slice(-MAX_SNAPSHOTS),
  };

  const check = validateDataset(next);
  if (!check.ok) {
    console.error(`\n✗ refusing to write an invalid cache:\n  ${check.errors.join("\n  ")}`);
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${target.id}.json`);
  await fs.writeFile(file, JSON.stringify(next, null, 2) + "\n", "utf8");

  console.log(
    `\n✓ wrote ${path.relative(process.cwd(), file)}` +
      `\n  snapshots in series: ${next.snapshots.length}` +
      `\n  remember to commit this file.`,
  );
}

const requested = process.argv.find((a) => !a.startsWith("-") && TARGETS[a]);
const target = TARGETS[requested ?? ACTIVE_TARGET_ID];

if (!target) {
  console.error(`Unknown target. Available: ${Object.keys(TARGETS).join(", ")}`);
  process.exit(1);
}

run(target).catch((err) => {
  console.error(err);
  process.exit(1);
});
