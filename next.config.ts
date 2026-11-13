import type { NextConfig } from "next";

/**
 * Two build targets from one codebase:
 *
 *   npm run build        -> Netlify. Server routes, ISR, live scrape mode.
 *   npm run build:pages  -> GitHub Pages. Fully static export under the
 *                           repo subpath, cache-only data.
 *
 * Pages is the backup demo. Having both means a Netlify outage or a bad
 * deploy five minutes before judging is an inconvenience rather than the
 * end of the presentation.
 */

const isPages = process.env.PAGES_EXPORT === "1";
const repo = "STC-x-Kiro";

const nextConfig: NextConfig = {
  // `cacheComponents` is deliberately off: it is incompatible with the
  // route-level `revalidate` the dashboard uses, and a one-day build has
  // no time to spend debugging caching semantics.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  ...(isPages
    ? {
        output: "export" as const,
        // GitHub Pages serves a project site from /<repo>, so every asset
        // and link needs the prefix or the page loads unstyled.
        basePath: `/${repo}`,
        assetPrefix: `/${repo}`,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
