import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
