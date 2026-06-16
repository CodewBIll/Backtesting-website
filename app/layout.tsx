import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { Navbar } from "@/components/ui/Navbar";
import { ToastProvider } from "@/components/ui/ToastProvider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-display",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TradeLog | Backtesting Journal",
  description: "A private trading journal built to track decisions, expose patterns, and enforce discipline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} bg-[var(--bg-base)] antialiased`}>
        <ToastProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(34,197,94,0.12),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:auto,auto,auto,32px_32px,32px_32px]" />
            <Navbar />
            <main className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
