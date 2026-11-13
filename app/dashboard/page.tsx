import { Instrument } from "@/components/dashboard/Instrument";
import {
  driftSeries,
  isLiveMode,
  latestSnapshot,
  loadDataset,
  stanceSplit,
} from "@/lib/firecrawl/pipeline";

/**
 * Server component: all data loading and derivation happens here, so the
 * Firecrawl SDK and the `node:fs` cache reader never reach the client
 * bundle. The client component below receives plain serialisable props.
 */

// Revalidate rather than force-dynamic: in live mode the page refreshes on
// a sane cadence instead of re-scraping on every request, which would burn
// credits and make the demo slower the more a judge clicks around.
export const revalidate = 300;

export default async function DashboardPage() {
  const dataset = await loadDataset();
  const snapshot = latestSnapshot(dataset);
  const drift = driftSeries(dataset.snapshots);
  const split = stanceSplit(snapshot?.claims ?? []);

  return (
    <Instrument
      claims={snapshot?.claims ?? []}
      fragments={snapshot?.fragments ?? []}
      docs={snapshot?.docs ?? []}
      drift={drift}
      split={split}
      question={dataset.question}
      // `fromCache` drives the LIVE/CACHED badge. Showing it is a
      // deliberate honesty choice: a judge who asks "is this live?" gets
      // the answer from the UI rather than from a claim we make verbally.
      fromCache={dataset.fromCache || !isLiveMode()}
      capturedAt={snapshot?.capturedAt ?? null}
    />
  );
}
