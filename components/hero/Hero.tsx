"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { KineticText } from "@/components/motion/KineticText";
import { ProgressiveBlur } from "@/components/primitives/ProgressiveBlur";
import { ShaderField } from "./ShaderField";
import { dur, ease } from "@/lib/design/tokens";
import { product } from "@/lib/content";

/**
 * Above-the-fold composition.
 *
 * Layout logic: the display line is set left-aligned at the optical centre
 * rather than true centre, with the metadata rail pinned to the baseline
 * grid on the right. Centred hero copy is the single clearest tell of a
 * template, and an asymmetric hero with a hard left edge reads as
 * editorial — which is the whole Convix/basement.studio register.
 *
 * The scroll behaviour is a slow parallax lift plus a blur ramp, so the
 * hero dissolves upward into the first narrative section instead of
 * scrolling away as a block.
 */
export function Hero({
  stats,
}: {
  /** Live counts, so the hero is never claiming numbers it cannot show. */
  stats: { sources: number; claims: number; capturedAt: string | null };
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(6px)"]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      <ShaderField />

      {/* ── Top rail ───────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.section, ease: ease.entry }}
        className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10"
      >
        <span className="t-meta !tracking-[0.3em] !text-ink">{product.mark}</span>
        <div className="flex items-center gap-6">
          <a href="#how" className="t-meta transition-colors hover:!text-ink">
            {product.cta.secondary}
          </a>
          <Link
            href="/dashboard"
            className="t-meta !text-signal transition-opacity hover:opacity-70"
          >
            {product.cta.primary}
          </Link>
        </div>
      </motion.header>

      {/* ── Display block ──────────────────────────────────────────── */}
      <motion.div
        style={{ y, opacity, filter: blur }}
        className="relative z-10 px-6 pb-16 md:px-10 md:pb-24"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: dur.section, delay: 0.1 }}
            className="t-meta mb-6 flex items-center gap-2.5"
          >
            <span className="live-dot" />
            {product.tagline}
          </motion.p>

          <KineticText
            as="h1"
            text={product.heroLine}
            className="t-display max-w-[20ch]"
            delay={0.15}
          />

          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,46ch)_auto] md:items-end md:justify-between">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.section, delay: 0.5, ease: ease.entry }}
              className="t-prose"
            >
              {product.heroSub}
            </motion.p>

            {/* Metadata rail. Mono numerals against the display type is the
                "instrument, not website" cue. */}
            <motion.dl
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.section, delay: 0.6, ease: ease.entry }}
              className="flex gap-8 md:gap-12"
            >
              <Stat label="Sources" value={String(stats.sources)} />
              <Stat label="Claims" value={String(stats.claims)} />
              <Stat
                label="Captured"
                value={
                  stats.capturedAt
                    ? new Date(stats.capturedAt).toISOString().slice(0, 10)
                    : "—"
                }
              />
            </motion.dl>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.section, delay: 0.72, ease: ease.entry }}
            className="mt-12"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-[8px] border border-signal/30 bg-signal/[0.07] px-5 py-2.5 text-[0.875rem] text-signal transition-colors duration-[120ms] hover:border-signal/60 hover:bg-signal/[0.12]"
            >
              {product.cta.primary}
              <ArrowRight
                className="size-3.5 transition-transform duration-[120ms] group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* The hero does not end at a hard edge — it dissolves. */}
      <ProgressiveBlur direction="bottom" size={140} layers={7} maxBlur={18} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="t-meta mb-1.5">{label}</dt>
      <dd className="t-num text-xl text-ink">{value}</dd>
    </div>
  );
}
