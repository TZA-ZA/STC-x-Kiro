import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero/Hero";
import { Reveal } from "@/components/motion/Reveal";
import { BackToTopRing } from "@/components/primitives/BackToTopRing";
import { ProgressiveBlur } from "@/components/primitives/ProgressiveBlur";
import { driftSeries, latestSnapshot, loadDataset } from "@/lib/firecrawl/pipeline";
import { narrative, product } from "@/lib/content";

export default async function LandingPage() {
  // The hero shows live counts rather than marketing numbers. If the
  // corpus is empty the hero says zero — it never invents a figure.
  const dataset = await loadDataset();
  const snapshot = latestSnapshot(dataset);
  const drift = driftSeries(dataset.snapshots);

  return (
    <>
      <Hero
        stats={{
          sources: snapshot?.docs.length ?? 0,
          claims: snapshot?.claims.length ?? 0,
          capturedAt: snapshot?.capturedAt ?? null,
        }}
      />

      {/* ── Narrative: problem, mechanism, proof ─────────────────── */}
      <section id="how" className="relative mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 md:py-36">
        <div className="space-y-24 md:space-y-36">
          {narrative.map((beat, i) => (
            <Reveal key={beat.kicker} delay={0.05}>
              {/* Asymmetric two-column: the kicker sits in the margin like
                  a marginal note, which is what makes it read as an
                  argument rather than a feature list. */}
              <article className="grid gap-5 md:grid-cols-[14ch_minmax(0,1fr)] md:gap-16">
                <header className="flex items-start gap-3 md:flex-col md:gap-2">
                  <span className="t-num text-[0.6875rem] text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="t-meta">{beat.kicker}</p>
                </header>

                <div>
                  <h2 className="t-h1 max-w-[26ch]">{beat.title}</h2>
                  <p className="t-prose mt-5">{beat.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Closing ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-t border-line">
        <ProgressiveBlur direction="top" size={100} layers={6} maxBlur={16} />

        <div className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="t-meta mb-5">
              {drift.length} capture{drift.length === 1 ? "" : "s"} on record
            </p>
            <h2 className="t-display max-w-[18ch]">{product.question}</h2>
            <Link
              href="/dashboard"
              className="group mt-12 inline-flex items-center gap-2.5 rounded-[8px] border border-signal/30 bg-signal/[0.07] px-5 py-2.5 text-[0.875rem] text-signal transition-colors duration-[120ms] hover:border-signal/60 hover:bg-signal/[0.12]"
            >
              {product.cta.primary}
              <ArrowRight
                className="size-3.5 transition-transform duration-[120ms] group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-6 md:px-10">
        <p className="t-meta">
          {product.mark} — built for STC × Kiro, 15 Nov 2026
        </p>
      </footer>

      <BackToTopRing />
    </>
  );
}
