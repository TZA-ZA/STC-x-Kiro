"use client";

import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Quote } from "lucide-react";
import { ScrollArea } from "@/components/primitives/ScrollArea";
import { ease } from "@/lib/design/tokens";
import { ui } from "@/lib/content";
import type { Claim, Fragment, SourceDoc } from "@/lib/firecrawl/types";

/**
 * The payoff surface: the verbatim passage a selected claim came from,
 * with its exact character offsets and a link to the source.
 *
 * This is the component that makes the product's argument. Showing the
 * offsets is not decoration — it is the difference between "we cite
 * sources" and "here is the span, at these bytes, in this document, and
 * you can go check it".
 */
export function EvidencePanel({
  claim,
  fragments,
  docs,
}: {
  claim: Claim | null;
  fragments: Fragment[];
  docs: SourceDoc[];
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <h2 className="t-meta !text-ink">{ui.evidencePanelTitle}</h2>
        {claim && (
          <span className="t-num text-[0.6875rem] text-faint">
            {fragments.length} span{fragments.length === 1 ? "" : "s"}
          </span>
        )}
      </header>
      <div className="hairline" />

      <AnimatePresence mode="wait">
        {!claim ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid flex-1 place-items-center p-8"
          >
            <p className="max-w-[28ch] text-center text-[0.8125rem] text-faint">
              {ui.evidenceEmpty}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={claim.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: ease.entry }}
            className="min-h-0 flex-1"
          >
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {fragments.map((frag) => {
                  const doc = docs.find((d) => d.id === frag.docId);
                  return (
                    <article
                      key={frag.id}
                      className="surface-raise overflow-hidden"
                    >
                      <div className="flex items-start gap-2.5 p-3.5">
                        <Quote
                          className="mt-0.5 size-3.5 shrink-0 text-signal"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <blockquote className="text-[0.8125rem] leading-relaxed text-ink">
                          {frag.text}
                        </blockquote>
                      </div>

                      <div className="hairline" />

                      <footer className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5">
                        {/* Offsets are the audit trail. Mono, muted, small —
                            present for anyone who looks, never shouting. */}
                        <span className="t-num text-[0.625rem] text-faint">
                          chars {frag.charStart}–{frag.charEnd}
                        </span>

                        {doc && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-wide text-muted transition-colors hover:text-ink"
                          >
                            {doc.host}
                            <ExternalLink
                              className="size-2.5 transition-transform group-hover:-translate-y-px"
                              strokeWidth={2}
                            />
                          </a>
                        )}
                      </footer>
                    </article>
                  );
                })}

                {docs.length > 0 && (
                  <div className="pt-1">
                    <p className="t-meta mb-2">Source document</p>
                    {docs.map((d) => (
                      <p key={d.id} className="text-[0.75rem] leading-snug text-muted">
                        {d.title}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
