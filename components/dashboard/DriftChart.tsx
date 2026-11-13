"use client";

import { useMemo, useRef, useState } from "react";
import { chart, color } from "@/lib/design/tokens";
import { remap } from "@/lib/utils";
import type { DriftPoint } from "@/lib/firecrawl/pipeline";

/**
 * Consensus over time. One series, so no legend — the panel title names it.
 *
 * Form choice: a line, because the job is change-over-time on a continuous
 * measure. Bars would imply discrete independent buckets, which is wrong
 * for a value that is being tracked rather than counted.
 *
 * Built as hand-written SVG rather than with a chart library: the only
 * unusual requirement is the zero baseline acting as a polarity divider
 * with the area filled toward it in two different hues, and expressing
 * that through a library's API costs more code than drawing it.
 *
 * Interaction is not optional — an SVG chart in a browser that does not
 * respond to the cursor reads as an image of a chart.
 */

const PAD = { top: 18, right: 54, bottom: 26, left: 40 };
const W = 760;
const H = 230;

export function DriftChart({ points }: { points: DriftPoint[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const geom = useMemo(() => {
    if (points.length === 0) return null;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    // Consensus is bounded -1..+1 by definition, so the domain is fixed
    // rather than data-driven. A chart whose axis rescales per capture
    // would make drift look larger or smaller than it is.
    const xAt = (i: number) =>
      PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const yAt = (v: number) => PAD.top + remap(v, 1, -1, 0, innerH);

    const zeroY = yAt(0);
    const coords = points.map((p, i) => ({ x: xAt(i), y: yAt(p.consensus), p }));

    const line = coords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");

    // Two areas, each clipped to its own side of zero, so the fill hue
    // tells you the polarity without reading the axis.
    const area =
      coords.length > 1
        ? `${line} L${coords.at(-1)!.x.toFixed(1)},${zeroY.toFixed(1)} L${coords[0].x.toFixed(1)},${zeroY.toFixed(1)} Z`
        : "";

    return { coords, line, area, zeroY, innerW, innerH, xAt, yAt };
  }, [points]);

  if (!geom) {
    return (
      <div className="grid h-[230px] place-items-center">
        <p className="t-meta">Needs at least one capture</p>
      </div>
    );
  }

  const { coords, line, area, zeroY } = geom;
  const active = hover !== null ? coords[hover] : null;
  const last = coords.at(-1)!;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map client px into the viewBox, since the SVG scales responsively.
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHover(nearest);
  };

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        aria-label={`Consensus across ${points.length} captures, from ${points[0].consensus} to ${last.p.consensus}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="drift-pos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chart.support} stopOpacity="0.26" />
            <stop offset="100%" stopColor={chart.support} stopOpacity="0" />
          </linearGradient>
          <clipPath id="clip-above">
            <rect x="0" y="0" width={W} height={zeroY} />
          </clipPath>
          <clipPath id="clip-below">
            <rect x="0" y={zeroY} width={W} height={H - zeroY} />
          </clipPath>
        </defs>

        {/* Grid: three gridlines only. Recessive by design — the marks are
            the content, the furniture is scaffolding. */}
        {[1, 0.5, -0.5, -1].map((v) => (
          <line
            key={v}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={geom.yAt(v)}
            y2={geom.yAt(v)}
            stroke={chart.grid}
            strokeWidth="1"
          />
        ))}

        {/* Zero line is not a gridline — it is the polarity divider, so it
            gets the axis weight and a label. */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={zeroY}
          y2={zeroY}
          stroke={chart.axis}
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {[1, 0, -1].map((v) => (
          <text
            key={v}
            x={PAD.left - 10}
            y={geom.yAt(v) + 3.5}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
            fill={color.faint}
          >
            {v > 0 ? "+1" : v}
          </text>
        ))}

        {area && (
          <>
            <path d={area} fill="url(#drift-pos)" clipPath="url(#clip-above)" />
            <path
              d={area}
              fill={chart.oppose}
              fillOpacity="0.2"
              clipPath="url(#clip-below)"
            />
          </>
        )}

        {/* 2px line, round caps, split by polarity at the zero crossing. */}
        <path
          d={line}
          fill="none"
          stroke={chart.support}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#clip-above)"
        />
        <path
          d={line}
          fill="none"
          stroke={chart.oppose}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#clip-below)"
        />

        {/* Markers at >=8px, with a 2px surface ring so overlapping points
            stay countable. */}
        {coords.map((c, i) => (
          <circle
            key={c.p.snapshotId}
            cx={c.x}
            cy={c.y}
            r={hover === i ? 5.5 : 4}
            fill={c.p.consensus >= 0 ? chart.support : chart.oppose}
            stroke={color.surface}
            strokeWidth="2"
          />
        ))}

        {/* Crosshair on the nearest capture. */}
        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke={color.lineStrong}
            strokeWidth="1"
          />
        )}

        {/* One direct label, on the latest value. Never a number on every
            point — that is what the tooltip is for. */}
        <text
          x={last.x + 12}
          y={last.y + 3.5}
          fontSize="12"
          fontFamily="var(--font-geist-mono), monospace"
          fill={color.ink}
        >
          {last.p.consensus > 0 ? "+" : ""}
          {last.p.consensus.toFixed(2)}
        </text>

        <text
          x={PAD.left}
          y={H - 8}
          fontSize="10"
          fontFamily="var(--font-geist-mono), monospace"
          fill={color.faint}
        >
          {new Date(points[0].capturedAt).toISOString().slice(0, 10)}
        </text>
        {points.length > 1 && (
          <text
            x={W - PAD.right}
            y={H - 8}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
            fill={color.faint}
          >
            {new Date(last.p.capturedAt).toISOString().slice(0, 10)}
          </text>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-[8px] border border-line-strong bg-raise/95 px-3 py-2 backdrop-blur-sm"
          style={{
            left: `${(active.x / W) * 100}%`,
            top: `${(active.y / H) * 100}%`,
            marginTop: -10,
          }}
        >
          <p className="t-meta mb-1">
            {new Date(active.p.capturedAt).toISOString().slice(0, 16).replace("T", " ")}
          </p>
          <p className="t-num text-sm text-ink">
            {active.p.consensus > 0 ? "+" : ""}
            {active.p.consensus.toFixed(2)} consensus
          </p>
          <p className="t-num mt-0.5 text-[0.6875rem] text-muted">
            {active.p.claimCount} claims · {active.p.sourceCount} sources
          </p>
        </div>
      )}
    </div>
  );
}
