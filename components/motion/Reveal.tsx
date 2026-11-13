"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { dur, ease } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * The one entry animation in this app: 8px of offset and zero opacity,
 * expo-out. Nothing scales on entry — scaling text reads cheap.
 *
 * Under prefers-reduced-motion it becomes opacity-only, which keeps the
 * sense of sequence without the vestibular cost.
 */
export function Reveal({
  children,
  delay = 0,
  from = "bottom",
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right";
  className?: string;
  once?: boolean;
}) {
  const reduced = useReducedMotion();

  const offset = reduced
    ? { x: 0, y: 0 }
    : {
        bottom: { x: 0, y: 8 },
        top: { x: 0, y: -8 },
        left: { x: -8, y: 0 },
        right: { x: 8, y: 0 },
      }[from];

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: dur.section, delay, ease: ease.entry }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggers direct children through the same entry. Use for card grids and
 * metric rows — a 40ms step is enough to read as sequence without making
 * the viewer wait.
 */
export function Stagger({
  children,
  step = 0.04,
  className,
}: {
  children: ReactNode;
  step?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: reduced ? 0 : step } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerChild = {
  hidden: { opacity: 0, y: 8 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.element, ease: ease.entry },
  },
};
