"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { dur, ease } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * Optimistic action with a timed undo window.
 *
 * The pattern: the action commits immediately in the UI, and a ring drains
 * over `window` ms. Click inside that window and `onUndo` runs; let it drain
 * and `onCommit` fires. No confirmation dialog, no blocking modal — which is
 * why it feels fast rather than cautious.
 *
 * The ring is an SVG `stroke-dashoffset` tween rather than a width/scale
 * animation, so it stays crisp at any size and costs nothing to composite.
 */
export function UndoButton({
  label,
  undoLabel = "Undo",
  windowMs = 4000,
  onAct,
  onUndo,
  onCommit,
  className,
}: {
  label: string;
  undoLabel?: string;
  windowMs?: number;
  /** Fires immediately on click — apply the optimistic change here. */
  onAct: () => void;
  /** Fires if the user undoes within the window — revert here. */
  onUndo: () => void;
  /** Fires when the window drains — persist here. */
  onCommit?: () => void;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const act = () => {
    onAct();
    setPending(true);
    clear();
    timer.current = setTimeout(() => {
      setPending(false);
      onCommit?.();
    }, windowMs);
  };

  const undo = () => {
    clear();
    setPending(false);
    onUndo();
  };

  const R = 9;
  const C = 2 * Math.PI * R;

  return (
    <div className={cn("relative inline-flex", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {!pending ? (
          <motion.button
            key="act"
            type="button"
            onClick={act}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: dur.micro, ease: ease.entry }}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-raise px-3.5 text-[0.8125rem] text-ink transition-colors duration-[120ms] hover:border-line-strong hover:bg-[#191d22]"
          >
            {label}
          </motion.button>
        ) : (
          <motion.button
            key="undo"
            type="button"
            onClick={undo}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: dur.micro, ease: ease.entry }}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-signal/40 bg-signal/10 px-3 text-[0.8125rem] text-signal"
          >
            <span className="relative inline-flex size-[22px] items-center justify-center">
              <svg
                viewBox="0 0 22 22"
                className="absolute inset-0 -rotate-90"
                aria-hidden
              >
                <circle
                  cx="11"
                  cy="11"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  strokeWidth="1.5"
                />
                <motion.circle
                  cx="11"
                  cy="11"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: C }}
                  transition={{
                    duration: reduced ? 0 : windowMs / 1000,
                    ease: "linear",
                  }}
                />
              </svg>
              <Undo2 className="size-3" strokeWidth={1.75} />
            </span>
            {undoLabel}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
