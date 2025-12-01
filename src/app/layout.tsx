// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lireon - Smart Reading Tracker",
    template: "%s | Lireon",
  },
  description:
    "Track your reading progress, build reading streaks, and achieve your literary goals with Lireon - your personal reading companion.",
  keywords: [
    "reading tracker",
    "book tracker",
    "reading goals",
    "reading progress",
    "book journal",
    "reading habits",
    "reading stats",
    "lireon",
  ],
  authors: [{ name: "Lireon Team" }],
  creator: "Lireon",
  metadataBase: new URL("https://lireon.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lireon.vercel.app",
    title: "Lireon - Smart Reading Tracker",
    description:
      "Track your reading progress, build reading streaks, and achieve your literary goals.",
    siteName: "Lireon",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Lireon - Smart Reading Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lireon - Smart Reading Tracker",
    description:
      "Track your reading progress, build reading streaks, and achieve your literary goals.",
    images: ["/preview.png"],
    creator: "@lireon",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#5D6939" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-[#FAF2E5] text-[#5D6939]`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
