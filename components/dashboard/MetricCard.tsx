"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { chart } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * Stat tile. Per the form heuristic, a single headline number is not a
 * chart and should not be given one — no sparkline unless the trend is
 * itself the point, and no decorative icon.
 *
 * The number counts up on mount. One concession, not a flourish: it draws
 * the eye to the figure that matters, and it is skipped entirely under
 * reduced motion.
 */
export function MetricCard({
  label,
  value,
  hint,
  suffix,
  polarity,
  decimals = 0,
  delay = 0,
}: {
  label: string;
  value: number;
  hint?: string;
  suffix?: string;
  /** Tints the value for signed measures. Omit for plain counts. */
  polarity?: boolean;
  decimals?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const from = 0;
    const DURATION = 760;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // expo-out, matching the motion doctrine's entry easing.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [value, reduced, delay]);

  const tint = polarity
    ? value > 0
      ? chart.support
      : value < 0
        ? chart.oppose
        : chart.neutral
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: [0.16, 1, 0.3, 1] }}
      className="surface flex flex-col gap-2 p-4"
    >
      <p className="t-meta">{label}</p>
      <p
        className={cn("t-num text-[1.75rem] leading-none")}
        style={{ color: tint ?? "var(--color-ink)" }}
      >
        {polarity && shown > 0 ? "+" : ""}
        {shown.toFixed(decimals)}
        {suffix && <span className="ml-1 text-sm text-muted">{suffix}</span>}
      </p>
      {hint && <p className="text-[0.6875rem] leading-snug text-faint">{hint}</p>}
    </motion.div>
  );
}
