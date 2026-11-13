"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * Word-by-word mask reveal for display type.
 *
 * The important detail: each word sits in its own `overflow-hidden` wrapper
 * and slides up from fully below the baseline. That reads as type being
 * *uncovered* rather than fading in, which is the difference between the
 * basement.studio / KidSuper feel and a generic fade.
 *
 * Accessibility: the full string stays in one sr-only node so screen
 * readers get the sentence, not 12 disconnected words.
 */
export function KineticText({
  text,
  className,
  delay = 0,
  step = 0.055,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <Tag className={cn(className)}>{text}</Tag>;
  }

  return (
    <Tag className={cn("inline-flex flex-wrap", className)}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          // Slight negative margin absorbs the descender clipping that
          // overflow-hidden would otherwise cause on g/y/p.
          className="relative inline-block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span
            className="inline-block whitespace-pre"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.9,
              delay: delay + i * step,
              ease: ease.entry,
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
