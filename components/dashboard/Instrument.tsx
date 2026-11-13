"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Radio, Target } from "lucide-react";
import { ClaimCarousel } from "@/components/three/ClaimCarousel";
import { ProgressiveBlur } from "@/components/primitives/ProgressiveBlur";
import { ScrollArea } from "@/components/primitives/ScrollArea";
import { UndoButton } from "@/components/primitives/UndoButton";
import { DriftChart } from "./DriftChart";
import { EvidencePanel } from "./EvidencePanel";
import { MetricCard } from "./MetricCard";
import { metrics, product, ui } from "@/lib/content";
import { cn, relativeTime } from "@/lib/utils";
import type { DriftPoint, StanceSplit } from "@/lib/firecrawl/pipeline";
import type { Claim, Fragment, SourceDoc } from "@/lib/firecrawl/types";

/**
 * The working surface. Three-zone layout: a narrow identity/filter rail,
 * a main column that reads top-to-bottom as headline -> trend -> claims,
 * and a dedicated evidence column on the right.
 *
 * The right column is fixed rather than a modal on purpose. Evidence that
 * appears in an overlay reads as a footnote you dismiss; evidence that is
 * permanently on screen beside the claim reads as part of the claim. That
 * is the product's entire thesis expressed as a layout decision.
 */
