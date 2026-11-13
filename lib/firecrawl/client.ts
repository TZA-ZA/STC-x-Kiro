import Firecrawl from "@mendable/firecrawl-js";
import type { SourceDoc } from "./types";
import { hostOf } from "@/lib/utils";

/**
 * Thin adapter over the Firecrawl SDK.
 *
 * The point of the indirection is that nothing else in the codebase imports
 * the SDK. If the API shape moves, or if we need to swap retrieval for a
 * different provider under time pressure on the day, this is the only file
 * that changes — and `SourceDoc` stays stable, so the UI never notices.
 */

let client: Firecrawl | null = null;

export function firecrawl(): Firecrawl {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FIRECRAWL_API_KEY is not set. Scraping is only needed for " +
        "`npm run scrape`; the app itself serves committed cache from " +
        "data/cache and runs fine without a key.",
    );
  }
  client ??= new Firecrawl({ apiKey });
  return client;
}

function docId(url: string, i: number): string {
  return `d${String(i).padStart(2, "0")}-${hostOf(url).replace(/\W+/g, "-")}`;
}

/**
 * Retrieve pages as markdown.
 *
 * Failures are per-URL and non-fatal: one dead link must not abort a scrape
 * that is otherwise fine. The caller gets whatever succeeded plus the list
 * of what did not, and decides whether that is enough.
 */
export async function fetchDocs(urls: string[]): Promise<{
  docs: SourceDoc[];
  failures: { url: string; reason: string }[];
}> {
  const fc = firecrawl();
  const docs: SourceDoc[] = [];
  const failures: { url: string; reason: string }[] = [];

  const results = await Promise.allSettled(
    urls.map((url) =>
      fc.scrape(url, {
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 45_000,
      }),
    ),
  );

  results.forEach((res, i) => {
    const url = urls[i];
    if (res.status === "rejected") {
      failures.push({ url, reason: String(res.reason).slice(0, 200) });
      return;
    }

    const markdown = res.value?.markdown?.trim();
    if (!markdown) {
      failures.push({ url, reason: "no markdown in response" });
      return;
    }

    const meta = (res.value?.metadata ?? {}) as Record<string, unknown>;
    docs.push({
      id: docId(url, i),
      url,
      host: hostOf(url),
      title:
        (typeof meta.title === "string" && meta.title.trim()) || hostOf(url),
      fetchedAt: new Date().toISOString(),
      markdown,
      publishedAt:
        typeof meta.publishedTime === "string" ? meta.publishedTime : undefined,
    });
  });

  return { docs, failures };
}

/**
 * Discover additional URLs when a target's hand-picked list is thin.
 * Returns bare URLs; the caller still runs them through `fetchDocs`, so
 * discovered pages go through exactly the same validation as curated ones.
 */
export async function discoverUrls(
  query: string,
  limit = 4,
): Promise<string[]> {
  const fc = firecrawl();
  try {
    const res = await fc.search(query, { limit });
    const web = (res as { web?: { url?: string }[] })?.web ?? [];
    return web
      .map((r) => r.url)
      .filter((u): u is string => typeof u === "string");
  } catch {
    // Discovery is a nice-to-have. A failure here is not a scrape failure.
    return [];
  }
}
