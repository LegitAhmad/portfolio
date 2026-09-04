import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio.local"),
  title: {
    default: "Developer Portfolio — Desktop Environment",
    template: "%s | Developer Portfolio",
  },
  description:
    "A personal developer portfolio presented as an interactive browser desktop environment, showcasing software engineering projects, systems architecture, and technical competencies.",
  keywords: [
    "Software Engineer",
    "Systems Architecture",
    "Full-Stack Developer",
    "Portfolio",
    "Next.js",
    "TypeScript",
    "React",
    "Interactive Desktop",
  ],
  authors: [{ name: "Software Engineer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Developer Portfolio Desktop",
    title: "Developer Portfolio — Desktop Environment",
    description:
      "A personal developer portfolio presented as an interactive browser desktop environment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Portfolio — Desktop Environment",
    description:
      "A personal developer portfolio presented as an interactive browser desktop environment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