export function Instrument({
  claims,
  fragments,
  docs,
  drift,
  split,
  question,
  fromCache,
  capturedAt,
}: {
  claims: Claim[];
  fragments: Fragment[];
  docs: SourceDoc[];
  drift: DriftPoint[];
  split: StanceSplit;
  question: string;
  fromCache: boolean;
  capturedAt: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  const allTags = useMemo(
    () => [...new Set(claims.flatMap((c) => c.tags))].sort(),
    [claims],
  );

  const visible = useMemo(
    () =>
      claims.filter(
        (c) => !hidden.includes(c.id) && (!tagFilter || c.tags.includes(tagFilter)),
      ),
    [claims, hidden, tagFilter],
  );

  const selected = claims.find((c) => c.id === selectedId) ?? null;

  const selectedEvidence = useMemo(() => {
    if (!selected) return { fragments: [], docs: [] };
    const frags = fragments.filter((f) => selected.fragmentIds.includes(f.id));
    return {
      fragments: frags,
      docs: docs.filter((d) => frags.some((f) => f.docId === d.id)),
    };
  }, [selected, fragments, docs]);

  const driftDelta =
    drift.length > 1 ? drift.at(-1)!.consensus - drift[0].consensus : 0;

  return (
    <div className="flex min-h-[100svh] flex-col lg:h-[100svh] lg:flex-row lg:overflow-hidden">
      {/* ── Rail ─────────────────────────────────────────────────── */}
      <aside className="flex shrink-0 flex-col border-b border-line lg:w-[232px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 t-meta !text-ink"
          >
            <ArrowLeft
              className="size-3 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2}
            />
            {product.mark}
          </Link>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.5625rem] tracking-[0.12em]",
              fromCache
                ? "border-warn/30 text-warn"
                : "border-signal/30 text-signal",
            )}
          >
            <span className="live-dot !size-1" data-stale={fromCache} />
            {fromCache ? ui.cacheBadge : ui.liveBadge}
          </span>
        </div>

        <div className="hairline" />

        <div className="px-4 py-4">
          <p className="t-meta mb-2 flex items-center gap-1.5">
            <Target className="size-3" strokeWidth={1.75} />
            Question
          </p>
          <p className="text-[0.75rem] leading-snug text-muted">{question}</p>
        </div>

        <div className="hairline" />

        {/* Filters in one row/stack above the content, never interleaved. */}
        <div className="min-h-0 flex-1 px-4 py-4">
          <p className="t-meta mb-2.5 flex items-center gap-1.5">
            <Layers className="size-3" strokeWidth={1.75} />
            Facets
          </p>
          <div className="flex flex-wrap gap-1.5">
            <FacetChip
              active={tagFilter === null}
              onClick={() => setTagFilter(null)}
            >
              all
            </FacetChip>
            {allTags.map((t) => (
              <FacetChip
                key={t}
                active={tagFilter === t}
                onClick={() => setTagFilter(tagFilter === t ? null : t)}
              >
                {t}
              </FacetChip>
            ))}
          </div>
        </div>

        <div className="hairline" />

        <div className="px-4 py-3.5">
          <p className="t-num text-[0.625rem] text-faint">
            <Radio className="mr-1.5 inline size-2.5" strokeWidth={2} />
            {capturedAt ? relativeTime(capturedAt) : "no capture"}
          </p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="relative isolate min-w-0 flex-1">
        <ScrollArea className="h-full" edge={56}>
          <div className="space-y-8 p-6 pb-24 lg:p-8">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                label={metrics.consensus.label}
                hint={metrics.consensus.hint}
                value={split.consensus}
                decimals={2}
                polarity
                delay={0}
              />
              <MetricCard
                label={metrics.claims.label}
                hint={metrics.claims.hint}
                value={split.total}
                delay={0.04}
              />
              <MetricCard
                label={metrics.sources.label}
                hint={metrics.sources.hint}
                value={docs.length}
                delay={0.08}
              />
              <MetricCard
                label={metrics.drift.label}
                hint={metrics.drift.hint}
                value={driftDelta}
                decimals={2}
                polarity
                delay={0.12}
              />
            </div>

            <section className="surface overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <h2 className="t-h2">Consensus drift</h2>
                <p className="t-num text-[0.625rem] text-faint">
                  {drift.length} capture{drift.length === 1 ? "" : "s"}
                </p>
              </header>
              <div className="hairline" />
              <div className="p-4">
                <DriftChart points={drift} />
                {drift.length < 2 && (
                  <p className="t-meta mt-3 !normal-case !tracking-normal">
                    Run `npm run scrape` again to add a capture — drift needs
                    at least two points to say anything.
                  </p>
                )}
              </div>
            </section>

            <section>
              <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="t-h2">Extracted claims</h2>
                  <p className="mt-1 text-[0.75rem] text-muted">{ui.tetherHint}</p>
                </div>

                {/* Optimistic hide with an undo window — faster than a
                    confirm dialog, and reversible, which is the point. */}
                {selected && (
                  <UndoButton
                    label="Hide this claim"
                    windowMs={4000}
                    onAct={() => {
                      setHidden((h) => [...h, selected.id]);
                      setSelectedId(null);
                    }}
                    onUndo={() =>
                      setHidden((h) => h.filter((id) => id !== selected.id))
                    }
                  />
                )}
              </header>

              {visible.length > 0 ? (
                <ClaimCarousel
                  claims={visible}
                  selectedId={selectedId}
                  onSelect={(c) => setSelectedId(c.id)}
                />
              ) : (
                <div className="surface grid h-[200px] place-items-center">
                  <p className="text-[0.8125rem] text-faint">
                    {claims.length === 0 ? ui.noData : "No claims match this facet."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
        <ProgressiveBlur direction="bottom" size={72} layers={5} maxBlur={14} />
      </main>

      {/* ── Evidence ─────────────────────────────────────────────── */}
      <aside className="shrink-0 border-t border-line lg:w-[360px] lg:border-l lg:border-t-0">
        <div className="h-[420px] lg:h-full">
          <EvidencePanel
            claim={selected}
            fragments={selectedEvidence.fragments}
            docs={selectedEvidence.docs}
          />
        </div>
      </aside>
    </div>
  );
}

function FacetChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-1 font-mono text-[0.625rem] tracking-wide transition-colors duration-[120ms]",
        active
          ? "border-signal/50 bg-signal/10 text-signal"
          : "border-line text-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
