/**
 * Build `data/cache/<target>.json` from markdown already on disk in
 * `data/raw/`, with no network call and no API key.
 *
 * Why this exists: the cache is the demo's safety net, so it must be
 * reproducible by anyone who clones the repo — including a judge. It also
 * means the UI can be built and verified before a Firecrawl key is
 * available, which is exactly the situation in the days before the event.
 *
 *   npm run seed
 *
 * `npm run scrape` is the live equivalent and produces the identical
 * shape; both go through the same extractor, so what you see here is what
 * you get there.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { TARGETS, ACTIVE_TARGET_ID } from "../lib/firecrawl/targets";
import { extractClaims } from "../lib/firecrawl/extract";
import { validateDataset, type CachedDataset, type SourceDoc } from "../lib/firecrawl/types";

const RAW_DIR = path.join(process.cwd(), "data", "raw");
const CACHE_DIR = path.join(process.cwd(), "data", "cache");

/** Maps a raw markdown filename to the URL it was retrieved from. */
const PROVENANCE: Record<string, { url: string; title: string }> = {
  "kiro-specs.md": {
    url: "https://kiro.dev/docs/specs/",
    title: "Specs — Kiro Docs",
  },
  "kiro-steering.md": {
    url: "https://kiro.dev/docs/steering/",
    title: "Steering — Kiro Docs",
  },
  "kiro-hooks.md": {
    url: "https://kiro.dev/docs/hooks/",
    title: "Agent Hooks — Kiro Docs",
  },
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function main() {
  const target = TARGETS[ACTIVE_TARGET_ID];
  if (!target) throw new Error(`No target "${ACTIVE_TARGET_ID}"`);

  const files = (await fs.readdir(RAW_DIR).catch(() => [])).filter((f) =>
    f.endsWith(".md"),
  );

  if (files.length === 0) {
    console.error(
      `✗ no markdown in ${path.relative(process.cwd(), RAW_DIR)}.\n` +
        `  Either add files there, or run \`npm run scrape\` with a key.`,
    );
    process.exit(1);
  }

  const docs: SourceDoc[] = [];
  for (const [i, file] of files.entries()) {
    const markdown = await fs.readFile(path.join(RAW_DIR, file), "utf8");
    const prov = PROVENANCE[file] ?? {
      url: `file://data/raw/${file}`,
      title: file.replace(/\.md$/, ""),
    };
    docs.push({
      id: `d${String(i).padStart(2, "0")}-${hostOf(prov.url).replace(/\W+/g, "-")}`,
      url: prov.url,
      host: hostOf(prov.url),
      title: prov.title,
      fetchedAt: new Date().toISOString(),
      markdown,
    });
  }

  const { fragments, claims } = extractClaims(docs, target);
  console.log(`extracted ${claims.length} claim(s) from ${docs.length} source(s)`);

  if (claims.length === 0) {
    console.error(
      `✗ no claims cleared the relevance threshold.\n` +
        `  The raw markdown does not engage target.question. Either revise\n` +
        `  the question in lib/firecrawl/targets.ts or add better sources.`,
    );
    process.exit(1);
  }

  const dataset: CachedDataset = {
    targetId: target.id,
    label: target.label,
    question: target.question,
    snapshots: [
      {
        id: "snap-seed-0",
        targetId: target.id,
        capturedAt: new Date().toISOString(),
        docs,
        fragments,
        claims,
      },
    ],
  };

  const check = validateDataset(dataset);
  if (!check.ok) {
    console.error(`✗ invalid dataset:\n  ${check.errors.join("\n  ")}`);
    process.exit(1);
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const out = path.join(CACHE_DIR, `${target.id}.json`);
  await fs.writeFile(out, JSON.stringify(dataset, null, 2) + "\n", "utf8");
  console.log(`✓ wrote ${path.relative(process.cwd(), out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
