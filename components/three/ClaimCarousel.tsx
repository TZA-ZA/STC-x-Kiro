"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { chart } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";
import type { Claim } from "@/lib/firecrawl/types";

/**
 * Claims arranged on a rotating ring in 3D.
 *
 * Implemented with CSS 3D transforms rather than WebGL, deliberately.
 * Rendering text into a GL texture costs crispness, kills selection and
 * copy, drops the nodes out of the accessibility tree, and needs a font
 * atlas. A `preserve-3d` ring keeps every card as real DOM — selectable,
 * focusable, screen-reader navigable — while giving the same spatial
 * read. The shader field already owns the GPU budget on this page.
 *
 * Interaction: drag to spin, arrows to step, keyboard arrows when focused.
 * The ring is spring-damped so it settles with weight instead of snapping.
 *
 * Under reduced motion the ring flattens to a plain horizontal list — the
 * spatial metaphor is a nicety, the content is not.
 */
export function ClaimCarousel({
  claims,
  selectedId,
  onSelect,
}: {
  claims: Claim[];
  selectedId: string | null;
  onSelect: (claim: Claim) => void;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [radius, setRadius] = useState(420);

  const target = useMotionValue(0);
  const rotation = useSpring(target, { stiffness: 90, damping: 22, mass: 0.8 });

  const step = claims.length > 0 ? 360 / claims.length : 0;

  // Radius must grow with card count or the cards intersect. Derived from
  // the chord length needed to fit a 300px card at this angular step.
  useEffect(() => {
    const fit = () => {
      const cardW = window.innerWidth < 640 ? 230 : 300;
      const n = Math.max(claims.length, 3);
      const r = cardW / (2 * Math.tan(Math.PI / n));
      setRadius(Math.max(300, Math.min(760, r)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [claims.length]);

  const go = (dir: number) => {
    const next = index + dir;
    setIndex(next);
    target.set(-next * step);
  };

  useEffect(() => {
    target.set(-index * step);
  }, [index, step, target]);

  const positions = useMemo(
    () => claims.map((_, i) => i * step),
    [claims, step],
  );

  if (claims.length === 0) return null;

  // ── Reduced-motion / flat fallback ──────────────────────────────
  if (reduced) {
    return (
      <div className="scroll-area flex gap-4 overflow-x-auto pb-4">
        {claims.map((c) => (
          <ClaimCard
            key={c.id}
            claim={c}
            selected={c.id === selectedId}
            onSelect={() => onSelect(c)}
            className="w-[300px] shrink-0"
          />
        ))}
      </div>
    );
  }

  const activeIdx = ((index % claims.length) + claims.length) % claims.length;

  return (
    <div className="relative">
      <div
        className="relative h-[330px]"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 42%" }}
      >
        <motion.div
          className="absolute left-1/2 top-6 h-[260px] w-[300px] -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{ transformStyle: "preserve-3d", rotateY: rotation }}
          drag="x"
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            // Translate horizontal throw into whole-card steps so the ring
            // always lands with a card facing the viewer.
            const moved = Math.round(-info.offset.x / 110);
            if (moved !== 0) {
              const next = index + moved;
              setIndex(next);
              target.set(-next * step);
            } else {
              target.set(-index * step);
            }
          }}
        >
          {claims.map((claim, i) => {
            // Shortest angular distance from the viewer, for depth styling.
            const delta = ((positions[i] + (rotation.get() % 360) + 540) % 360) - 180;
            const facing = Math.abs(delta) < step / 2;

            return (
              <div
                key={claim.id}
                className="absolute inset-0"
                style={{
                  transform: `rotateY(${positions[i]}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <ClaimCard
                  claim={claim}
                  selected={claim.id === selectedId}
                  onSelect={() => {
                    setIndex(i);
                    target.set(-i * step);
                    onSelect(claim);
                  }}
                  dimmed={!facing && i !== activeIdx}
                  className="h-full w-full"
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls sit below the ring, not over it — overlaying arrows on
          the cards would cover the text that is the whole point. */}
      <div className="mt-2 flex items-center justify-center gap-5">
        <RingButton label="Previous claim" onClick={() => go(-1)}>
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </RingButton>

        <p className="t-num text-xs text-muted">
          {String(activeIdx + 1).padStart(2, "0")}
          <span className="text-faint"> / {String(claims.length).padStart(2, "0")}</span>
        </p>

        <RingButton label="Next claim" onClick={() => go(1)}>
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </RingButton>
      </div>
    </div>
  );
}

function RingButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors duration-[120ms] hover:border-line-strong hover:text-ink"
    >
      {children}
    </button>
  );
}

const STANCE_COLOR: Record<Claim["stance"], string> = {
  support: chart.support,
  oppose: chart.oppose,
  neutral: chart.neutral,
};

function ClaimCard({
  claim,
  selected,
  dimmed,
  onSelect,
  className,
}: {
  claim: Claim;
  selected: boolean;
  dimmed?: boolean;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col gap-3 rounded-[10px] border bg-surface p-5 text-left transition-all duration-[280ms]",
        selected ? "border-signal/50 bg-raise" : "border-line hover:border-line-strong",
        dimmed && "opacity-35",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {/* Stance is never colour-alone: the dot carries the hue, the word
            carries the meaning. */}
        <span className="flex items-center gap-2">
          <span
            className="size-1.5 rounded-full"
            style={{ background: STANCE_COLOR[claim.stance] }}
            aria-hidden
          />
          <span className="t-meta">{claim.stance}</span>
        </span>
        <span className="t-num text-[0.6875rem] text-faint">
          {claim.confidence.toFixed(2)}
        </span>
      </div>

      <p className="line-clamp-5 text-[0.8125rem] leading-relaxed text-ink">
        {claim.text}
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {claim.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-muted"
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}
