"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { dur, ease } from "@/lib/design/tokens";

/**
 * Floating back-to-top control whose ring *is* the page scroll progress.
 *
 * Two things make this read as premium rather than as a stock widget:
 * the ring is spring-damped so it settles rather than tracking scroll
 * 1:1, and the control only appears after a full viewport of scrolling,
 * so it never competes with the hero.
 */
export function BackToTopRing() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const R = 20;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 8 }}
          transition={{ duration: dur.element, ease: ease.entry }}
          className="group fixed bottom-6 right-6 z-50 grid size-12 place-items-center rounded-full border border-line bg-surface/80 backdrop-blur-xl transition-colors duration-[120ms] hover:border-line-strong"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              stroke="currentColor"
              className="text-line-strong"
              strokeWidth="1.25"
            />
            <motion.circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              stroke="currentColor"
              className="text-signal"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ pathLength: progress }}
            />
          </svg>
          <ArrowUp
            className="size-4 text-muted transition-colors duration-[120ms] group-hover:text-ink"
            strokeWidth={1.75}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
