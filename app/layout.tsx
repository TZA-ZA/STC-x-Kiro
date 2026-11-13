import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Self-hosted via the `geist` package rather than next/font/google.
// Two reasons, both of which matter on hackathon day: the build does not
// depend on fonts.googleapis.com being reachable, and the running app
// makes no third-party request for type — so the demo renders correctly
// on venue wifi that is captive, throttled or blocking.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Topic-specific strings live in lib/content.ts so the whole app re-themes
// from one file on the day. These are the pre-topic placeholders.
export const metadata: Metadata = {
  title: "Drift — evidence-tethered web consensus",
  description:
    "Extracts claims from live sources, tethers every claim to the exact passage it came from, and shows how consensus has moved over time.",
  applicationName: "Drift",
  other: { "format-detection": "telephone=no" },
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
