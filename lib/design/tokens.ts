/**
 * TypeScript mirror of the CSS theme in app/globals.css.
 *
 * Needed because three.js materials, canvas drawing and GSAP tweens cannot
 * read CSS custom properties cheaply. Any change here must be made in
 * globals.css too — the design-system-guard hook will flag hardcoded hexes
 * in components, which is how they stay in sync.
 */

export const color = {
  void: "#08090B",
  surface: "#0E1013",
  raise: "#14171B",
  line: "rgba(255,255,255,0.07)",
  lineStrong: "rgba(255,255,255,0.14)",
  ink: "#F4F4F1",
  muted: "#878D97",
  faint: "#4A505A",
  signal: "#C3F53C",
  cool: "#5BE4D1",
  warn: "#FF8A4C",
} as const;

/**
 * ── Chart palette ──────────────────────────────────────────────────
 *
 * Deliberately NOT the UI accents. The UI accents (`signal`, `cool`,
 * `warn`) sit at OKLCH L 0.75-0.90, which is correct for text and chrome
 * on a near-black surface but far above the L 0.48-0.67 band that chart
 * marks need in dark mode. Reusing them for fills produces marks that
 * glare and that fail colourblind separation.
 *
 * These values were validated, not chosen by eye. All five checks pass on
 * surface #0E1013 in dark mode: lightness band, chroma floor, CVD
 * separation (ΔE 14.0 worst adjacent, protan), normal-vision floor
 * (ΔE 23.7) and contrast (≥3:1).
 *
 * Note the diverging axis is teal-to-orange, not green-to-orange. Green
 * and orange collapse to near-identical yellows under deuteranopia
 * (measured ΔE 3.2 — a hard fail); teal and orange separate cleanly.
 */
export const chart = {
  /** Diverging poles for stance. Support is cool, opposition is warm. */
  support: "#2E9E8C",
  oppose: "#CC5F1C",
  /** Neutral midpoint. Low chroma is correct here — a diverging midpoint
   *  must read as "no polarity", never as a third hue. */
  neutral: "#6B7280",
  /** Single-hue sequential, light to dark, for magnitude encodings. */
  sequential: ["#CFF0E9", "#8FD6C9", "#4FB8A6", "#2E9E8C", "#1E7366"] as const,
  /** Recessive furniture. Grid must never compete with the marks. */
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.14)",
} as const;

export const ease = {
  /** expo-out — everything entering */
  entry: [0.16, 1, 0.3, 1] as const,
  /** expo-in — everything leaving */
  exit: [0.7, 0, 0.84, 0] as const,
  /** CSS strings for GSAP */
  entryCss: "cubic-bezier(0.16, 1, 0.3, 1)",
  exitCss: "cubic-bezier(0.7, 0, 0.84, 0)",
} as const;

/** Seconds, for motion/GSAP. The CSS tokens are the ms equivalents. */
export const dur = {
  micro: 0.12,
  element: 0.28,
  section: 0.64,
} as const;

/** The only spacing values permitted. See design steering. */
export const space = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

export const radius = {
  card: 10,
  control: 8,
  pill: 999,
} as const;

/** True when the visitor asked for less motion. Safe on the server. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
