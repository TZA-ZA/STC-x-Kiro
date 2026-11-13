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

/** Categorical ramp for data series. Ordered by visual priority:
 *  series 0 is the one the audience should read first. */
export const series = [
  color.signal,
  color.cool,
  "#9AA4B2",
  color.warn,
  "#6C7BE0",
] as const;

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
