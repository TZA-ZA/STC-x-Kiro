"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "./ProgressiveBlur";

/**
 * Scrollable panel with progressive-blur edges that appear only when there
 * is content hidden in that direction.
 *
 * Conditional edges are the detail that matters: a permanent fade at the
 * bottom of a short list looks like a rendering bug, and a missing fade on
 * a long one looks like a hard crop. Tracking it costs one scroll listener.
 */
export function ScrollArea({
  children,
  className,
  edge = 40,
  maxHeight,
}: {
  children: ReactNode;
  className?: string;
  /** Height of the blur band at each edge, in px. */
  edge?: number;
  maxHeight?: number | string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setAtTop(scrollTop <= 1);
      setAtBottom(scrollTop + clientHeight >= scrollHeight - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });

    // Content can change height without a scroll event firing.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative isolate min-h-0", className)}>
      {!atTop && <ProgressiveBlur direction="top" size={edge} layers={4} maxBlur={12} />}
      <div ref={ref} className="scroll-area h-full" style={{ maxHeight }}>
        {children}
      </div>
      {!atBottom && (
        <ProgressiveBlur direction="bottom" size={edge} layers={4} maxBlur={12} />
      )}
    </div>
  );
}
