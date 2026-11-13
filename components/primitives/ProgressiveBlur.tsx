"use client";

import { cn } from "@/lib/utils";

type Direction = "top" | "bottom" | "left" | "right";

const MASK: Record<Direction, string> = {
  bottom: "to top",
  top: "to bottom",
  left: "to right",
  right: "to left",
};

/**
 * Progressive blur — a stack of backdrop-filter layers, each masked to a
 * narrower band with a stronger blur. The result is a *gradient of focus*
 * rather than a hard blur edge, which is what makes iOS overlays feel
 * native and what a single `backdrop-blur` can never achieve.
 *
 * Used at every section boundary, panel edge and modal overlay in this app
 * so content dissolves out of view instead of clipping.
 *
 * `layers` is the quality dial: 5 is plenty, 8 is luxurious, above that is
 * wasted GPU. Each layer is one composited pass.
 */
export function ProgressiveBlur({
  direction = "bottom",
  size = 96,
  layers = 6,
  maxBlur = 24,
  className,
}: {
  direction?: Direction;
  /** Height (top/bottom) or width (left/right) of the blur band, in px. */
  size?: number;
  layers?: number;
  /** Blur radius of the innermost layer, in px. */
  maxBlur?: number;
  className?: string;
}) {
  const isVertical = direction === "top" || direction === "bottom";
  const gradientDir = MASK[direction];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute z-20", className)}
      style={
        isVertical
          ? { left: 0, right: 0, height: size, [direction]: 0 }
          : { top: 0, bottom: 0, width: size, [direction]: 0 }
      }
    >
      {Array.from({ length: layers }).map((_, i) => {
        // Each layer covers a band that starts later and ends later than the
        // last, so blurs overlap and ramp smoothly instead of banding.
        const t = i / layers;
        const next = (i + 1) / layers;
        const blur = Math.round(maxBlur * Math.pow(t + 1 / layers, 2) * 100) / 100;

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: `linear-gradient(${gradientDir},
                rgba(0,0,0,0) ${t * 100}%,
                rgba(0,0,0,1) ${next * 100}%,
                rgba(0,0,0,1) ${Math.min(1, next + 1 / layers) * 100}%,
                rgba(0,0,0,0) ${Math.min(1, next + 2 / layers) * 100}%)`,
              WebkitMaskImage: `linear-gradient(${gradientDir},
                rgba(0,0,0,0) ${t * 100}%,
                rgba(0,0,0,1) ${next * 100}%,
                rgba(0,0,0,1) ${Math.min(1, next + 1 / layers) * 100}%,
                rgba(0,0,0,0) ${Math.min(1, next + 2 / layers) * 100}%)`,
            }}
          />
        );
      })}
    </div>
  );
}
